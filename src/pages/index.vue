<template lang="pug">
div.relative.h-full(v-if="addresses.length <= 0")
  .flex.items-center.justify-center.h-full.flex.flex-col
    button.btn.btn-primary(@click="loadSampleData") loadSampleData
    .divider OR
    FileInput(v-bind="{updateAddresses, addresses}")

.container.mx-auto.px-2.text-xs(v-else)
  #top.flex.space-x-4.my-4.justify-stretch.carousel
    .carousel-item.space-x-4(v-if="!fileStore.error")
      FileInput(v-bind="{updateAddresses, addresses}")
      button.btn.btn-secondary(@click="fileStore.exportFile") Export
    .flex-1
    .carousel-item.join.ml-auto
      button.join-item.btn(:class="[ currDay === -1 ? 'btn-active':'']" @click="currDay = -1") Все
      button.join-item.btn(v-for="d,i in days" :class="[ currDay === i ? 'btn-active':'']"
        :style="`background: ${currDay === i ? colors[i]:''}; color: ${currDay === i ? 'black':'white'}`"
        @click="currDay = i") {{ d }}
    
    .carousel-item.join
      button.join-item.btn.btn-square(
        @click="activeDaysCardView = true"
        :class="[ activeDaysCardView ? 'btn-active btn-secondary':'']"
        )
        i-ic:outline-view-week.text-2xl
      button.join-item.btn.btn-square(
        @click="activeDaysCardView = false"
        :class="[ !activeDaysCardView ? 'btn-active btn-secondary':'']"
        )
        i-ic:outline-view-list.text-2xl

    button.carousel-item.btn.btn-square(@click="isMapExpanded = !isMapExpanded")
      i-ic:outline-expand-more.text-2xl(v-if="!isMapExpanded")
      i-ic:outline-expand-less.text-2xl(v-if="isMapExpanded")

  div.relative.grid
    .w-full.rounded.overflow-hidden.sticky.top-0(:class="[isMapExpanded ? 'h-[90svh]':'h-[40svh]']")
      YaMap(v-bind="{ addresses }")
    
    DaysCardView(
      v-if="activeDaysCardView"
      v-bind="{ addresses, currDay, colors, days, addressesGroupedByDays }")
    DaysTableView(
      v-else
      v-bind="{ addresses, currDay, colors, days, addressesGroupedByDays }")
    
  
  </template>
  
  <script setup>
  import { storeToRefs } from 'pinia'
  import { useAddressesStore } from 'src/stores/addresses'
  
  const addressesStore = useAddressesStore()
  const { addresses, loadSampleData, colors, days, centroids, updateAddresses } = addressesStore
  const { currDay, addressesGroupedByDays } = storeToRefs(addressesStore)

  import { useFileStore } from 'src/stores/file'
  const fileStore = useFileStore()

  const isMapExpanded = ref(false)

  const activeDaysCardView = ref(true)


  </script>
  
  <style lang="sass">
  .ghost
    opacity: 0.5
  .no-drop *
    @apply cursor-no-drop
  .hint
    position: absolute
    padding: 4px
    background: white
    border: 1px solid black
    white-space: nowrap
    opacity: 0.7
    transform: translate(8px, -50%)
  </style>
  
  <style scoped>
  .bounds {
    user-select: all;
  }
  
  .marker {
    background: var(--background);
    border-radius: 100%;
    width: 20px;
    height: 20px;
  }
  
  
  .cluster {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    background: green;
    color: #fff;
    border-radius: 100%;
    cursor: pointer;
    border: 2px solid limegreen;
    outline: 2px solid green;
  }
  </style>