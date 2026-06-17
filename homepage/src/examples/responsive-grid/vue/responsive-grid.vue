<script setup lang="ts">
import { ref, computed } from 'vue';
import LayoutVirtual from 'vue-layout-virtual';

const styling = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

type Data = { i: number; image?: string; title: string; excerpt: string };

const titles = [
  'Windowing 101',
  'Recycling DOM nodes without losing scroll position',
  'Dynamic item heights',
  'Why measure when the browser already knows? What is measuring and how and why it works?',
  'Smooth scrolling through ten thousand rows',
  'Overscan: rendering a little more than you see',
  'From fixed-size lists to fully dynamic grids',
];

const excerpts = [
  'Render only what fits.',
  'Recycling pools reuse existing nodes instead of mounting and unmounting on every scroll event.',
  'Dynamic heights mean no upfront measurement pass and no layout thrashing as items resize.',
  'A short primer on how virtualization keeps memory and paint cost flat regardless of list length.',
  'Scrolling through a long feed should feel the same whether it has a hundred items or a hundred thousand, and that consistency comes from windowing the visible range and letting everything else stay unmounted until it is needed, then recycling the freed nodes for whatever scrolls into view next.',
];

const data = Array.from({ length: 1000 }, (_, i): Data => ({
  i,
  image: i % 3 ? undefined : `https://picsum.photos/seed/${i}/400/240`,
  title: titles[i % titles.length],
  excerpt: excerpts[i % excerpts.length],
}));
const startIndex = ref(0);
const endIndex = ref(0);
const total = computed(() => endIndex.value - startIndex.value + 1);

const updateStats = (start: number, end: number) => {
  startIndex.value = start;
  endIndex.value = end;
};
</script>

<template>
  <h4>Try resizing the container and scroll.</h4>
  <div>Rendered indices {{ startIndex }} - {{ endIndex }}, total {{ total }} of {{ data.length }}.</div>
  <layout-virtual :overscanHeight="200" :data="data" v-bind="styling" @after-items-rendered="updateStats">
    <template #renderItem="{ data: itemData, index }">
      <div class="article-card" :data-index="index">
        <div class="ac-index">{{ `#${itemData.i}` }}</div>
        <img v-if="itemData.image" class="ac-image" :src="itemData.image" alt="" loading="lazy">
        <div class="ac-body">
          <h3 class="ac-title">{{ itemData.title }}</h3>
          <p class="ac-excerpt">{{ itemData.excerpt }}</p>
          <button class="ac-button">Learn more</button>
        </div>
      </div>
    </template>
  </layout-virtual>
</template>