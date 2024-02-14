<template lang="pug">
//- .file-loader
  input(
    class="file-input w-full max-w-xs"
    type="file"
    @change="getFileInputValue"
    accept="xlsx/*"
    capture
    )
  button.btn(@click="exportFile") Export
</template>

<script setup>

import { read, writeFileXLSX, utils } from "xlsx"

const props = defineProps({
  modelValue: Array,
})

const emit = defineEmits(['update:modelValue'])
// const data = useVModel(props, 'data', emit)
const data = useVModel(props, 'modelValue', emit)
// console.log(data);

// const data = ref()

// async function getFileInputValue(e) {
//   const target = e.target
//   if (target && target.files) {
//     const file = target.files[0]
//     let ab = await file.arrayBuffer()
//     const wb = read(ab);
//     const ws = wb.Sheets[wb.SheetNames[0]];
//     console.log(wb, ws);
//     const ws_data = utils.sheet_to_json(ws);
//     const titles = ['ID ТТ', 'Сеть', 'Адрес', 'План']
//     const titles_rename = ['idtt', 'store', 'address', 'visit_frequency']
//     // const header = {
//     //   idtt: 'ID ТТ',
//     //   store: 'Сеть',
//     //   address: 'Адрес',
//     //   visit_frequency: 'План'
//     // }
//     // data.value = ws_data
//     const d = ws_data.map(el => {
//       let d = {}
//       Object.entries(el).forEach(([k, v]) => {
//         const id = titles.indexOf(k)
//         if (id > -1)
//           d[titles_rename[id]] = v
//           // console.log({k,v});
//       })
//       return d
//     })
//     .filter(el => el.idtt > 0)

//     // Object.assign(data, d)
//     data.value = d

//     console.log({data.value});
//   }
// }

function exportFile() {
  /* generate worksheet from state */
  const ws = utils.json_to_sheet(data.value);
  /* create workbook and append worksheet */
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");
  /* export to XLSX */
  writeFileXLSX(wb, "out.xlsx");
}

</script>