import { defineStore } from 'pinia'
import { read, writeFileXLSX, utils } from "xlsx"

import { useAddressesStore } from 'src/stores/addresses'
import { errorMessages } from 'vue/compiler-sfc';

console.log(import.meta.env.VITE_YAAPI);
async function fetchYandexMaps(str) {
  
  const apiKey = import.meta.env.VITE_YAAPI; // YANDEX API
  const apiUrl = `https://search-maps.yandex.ru/v1/?type=geo&lang=Ru_RU&apikey=4e3567e5-9ea1-47ec-89d0-a09424478672&text=${str}`

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.statusCode !== 200) {
      return {error: data.error}
    }
    return data
  } catch (error) {
    // console.error('Error:', error);
    return {error}
  }
}

const locateAddress = async (address) => {
  let res = await fetchYandexMaps(`Москва, ${address.address}`)
  // console.log({res}, `${address.store} ${address.address}`);
  // address.geocode = res.GeoObjectCollection.featureMember[0].GeoObject
  // address.ya = res.features[0]
  if (res.error) {
    return {error: res.error}
  }
  return res.features[0]
}


function parseFileInput(json) {
  const excel_fields = [ 'ID ТТ', 'Код ТТ', 'Сеть', 'Адрес', 'План']
  const obj_fields = [ 'id_tt', 'code_tt', 'store', 'address', 'visit_frequency']

  const filteredJson = json.filter(d => d['ID ТТ'] > 0)

  const result = filteredJson.map(d => {
    const obj = {}
    for (const [key, value] of Object.entries(d)) {
      if (excel_fields.includes(key)) {
        obj[obj_fields[excel_fields.indexOf(key)]] = value
      }
    }
    return obj
  })
  return result
}

export const useFileStore = defineStore('file', () => {
  const addressesStore = useAddressesStore()
  const { addresses, loadSampleData, colors, days, centroids, updateAddresses } = addressesStore

  const file = ref(null)
  const error = ref(null)
  const parseProgress = ref(0)
  const isLoading = computed(() => parseProgress.value > 0)

  const { files, open, reset, onChange } = useFileDialog({
    accept: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel', // Set to accept only image files
    directory: false, // Select directories instead of files if set true
  })
  
  
  onChange((files) => {
    // fileStore.onChangeFileInput(files)
    file.value = files[0]
    const reader = new FileReader()

    reader.onload = async (e) => {
      const data = e.target.result
      const workbook = read(data, { type: 'binary' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = utils.sheet_to_json(worksheet)
  
      let parsedAddresses = parseFileInput(json)
      let totalParseCount = parsedAddresses.length
  
      for (const [i, addr] of parsedAddresses.entries()) {
        try {
          let res = await locateAddress(addr)
          if (res.error) {
            error.value = res.error
            break
          }
          addr.ya = res
          parseProgress.value = (i + 1) / totalParseCount * 100
        } catch (error) {
          error.value = error
          break
        }
      }
      parseProgress.value = 0
      if (error.value)
        return
      updateAddresses(parsedAddresses)
    }
    reader.readAsBinaryString(file.value)
  })
  
  // function onChangeFileInput(e) {
  //   file.value = e.target?.files[0] || e[0]
  //   const reader = new FileReader()

  //   reader.onload = async (e) => {
  //     const data = e.target.result
  //     const workbook = read(data, { type: 'binary' })
  //     const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  //     const json = utils.sheet_to_json(worksheet)
  
  //     let parsedAddresses = parseFileInput(json)
  //     let totalParseCount = parsedAddresses.length
  
  //     for (const [i, addr] of parsedAddresses.entries()) {
  //       addr.ya = await locateAddress(addr)
  //       parseProgress.value = (i + 1) / totalParseCount * 100
  //     }
  //     parseProgress.value = 0
  //     updateAddresses(parsedAddresses)
  //   }
    
  //   reader.readAsBinaryString(file.value)
  // }

  function exportFile() {
    const wb = utils.book_new()
    const ws = utils.json_to_sheet(addresses)
    utils.book_append_sheet(wb, ws, 'Sheet1')
    writeFileXLSX(wb, 'addresses.xlsx')
  }
  
  return { file, open, parseProgress, isLoading, exportFile, error }
})