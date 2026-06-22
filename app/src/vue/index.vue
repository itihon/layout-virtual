<!-- Root.vue -->
<script setup lang="ts">
import App from './main.vue';
import InfiniteScrollExample from '../../../homepage/src/examples/infinite-scroll/vue/infinite-scroll.vue';
import ResponsiveGridExample from '../../../homepage/src/examples/responsive-grid/vue/responsive-grid.vue';

import AppExampleStyles from '../main.css?raw';
import InfiniteScrollExampleStyles from '../../../homepage/src/examples/infinite-scroll/styles.css?raw';
import ResponsiveGridExampleStyles from '../../../homepage/src/examples/responsive-grid/styles.css?raw';

const styles = {
  'main': AppExampleStyles,
  'infinite-scroll': InfiniteScrollExampleStyles,
  'responsive-grid': ResponsiveGridExampleStyles,
};

const examples = {
  'main': App,
  'infinite-scroll': InfiniteScrollExample,
  'responsive-grid': ResponsiveGridExample,
};

type ExampleName = keyof typeof examples;

const example = (
  new URLSearchParams(window.location.search).get('example') || 'main'
) as ExampleName;

const CurrentExample = examples[example];

const styleEl = document.createElement('style');
styleEl.textContent = styles[example];
document.head.appendChild(styleEl);
</script>

<template>
  <nav>
    <a v-for="key in Object.keys(examples)" :class="key === example ? 'active' : ''" :key="key" :href="`./?example=${key}`" >
      {{ key }}
    </a>
  </nav>

  <component :is="CurrentExample" />
</template>