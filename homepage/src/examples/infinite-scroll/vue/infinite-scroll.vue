<script setup lang="ts" generic="T">
import { ref, computed, shallowRef } from 'vue';
import LayoutVirtual from 'vue-layout-virtual';
import type { VirtualizedListVueClasses } from 'vue-layout-virtual';

const styling: VirtualizedListVueClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

const SHOW_LOADER = Symbol('show-loader');
type Post = { title: string; body: string } | typeof SHOW_LOADER;

const loadedUrls = shallowRef(new Set<string>());
const data = ref<Post[]>([]);
const dataLimit = ref(100);
const isLoading = ref(false);

const listData = computed(() =>
  isLoading.value ? data.value.concat(SHOW_LOADER) : data.value
);

const startIndex = ref(0);
const endIndex = ref(0);
const total = computed(() => endIndex.value - startIndex.value + 1);

function loadMore(limit: number, skip: number) {
  const apiUrl = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}&select=title,body`;
  if (loadedUrls.value.has(apiUrl)) return;

  isLoading.value = true;
  loadedUrls.value.add(apiUrl);
  console.log('will fetch', apiUrl);

  fetch(apiUrl)
    .then(response => response.json())
    .then(result => {
      dataLimit.value = result.total;
      data.value = data.value.concat(result.posts);
    })
    .catch(console.error)
    .finally(() => { isLoading.value = false; });
}

function onAfterRender(start: number, end: number) {
  console.log('onAfterItemsRendered', start, end);
  if (end === data.value.length - 1 && end < dataLimit.value - 1 && !isLoading.value) {
    console.log('will try to fetch data');
    loadMore(10, data.value.length);
  }
  startIndex.value = start;
  endIndex.value = end;
}
</script>

<template>
  <h4>Try resizing the container and scroll.</h4>
  <div>
    Rendered indices {{ startIndex }} - {{ endIndex }}, total {{ total }}.
    Loaded {{ data.length }} of {{ dataLimit }}.
  </div>
  <layout-virtual :overscan-height="200" :data="listData" v-bind="styling" @after-items-rendered="onAfterRender">
    <template #renderItem="{ data: itemData, index }">
      <div v-if="itemData === SHOW_LOADER" class="loader-container" :data-index="index">
        <div class="loader" />
      </div>
      <div v-else class="article-card" :data-index="index">
        <span class="ac-index">{{ index }}</span>
        <h3 class="ac-title">{{ (itemData as { title: string; body: string }).title }}</h3>
        <p class="ac-body">{{ (itemData as { title: string; body: string }).body }}</p>
        <button class="ac-button">Learn more</button>
      </div>
    </template>
  </layout-virtual>
</template>