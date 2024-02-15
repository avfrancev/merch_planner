<template lang="pug">
div.relative.h-full(v-if="addresses.length <= 0")
  .flex.items-center.justify-center.h-full.flex.flex-col
    button.btn.btn-primary(@click="loadSampleData") loadSampleData
    .divider OR
    FileInput(v-bind="{updateAddresses, addresses}")

.container.mx-auto.px-2.text-xs(v-else)
  #top.flex.space-x-2.my-4.justify-stretch.carousel
    
    .carousel-item(v-if="addresses.length > 0")
      FileInput(v-bind="{updateAddresses, addresses}")
      //- button.btn.btn-error(@click="exportFile") Export
    .flex-1
    .carousel-item.join.ml-auto
      button.join-item.btn(:class="[ currDay === -1 ? 'btn-active':'']" @click="currDay = -1") Все
      button.join-item.btn(v-for="d,i in days" :class="[ currDay === i ? 'btn-active':'']"
        :style="`background: ${currDay === i ? colors[i]:''}; color: ${currDay === i ? 'black':'white'}`"
        @click="currDay = i") {{ d }}
    
    .carousel-item.join
      button.join-item.btn(
        @click="activeDaysCardView = true"
        :class="[ currDay === -1 ? 'btn-active':'']"
        ) 1
      button.join-item.btn(
        @click="activeDaysCardView = false"
        ) 2


    //- button.btn.btn-error(@click="exportFile") Export

  div.relative.grid
    .w-full.rounded.overflow-hidden.sticky.top-0(:class="[isMapExpanded ? 'h-screen':'h-[40svh]']")
      YaMap(v-bind="{ addresses }")
    
    DaysCardView(
      v-if="activeDaysCardView"
      v-bind="{ addresses, currDay, colors, days, addressesGroupedByDays }")
    DaysTableView(
      v-else
      v-bind="{ addresses, currDay, colors, days, addressesGroupedByDays }")
    
  
  </template>
  
  <script setup>
  // import useKMean from 'src/composables/kmean.js'
  import { storeToRefs } from 'pinia'
  import { useAddressesStore } from 'src/stores/addresses'
  
  const addressesStore = useAddressesStore()
  const { addresses, loadSampleData, colors, days, centroids, updateAddresses } = addressesStore
  const { currDay, addressesGroupedByDays } = storeToRefs(addressesStore)
  // loadSampleData()
  
  // const addresses2 = reactive([])
  // const addresses = reactive(aaa)
  const fileData = ref([])

  const isMapExpanded = ref(false)

  const activeDaysCardView = ref(true)
  
  // const kmean = useKMean(addresses)
  // kmean.updateKMean()
  
  
  const clickGenPlan = () => {
    Object.assign(plan, generatePlan(addresses))
  }
  
  
  
  async function searchYandexMaps(str) {
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
  
  async function getGeocode(address) {
    // const apiKey = 'a0212be8-caa5-4f01-8dc3-9ec59a4348bb'; // YANDEX API
    // const apiUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=`;
    // const apiUrl = `https://search-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&text=`;
    // const apiUrl = `https://search-maps.yandex.ru/v1/?text=Bank Alfalah&type=biz&lang=en_US&apikey=${apiKey}`
                    // https://search-maps.yandex.ru/v1/?text=Bank%20Alfalah&type=biz&lang=en_US&apikey=4e3567e5-9ea1-47ec-89d0-a09424478672
    let geocode = null;
  
    try {
        const response = await fetch(`${apiUrl}${encodeURIComponent(address)}`);
        const data = await response.json();
        console.log(data);
        if (data && data.response) {
          geocode = data.response
        }
    } catch (error) {
      console.error('Error:', error);
    }
  
    return geocode;
  }
  
  
  
  const locateAddress = async (el) => {
    let res = await searchYandexMaps(`Москва, ${el.address}`)
    // console.log({res}, `${el.store} ${el.address}`);
    // el.geocode = res.GeoObjectCollection.featureMember[0].GeoObject
    el.ya = res.features[0]  
  }
  
  
  async function fillCoordinates() {
    // for (const item of addresses.slice(0, 3)) {
      console.log('-------------', addresses.length);
      for (const [i, item] of addresses.entries()) {
        await locateAddress(item)
        await new Promise((resolve) => setTimeout(resolve, 300));
        console.log(i);
      }
  
      // let o = []
      // o = addresses.map((d) => {
      //   let { store, address, ya, visit_frequency, cluster, day, x, y } = d
      //   return {
      //     store, address, ya, visit_frequency, cluster, day, x, y
      //   }
      // })
      // console.log(o);
    // console.log(toRaw(addresses));
    // console.log(JSON.stringify((addresses), null, 2));
  
  }
  
  // watch(plan, (newVal, oldVal) => {
  //   // mmm.value = newVal
  //   console.log(newVal, oldVal);
  // })
  
  // function handleDayChange(e) {
  //   console.log(e);
  //   if (e.added) {
  //     addresses.forEach((d) => {
  
  //     })
  //   }
  // }

  
  // function handleMove(e) {
  //   const list = e.relatedContext.list
  //   const el = e.draggedContext.element
  //   let fromDay = +e.from.dataset.dayId
  //   let toDay = +e.to.dataset.dayId
  //   // console.log(e);
  //   canDrop = true
  //   if (fromDay !== toDay && list.includes(el)) {
  //     // e.originalEvent.target.classList.add('no-drop');
  //     canDrop = false
  //     return false;
  //   }
  //   return true
  // }

  // function handleDropEnd(e, ee) {
  //   isDragging.value = false
  //   let fromDay = +e.from.dataset.dayId
  //   let toDay = +e.to.dataset.dayId
  //   // console.log({fromId, toId});
  //   canDrop = true

  //   let a = addresses.find(el => el.iid === e.item.id)
  //   if (a) {
  //     // console.log(fromId);
  //     let fromDayId = a.days.indexOf(fromDay)
  //     // toDayId = a.days.indexOf(toDay)
  //     a.days[fromDayId] = toDay
  //     onAddrPointerEnter(a)
  //     // a.days.splice(fromDayId, 1)
  //     // a.days.splice(toDayId, 0, fromDay)
      
  //   }
  //   // console.log(e.item.id);
  // }
  
  
  
  
  // function handleDayChange__(e) {
  //   if (e.added) {
  //     // let id = addresses.indexOf(e.added.element)
  //     nextTick(() => {
  //       let newGroupId = 0
  //       for (let i = 0; i < plan.length; i++) {
  //         // const element = plan[i];
  //         const isExist = plan[i].includes(e.added.element)
  //         if (isExist)
  //           newGroupId = i
  //       }
  //       console.log(e.added, newGroupId)
  //       e.added.element.day = newGroupId
  //     })
  //     // let id2 = plan.flat().indexOf(e.added.element)
  //     // console.log(addresses[id], id,id2);
  //     // console.log(plan[id2], id,id2);
  //     // e.added.element.day = e.added.newIndex
  //   }
  // }
  
  // function scrollToAddr(addr) {
  //   // addresses.forEach((a) => a.hovered = false)
  //   // addr.hovered = true
  //   addr.li.scrollIntoView({ behavior: 'smooth' })
  // }
  
  // function onAddrPointerEnter(addr) {
  //   // console.log(addr);
  //   addresses.forEach((a) => a.isHovered = false)
  //   if (!isDragging.value)
  //     addr.isHovered = true
  // }
  
  // function onAddrOver(addr) {
  //   // console.log(addr)
  //   addresses.forEach((a) => a.isHovered = false)
  //   addr.isHovered = true
  // }
  

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