<script setup lang="ts">
import { ref, computed } from 'vue';
import LayoutVirtual from 'vue-layout-virtual';
import type { ILayoutVirtual } from 'layout-virtual/types';

const styling = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

type Data = { i: number };

const headers = [
  'One line header.',
  'Longer header, wraps to the next lines.',
];

const descriptions = [
  'A very short description.',
  'A much longer description text that wraps to the next lines at different card sizes.',
];

const data = Array.from({ length: 1000 }, (_, i): Data => ({ i }));
const startIndex = ref(0);
const endIndex = ref(0);
const total = computed(() => endIndex.value - startIndex.value + 1);

const getApi = (api: ILayoutVirtual) => {
  api.on('onAfterItemsRendered', (start, end) => {
    startIndex.value = start;
    endIndex.value = end;
  });
};
</script>

<template>
  <h4>Try to resize the container and scroll.</h4>
  <div>Rendered indeces {{ startIndex }} - {{ endIndex }}, total {{ total }} of {{ data.length }}.</div>
  <layout-virtual :overscanHeight="100" :data="data" v-bind="styling" :get-api="getApi">
    <template #renderItem="{ data: itemData, ref, index }">
      <div :ref="ref" class="list-item" :id="`item-${itemData.i}`" :data-index="index">
        <div class="li-icon">📁</div>
        <div class="li-index">{{ `#${itemData.i}` }}</div>
        <div class="li-header">{{ itemData.i % 2 ? headers[0] : headers[1] }}</div>
        <div class="li-description">{{ itemData.i % 2 ? descriptions[0] : descriptions[1] }}</div>
      </div>
    </template>
  </layout-virtual>
</template>