<template lang="pug">
pre table view
table.table.table-xs.-z-10
  thead
    tr
      td Store
      td Address
      td(v-for="d in days") {{ d }}
  tbody
    tr(v-for="addr,i in addresses")
      td {{ addr.store }}
      td {{ addr.address }}
      td(
        @click=""
        v-for="d,i in days") {{ addr.days.includes(i) ? '1':'' }}
//- .carousel.w-full.box-border.space-x-4.justify-stretch.mt-6.mb-6(
  :class="[canDrop ? '':'no-drop']"
  )
  .carousel-item.rounded.flex.flex-col.flex-1.min-w-52.border-2.box-border(
    v-for="d,i in addressesGroupedByDays"
    :class="[currDay == i ? 'border-accent':'border-neutral']"
    :style="{ borderColor: colors[currDay == i ? currDay : -1] }"
    class=""
    )
    .flex.items-baseline.justify-between.space-x-2.px-4.py-4
      .flex.items-center
        .inline-block.rounded-full.h-4.w-4.mr-2(:style="{ background: colors[i] }") 
        .font-bold.text-xl.uppercase {{days[i]}}
      span Точек: {{ d.length }}
    .divider.divider-neutral.my-0.h-0
    draggable.my-2.h-full(
      v-model="addressesGroupedByDays[i]"
      v-bind="dragOptions"
      itemKey="address"
      tag="ul"
      :move="handleMove"
      @start="isDragging = true"
      @end="handleDropEnd"
      :data-day-id="i"
    )
      template(#item="{ element, index }")
        //- @pointerover="onAddrOver(element)"
        li(
          :id="element.iid"
          :ref="(el) => element.li = el"
          @pointerleave="element.isHovered = false"
          @pointerenter="onAddrPointerEnter(element)"
          @click="() => console.log(element)"
          )
          div.flex.p-2.space-x-2(
            class="transition rounded mx-2 p-2 select-none"
            :class="{ 'bg-neutral': element.isHovered }"
            )
            //- span {{ element.canDrag }}
            .h-4.w-4.rounded-full.flex-none(:style="{...element.pieChartStyles}")
            .flex-1 {{ element.address }}
            //- span.text-xs [{{ element.iid }}]
            //- span.text-lg [{{ element.visit_frequency }}]
            //- span.text-nowrap.text-lg {{ element.days }}


</template>

<script setup>

import draggable from "vuedraggable"


const props = defineProps({
  addresses: Array,
  addressesGroupedByDays: Object,
  canDrop: Boolean,
  currDay: Number,
  colors: Array,
  days: Array,
  isDragging: Boolean,
})

const { currDay, colors, days, addressesGroupedByDays } = toRefs(props)
const { addresses } = props


// const emits = defineEmits(['update:isDragging', 'update:canDrop'])
// const isDragging = useVModel(props, 'isDragging', emits)
// const canDrop = useVModel(props, 'canDrop', emits)
const isDragging = ref(false)
const canDrop = ref(true)


const dragOptions = {
          animation: 200,
          group: "description",
          disabled: false,
          forceFallback: true,
          ghostClass: "ghost"
        };


function handleMove(e) {
    const list = e.relatedContext.list
    const el = e.draggedContext.element
    let fromDay = +e.from.dataset.dayId
    let toDay = +e.to.dataset.dayId
    // console.log(e);
    canDrop.value = true
    if (fromDay !== toDay && list.includes(el)) {
      // e.originalEvent.target.classList.add('no-drop');
      canDrop.value = false
      return false;
    }
    return true
  }

function handleDropEnd(e, ee) {
  isDragging.value = false
  let fromDay = +e.from.dataset.dayId
  let toDay = +e.to.dataset.dayId
  // console.log({fromId, toId});
  canDrop.value = true

  let a = addresses.find(el => el.iid === e.item.id)
  if (a) {
    // console.log(fromId);
    let fromDayId = a.days.indexOf(fromDay)
    // toDayId = a.days.indexOf(toDay)
    a.days[fromDayId] = toDay
    onAddrPointerEnter(a)
    // a.days.splice(fromDayId, 1)
    // a.days.splice(toDayId, 0, fromDay)
    
  }
  // console.log(e.item.id);
}

function onAddrPointerEnter(addr) {
    // console.log(addr);
  addresses.forEach((a) => a.isHovered = false)
  if (!isDragging.value)
    addr.isHovered = true
}
</script>