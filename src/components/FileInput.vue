<template lang="pug">
//- pre {{ fileStore.error }}
div.text-error(v-if="fileStore.error") {{ fileStore.error }}
.file.flex.items-center(v-else)
  //- button(@click="open") Choose file
  progress(
    v-if="fileStore.isLoading"
    class="progress w-56" :value="fileStore.parseProgress" max="100")
    //- v-model="fileStore.file"
  .flex.items-center.space-x-2(v-else)
    button.btn(@click="fileStore.open") Choose file
    span(
      v-if="fileStore.file"
      @click="open") {{ fileStore.file.name || '' }}
</template>

<script setup>

import { useFileStore } from 'src/stores/file'
const fileStore = useFileStore()

</script>