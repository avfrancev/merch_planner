<template lang="pug">
.file-loader.flex.flex-col.items-center(v-if="parseCounter > 0")
  .loading.loading-spinner.loading-lg
  .text-4xl.mt-6 {{ ((parseCounter / totalParseCount * 100) || 0).toFixed(0) }}%
.file-loader(v-else)
  input(
    class="file-input w-full max-w-xs file-input-bordered"
    type="file"
    @change="getFileInputValue"
    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
    capture
    )
  button.btn.btn-success.ml-2(
    v-if="props.addresses.length > 0"  
    @click="exportFile") Export
</template>

<script setup>

import { filter } from "d3-array";
import { read, writeFileXLSX, utils } from "xlsx"

const props = defineProps({
  updateAddresses: Function,
  addresses: {
    type: Array,
    default: () => [],
  },
})

const parseCounter = ref(0)
const totalParseCount = ref(0)

async function fetchYandexMaps(str) {
  const apiKey = '4e3567e5-9ea1-47ec-89d0-a09424478672'; // YANDEX API
  const apiUrl = `https://search-maps.yandex.ru/v1/?type=geo&lang=Ru_RU&apikey=4e3567e5-9ea1-47ec-89d0-a09424478672&text=${str}`

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
    // if (data && data.response) {
    // geocode = data.response
    // }
    return data
  } catch (error) {
    console.error('Error:', error);
  }
}

const locateAddress = async (address) => {
  let res = await fetchYandexMaps(`Москва, ${address.address}`)
  // console.log({res}, `${address.store} ${address.address}`);
  // address.geocode = res.GeoObjectCollection.featureMember[0].GeoObject
  address.ya = res.features[0]
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

function getFileInputValue(e) {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = async (e) => {
    const data = e.target.result
    const workbook = read(data, { type: 'binary' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = utils.sheet_to_json(worksheet)

    let parsedAddresses = parseFileInput(json)
    totalParseCount.value = parsedAddresses.length

    for (const [i, addr] of parsedAddresses.entries()) {
      await locateAddress(addr)
      parseCounter.value += 1
    }
    
    parseCounter.value = 0

    console.log(parsedAddresses);
    props.updateAddresses(parsedAddresses)

    
  }
  reader.readAsBinaryString(file)
}


function exportFile() {
  /* generate worksheet from state */

  let o = addresses.map(a => {
    const { store, address } = a
    let ggg = {}
    let ddd = days.forEach((d, i) => {
      ggg[d] = a.days.includes(i) ? '1':''
      // return {
      //   [d]: a.days.includes(i),
      // }
    })
    return {
      store, address,
      // day: a.days.map(d => days[d]).join(', ')
      ...ggg,
    }
  })
  console.table(o);    
  
  const ws = utils.json_to_sheet(o);
  /* create workbook and append worksheet */
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");
  /* export to XLSX */

  writeFileXLSX(wb, "out.xlsx");
}


// function exportFile() {
//   /* generate worksheet from state */
//   const ws = utils.json_to_sheet(data.value);
//   /* create workbook and append worksheet */
//   const wb = utils.book_new();
//   utils.book_append_sheet(wb, ws, "Data");
//   /* export to XLSX */
//   writeFileXLSX(wb, "out.xlsx");
// }



</script>