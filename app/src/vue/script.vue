<script setup lang="ts">
import { ref, computed } from 'vue';
import VirtualizedListVue, { type VirtualizedListVueClasses } from 'vue-layout-virtual';
import type { ILayoutVirtual } from 'layout-virtual/types';

const itemsCount = Number(new URLSearchParams(window.location.search).get('itemsCount')) || 1000;
const styling: VirtualizedListVueClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

type Data = { i: number };

const data = ref(Array.from({ length: itemsCount }, (_, i): Data => ({ i })));
const insertionIndex = ref(data.value.length - 1);
const startIndex = ref(0);
const endIndex = ref(0);
const total = computed(() => endIndex.value - startIndex.value + 1);

function extraLines(i: number) {
  return i % 5 === 0 ? ['Second line.', 'Third line.', 'Fourth line.'] :
         i % 3 === 0 ? ['Second line.', 'Third line.'] :
         i % 2 === 0 ? ['Second line.'] :
         [];
}

function addItem() {
  data.value = data.value.slice(0, insertionIndex.value).concat(
    { i: data.value.length },
    data.value.slice(insertionIndex.value),
  );
}

const getApi = (api: ILayoutVirtual) => {
  api.on('onAfterItemsRendered', (start, end) => {
    startIndex.value = start;
    endIndex.value = end;
  });
};
</script>

<template>
  <div>Rendered indices {{ startIndex }} - {{ endIndex }}, total {{ total }} of {{ data.length }}.</div>
  <VirtualizedListVue :data="data" :overscan-height="100" v-bind="styling" :get-api="getApi">
    <template #renderItem="{ data, index, ref }">
      <div :ref="ref" class="list-item" :id="`item-${data.i}`" :data-index="index">
        Item {{ data.i }}.
        <div v-for="(text, idx) in extraLines(data.i)" :key="idx">{{ text }}</div>
      </div>
    </template>
  </VirtualizedListVue>
  <div>
    <button @click="addItem">Add item</button>
    <label for="insertion-index">At index:</label>
    <input id="insertion-index" v-model.number="insertionIndex" type="number" :min="0" :max="data.length" />
  </div>
</template>
