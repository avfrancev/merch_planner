<template lang="pug">
.file-loader
  input(
    class="file-input w-full max-w-xs"
    type="file"
    @change="getFileInputValue"
    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
    capture
    )
  button.btn(@click="exportFile") Export
</template>

<script setup>

import { read, writeFileXLSX, utils } from "xlsx"

const props = defineProps({
  updateAddresses: Function,
})

// const emit = defineEmits(['update:modelValue'])
// const data = useVModel(props, 'data', emit)
// const data = useVModel(props, 'modelValue', emit)
// console.log(data);

function getFileInputValue(e) {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = e.target.result
    const workbook = read(data, { type: 'binary' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = utils.sheet_to_json(worksheet)

    console.log(json);
    // emit('update:modelValue', json)
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