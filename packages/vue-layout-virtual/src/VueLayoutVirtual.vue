/**
 * @fileoverview VirtualizedList Vue component.
 * @license MIT
 * @author Alexandr Kalabin
 */

<script setup lang="ts" generic="T">
import { onMounted, onUnmounted, ref, watch, watchEffect, type Ref } from 'vue';
import { LayoutVirtual, DynamicListLayout } from 'layout-virtual/core';
import VueRenderer from './VueRenderer';
import type { VirtualizedListVueProps, ListItemProps } from './types';
import type { LayoutVirtualEventsArray } from 'layout-virtual/types';

defineOptions({ inheritAttrs: false });
const props = defineProps<VirtualizedListVueProps<T>>();
const { overscanHeight = 200, scrollerRef } = props;
const { scrollerClass, viewportClass, contentLayerClass } = props;
const containerRef = ref<HTMLDivElement>();
const scrollHeightFillerRef = ref<HTMLDivElement>();
const viewportContainerRef = ref<HTMLDivElement>();
const scrollCanvasRef = ref<HTMLDivElement>();
const topSpacerRef = ref<HTMLDivElement>();
const contentLayerRef = ref<HTMLDivElement>();
const bottomSpacerRef = ref<HTMLDivElement>();
const visibleItems = ref<ListItemProps<T>[]>();
const renderedRangeRefPool = new Map<number, Ref<HTMLElement | undefined>>();
const setVisibleItems = (items: ListItemProps<T>[]) => { console.log('setVisibleItems:', items); visibleItems.value = items; };
const getRef = (index: number) => renderedRangeRefPool.get(index) || renderedRangeRefPool.set(index, ref()).get(index);
const externalScrollerClassHolder = ref<HTMLElement>();

watch(externalScrollerClassHolder, () => {
  const scroller = scrollerRef?.value;

  if (scroller) {
    scroller.classList.add(externalScrollerClassHolder?.value?.className || '');
  }
});

let renderer: VueRenderer<T> | undefined;
let list: LayoutVirtual<T> | undefined;

const setEventListeners = () => {
  (Object.entries(props) as LayoutVirtualEventsArray).forEach(([propName, propValue]) => {
    if (propName.startsWith('on')) {
      list?.setEventListener(propName, propValue);
    }
  });
};

onMounted(() => {
  renderer = new VueRenderer({
    container: scrollerRef?.value || containerRef.value!,
    scrollHeightFiller: scrollHeightFillerRef.value!,
    viewportContainer: viewportContainerRef.value!,
    scrollCanvas: scrollCanvasRef.value!,
    topSpacer: topSpacerRef.value!,
    contentLayer: contentLayerRef.value!,
    bottomSpacer: bottomSpacerRef.value!,
    itemsSetter: setVisibleItems,
  });

  const layout = new DynamicListLayout({ overscanHeight, renderer });
  list = new LayoutVirtual({ layout });

  list.setData(props.data);

  setEventListeners();
});

onUnmounted(() => {
  list?.dispose();
});

watch(
  [() => props.data],
  ([data]) => {
    list?.setData(data);
  },
);

watchEffect(setEventListeners);
</script>

<template>
  <component v-if="scrollerRef" ref="externalScrollerClassHolder" is="template" :class="scrollerClass"></component>
  <Teleport v-if="scrollerRef" to="scrollerRef">
    <div ref="scrollHeightFillerRef"></div>
    <div ref="viewportContainerRef" :class="viewportClass">
      <div ref="scrollCanvasRef">
        <div ref="topSpacerRef"></div>
        <div ref="contentLayerRef" :class="contentLayerClass">
          <template v-for="item in visibleItems" :key="item.index" >
            <slot name="renderItem" :data="item.data" :index="item.index" :ref="getRef(item.index)" />
          </template>
        </div>
        <div ref="bottomSpacerRef"></div>
      </div>
    </div>
  </Teleport>

  <div v-else ref="containerRef" :class="scrollerClass">
    <div ref="scrollHeightFillerRef"></div>
    <div ref="viewportContainerRef" :class="viewportClass">
      <div ref="scrollCanvasRef">
        <div ref="topSpacerRef"></div>
        <div ref="contentLayerRef" :class="contentLayerClass">
          <template v-for="item in visibleItems" :key="item.index" >
            <slot name="renderItem" :data="item.data" :index="item.index" :ref="getRef(item.index)" />
          </template>
        </div>
        <div ref="bottomSpacerRef"></div>
      </div>
    </div>
  </div>
</template>
