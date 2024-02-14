<template lang="pug">
yandex-map(:settings="{location: {center: [addresses[0].x, addresses[0].y], zoom: 12.3,}}")
  yandex-map-default-scheme-layer
  yandex-map-default-features-layer

  //- v-for="(addr, i) in filteredAddresses" :key="i"
  yandex-map-marker(
    v-for="(addr, i) in addresses" :key="i"
    position="center left-center"
    :settings="{ coordinates: [addr.x, addr.y], properties: { hint: `${addr.address}` } }"
    )
    //- .mask.mask-squircle
    //- pre {{ addr.store.toLowerCase() }}
    //- button.btn
    //- .h-10.w-10
      //- a(:href="`#${addr.id}`")
      a(
        @click="scrollToAddr(addr)"
        @pointerover="onAddrOver(addr)"
        @pointerout="addr.hovered = false"
        )
        img.bg-transparent.mask1.mask-squircle1.rounded-lg(
          class="border-2 border-red-500"
          :class="addr.hovered ? 'border-primary':''"
          :src="`${addr.store.toLowerCase()}.png`")
    //- .absolute(class="1left-1/2 1-bottom-2")
      .h-1.w-1.rounded.bg-error(style="left: 0%; transform: translateX(-50%)")
    //- div.absolute
    //- .absolute2
      PieChart.rounded-full.h-5.w-5.shadow-lg(v-bind="{days: addr.days, colors}" style="left: 0%; transform: translate(0%,50%)")
    .absolute(
      class="left-1/2 -bottom-2 transform-gpu transition border rounded-full"
      :class="[addr.isHovered ? 'scale-150 z-10 border-neutral':'scale-100 -z-1 border-transparent']"
      @pointerenter="addr.isHovered = true"
      @pointerleave="addr.isHovered = false"
      @click="addr.li.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })"
      )
      .h-6.w-6.rounded-full.shadow-lg1(
        :style="{...addr.pieChartStyles, transform: `translate(0%,0%)`}"
        :class="[addr.isInDay ? 'opacity-100':'opacity-30']"
        )

    //- .tooltip.tooltip-open.tooltip-primary(data-tip="error")
    //- button.block.h-auto.btn.btn-secondary.py-2 {{addr.address}}
  //- yandex-map-marker(
    v-for="(addr, i) in kmean.centroids" :key="i"
    class="transition"
    :container-attrs="{ 'class': `transition` }"
    position="top left-center"
    :settings="{ coordinates: [addr.x, addr.y], properties: { hint: `${addr.address}` }, }"
    )
    .absolute(class="left-1/2 -bottom-2")
      .h-8.w-8.rounded-full.bg-success.border.border-black(style="left: 0%; transform: translateX(-50%)")
    
  //- YandexMapClusterer(zoom-on-cluster-click)
  //- YandexMapCollection(zoom-on-cluster-click)
    //- template(v-for="(addr, i) in addresses" :key="i")
    YandexMapDefaultMarker(
      v-for="(addr, i) in filteredAddresses" :key="i"
      :settings="{ coordinates: [addr.x, addr.y], properties: { hint: `${addr.address} [ ${addr.store} ]` } }"
      )
      //- :position="`left-center top`"
      template
        div asdasdasd!!
    template(#cluster="{ length }")
      .cluster {{ length }}
  YandexMapHint(hint-property="hint")
    template(#default="{ content }")
      div.hint {{ content }}
</template>

<script setup>
import {
  YandexMap, YandexMapDefaultSchemeLayer, YandexMapDefaultFeaturesLayer, YandexMapClusterer,
  YandexMapHint, YandexMapDefaultMarker, YandexMapMarker, YandexMapCollection
} from 'vue-yandex-maps';


const props = defineProps({
  addresses: Array
})

const handleMove = (addr) => {
  console.log(addr);

}

</script>