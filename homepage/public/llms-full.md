# Layout Virtual LLM Documentation

This file is optimized for AI agents that need to integrate `layout-virtual` or one of its framework adapters. It is generated from:

- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/README.md`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/content/docs/index.mdx`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/content/docs/API/index.mdx`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/content/docs/examples/responsive-grid-with-dynamic-card-sizes.mdx`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/content/docs/examples/infinite-scroll.mdx`
- the example source files imported by those MDX pages

## What Layout Virtual Does

Layout Virtual virtualizes dynamic lists and responsive grids without requiring application code to measure item heights, estimate item sizes, compute rows, or wrap every item in a special component. Items render as normal DOM elements inside a generated scroll structure. Layout behavior is controlled with ordinary CSS.

Use it when:

- item heights are unknown or change with content;
- a list should become a grid through CSS;
- grid column count changes with container width;
- margins, gaps, and responsive wrapping must still work;
- only the visible range plus overscan should be mounted.

## Installation

```bash
npm install layout-virtual
npm install react-layout-virtual
npm install vue-layout-virtual
npm install angular-layout-virtual
```

Install only the package for the framework you are using. The framework packages wrap the same core behavior.

## Packages

| Package | Use |
| --- | --- |
| `layout-virtual` | Core engine, public core types, and vanilla DOM component. |
| `react-layout-virtual` | React component wrapper. |
| `vue-layout-virtual` | Vue component wrapper. |
| `angular-layout-virtual` | Angular component wrapper. |

## Component Contract

All adapters render a scrollable container, an inner viewport, and a content layer. Items are rendered from `data` for the visible range plus vertical overscan.

Common props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `T[]` | required | Items to virtualize. |
| `renderItem` | framework-specific | required in JS/TS and React | Renders one item. Vue and Angular use slots/templates. |
| `overscanHeight` | `number` | `200` | Extra vertical pixels rendered outside the visible viewport in the scroll direction. |
| `scrollerRef` | framework-specific element ref | optional | Existing scroll element. If omitted, the component creates one. |
| `scrollerClass` | framework-specific class value | optional | Class applied to the scroll container. |
| `viewportClass` | framework-specific class value | optional | Class applied to the viewport. |
| `contentLayerClass` | framework-specific class value | optional | Class applied to the element containing rendered items. |

Item renderer payload:

```ts
type ListItemProps<T> = {
  data: T;
  index: number;
};
```

Required item attribute:

```html
data-index="the provided index"
```

Set `data-index` on the root element returned by the item renderer or template. The library uses it to track rendered elements.

Generated DOM shape:

```html
<div class="scrollerClass" data-lv-scroller>
  <div></div>
  <div class="viewportClass" data-lv-viewport>
    <div>
      <div></div>
      <div class="contentLayerClass" data-lv-content-layer>
        <!-- rendered items -->
      </div>
      <div></div>
    </div>
  </div>
</div>
```

Stable selectors:

- `[data-lv-scroller]`
- `[data-lv-viewport]`
- `[data-lv-content-layer]`

Prefer class props for application styling. Use data attributes for stable DOM selection.

## Events

| Event | Callback | Notes |
| --- | --- | --- |
| `onAfterItemsRendered` | `(startIndex: number, endIndex: number, items: HTMLCollection) => void` | Main public event for rendered-range diagnostics, counters, and infinite-scroll sentinels. |
| `onChange` | `() => void` | Low-level event emitted when core data or renderer setup changes. |
| `onResize` | `(width: number, height: number) => void` | Low-level scroll-container resize event. |
| `onScroll` | `(position: number, direction: 'down' \| 'up', scrollDelta: number) => void` | Low-level native scroller event. |
| `onContentScroll` | `(position: number, direction: 'down' \| 'up', scrollDelta: number) => void` | Low-level virtual content scroll event. |

`onBeforeItemsLoaded` and `onBeforeItemsUnloaded` exist in the type map but are not emitted by the current layout.

Framework event names:

- JS/TS and React: `onAfterItemsRendered={handler}`
- Vue: `@after-items-rendered="handler"`
- Angular: `(afterItemsRendered)="handler(...$event)"`

## Framework Usage

### JS / TS

```ts
import LayoutVirtual, { type ListItemProps } from 'layout-virtual';

type Item = { title: string };

function renderItem({ data, index }: ListItemProps<Item>) {
  const element = document.createElement('article');
  element.dataset.index = String(index);
  element.textContent = data.title;
  return element;
}

const { container, api } = LayoutVirtual<Item>({
  data,
  renderItem,
  overscanHeight: 200,
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
  onAfterItemsRendered(startIndex, endIndex) {
    console.log(startIndex, endIndex);
  },
});

document.getElementById('app')!.append(container);

// Vanilla only: update the list after initialization.
api.setData(nextData);
```

### React

```tsx
import LayoutVirtual, { type ListItemProps } from 'react-layout-virtual';

type Item = { title: string };

function Article({ data, index }: ListItemProps<Item>) {
  return <article data-index={index}>{data.title}</article>;
}

export function Example({ data }: { data: Item[] }) {
  return (
    <LayoutVirtual<Item>
      data={data}
      renderItem={Article}
      overscanHeight={200}
      scrollerClass="lv-scroller"
      viewportClass="lv-viewport"
      contentLayerClass="lv-content-layer"
      onAfterItemsRendered={(startIndex, endIndex) => {
        console.log(startIndex, endIndex);
      }}
    />
  );
}
```

### Vue

```vue
<script setup lang="ts">
import LayoutVirtual from 'vue-layout-virtual';

type Item = { title: string };

const styling = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

function onAfterItemsRendered(startIndex: number, endIndex: number) {
  console.log(startIndex, endIndex);
}
</script>

<template>
  <layout-virtual
    :data="data"
    :overscan-height="200"
    v-bind="styling"
    @after-items-rendered="onAfterItemsRendered"
  >
    <template #renderItem="{ data: item, index }">
      <article :data-index="index">{{ item.title }}</article>
    </template>
  </layout-virtual>
</template>
```

### Angular

```ts
import { Component } from '@angular/core';
import LayoutVirtual from 'angular-layout-virtual';

type Item = { title: string };

@Component({
  standalone: true,
  imports: [LayoutVirtual],
  template: `
    <layout-virtual
      [data]="data"
      [overscanHeight]="200"
      scrollerClass="lv-scroller"
      viewportClass="lv-viewport"
      contentLayerClass="lv-content-layer"
      (afterItemsRendered)="onAfterItemsRendered(...$event)">
        <ng-template #renderItem let-data="data" let-index="index">
          <article [attr.data-index]="index">{{ data.title }}</article>
        </ng-template>
    </layout-virtual>
  `,
})
export class Example {
  data: Item[] = [];

  onAfterItemsRendered(startIndex: number, endIndex: number) {
    console.log(startIndex, endIndex);
  }
}
```

## Responsive Grid With Dynamic Card Sizes

Docs page: `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/content/docs/examples/responsive-grid-with-dynamic-card-sizes.mdx`

Example source paths:

- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/responsive-grid/styles.css`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/responsive-grid/vanilla/responsive-grid.ts`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/responsive-grid/react/responsive-grid.tsx`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/responsive-grid/vue/responsive-grid.vue`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/responsive-grid/angular/responsive-grid.ts`

Behavior:

- The content layer is a responsive CSS grid.
- The same data can collapse to one column or expand to multiple columns as the scroller is resized.
- Card height is dynamic because text wraps differently at different column widths.
- No manual row calculation, column calculation, measuring pass, or estimated item size is needed.

Minimal CSS needed for the responsive-grid example:

```css
:root {
  --darker-bg-color: rgb(71, 81, 91);
  --lighter-bg-color: lightslategray;
}

.lv-scroller * {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  color: white;
}

.lv-scroller {
  width: 340px;
  height: 460px;
  padding: 16px 16px 40px;
  resize: both;
  background-color: var(--darker-bg-color);
}

.lv-viewport {
  container-type: size;
  width: 100%;
  height: 100%;
  border: 1px solid var(--lighter-bg-color);
  border-radius: 8px;
  background-color: var(--lighter-bg-color);
}

.lv-content-layer {
  --min-col-size: 220px;
  display: grid;
  gap: 1cqh 1cqw;
  justify-content: center;
  grid-template-columns: repeat(auto-fit, minmax(min(var(--min-col-size), 100%), 1fr));
}

.article-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--darker-bg-color);
}

.ac-index {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 10px;
  line-height: 1.4;
}

.ac-image {
  display: block;
  width: 100%;
  aspect-ratio: 5 / 3;
  object-fit: cover;
}

.ac-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
}

.ac-title {
  max-width: 85%;
  font-size: clamp(14px, 2.6cqw, 20px);
  font-weight: 600;
  line-height: 1.3;
}

.ac-excerpt {
  font-size: clamp(12px, 2cqw, 15px);
  line-height: 1.5;
  opacity: 0.8;
}

.ac-button {
  align-self: flex-start;
  margin-top: 4px;
  padding: 6px 14px;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: none;
  color: inherit;
  font-size: 13px;
}
```

Minimal React implementation:

```tsx
import { useCallback, useMemo, useState } from 'react';
import LayoutVirtual, { type ListItemProps } from 'react-layout-virtual';

type Data = { i: number; image?: string; title: string; excerpt: string };

function ArticleCard({ data, index }: ListItemProps<Data>) {
  return (
    <div className="article-card" data-index={index}>
      <div className="ac-index">#{data.i}</div>
      {data.image && <img className="ac-image" src={data.image} alt="" loading="lazy" />}
      <div className="ac-body">
        <h3 className="ac-title">{data.title}</h3>
        <p className="ac-excerpt">{data.excerpt}</p>
        <button className="ac-button">Learn more</button>
      </div>
    </div>
  );
}

export default function ResponsiveGridExample() {
  const data = useMemo<Data[]>(
    () => Array.from({ length: 1000 }, (_, i) => ({
      i,
      image: i % 3 ? undefined : `https://picsum.photos/seed/${i}/400/240`,
      title: `Article ${i}`,
      excerpt: 'Dynamic content can wrap and change each card height.',
    })),
    [],
  );
  const [range, setRange] = useState({ startIndex: 0, endIndex: 0 });
  const updateStats = useCallback((startIndex: number, endIndex: number) => {
    setRange({ startIndex, endIndex });
  }, []);

  return (
    <>
      <div>
        Rendered indices {range.startIndex} - {range.endIndex} of {data.length}.
      </div>
      <LayoutVirtual<Data>
        overscanHeight={200}
        data={data}
        renderItem={ArticleCard}
        scrollerClass="lv-scroller"
        viewportClass="lv-viewport"
        contentLayerClass="lv-content-layer"
        onAfterItemsRendered={updateStats}
      />
    </>
  );
}
```

## Infinite Scroll

Docs page: `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/content/docs/examples/infinite-scroll.mdx`

Example source paths:

- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/infinite-scroll/styles.css`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/infinite-scroll/vanilla/infinite-scroll.ts`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/infinite-scroll/react/infinite-scroll.tsx`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/infinite-scroll/vue/infinite-scroll.vue`
- `https://raw.githubusercontent.com/itihon/layout-virtual/refs/heads/main/homepage/src/examples/infinite-scroll/angular/infinite-scroll.ts`

Behavior:

- Start with an empty or partial data array.
- Fetch the next page when the last real item reaches the rendered range.
- Append a sentinel loader item while the request is in flight.
- No total item count is required before the first request.
- The same responsive grid CSS still works while data grows.

Minimal CSS additions for the infinite-scroll loader:

```css
.loader-container {
  grid-column: 1 / -1;
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: center;
}

.loader {
  width: 15px;
  aspect-ratio: 1;
  border-radius: 50%;
  animation: loader-pulse 1s infinite linear alternate;
}

@keyframes loader-pulse {
  0% {
    box-shadow: 20px 0 #fff, -20px 0 #fff2;
    background: #fff;
  }
  33% {
    box-shadow: 20px 0 #fff, -20px 0 #fff2;
    background: #fff2;
  }
  66% {
    box-shadow: 20px 0 #fff2, -20px 0 #fff;
    background: #fff2;
  }
  100% {
    box-shadow: 20px 0 #fff2, -20px 0 #fff;
    background: #fff;
  }
}
```

Use the responsive-grid CSS above plus these loader rules. For the infinite-scroll example, `.article-card` can also use `padding: 12px` and `gap: 16px` if the card has no image/body wrapper.

Minimal React implementation:

```tsx
import { useCallback, useMemo, useRef, useState } from 'react';
import LayoutVirtual, { type ListItemProps } from 'react-layout-virtual';

const SHOW_LOADER = Symbol('show-loader');
type Post = { title: string; body: string } | typeof SHOW_LOADER;

function ArticleCard({ data, index }: ListItemProps<Post>) {
  if (data === SHOW_LOADER) {
    return (
      <div className="loader-container" data-index={index}>
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="article-card" data-index={index}>
      <span className="ac-index">{index}</span>
      <h3 className="ac-title">{data.title}</h3>
      <p className="ac-body">{data.body}</p>
      <button className="ac-button">Learn more</button>
    </div>
  );
}

export default function InfiniteScrollExample() {
  const loadedUrls = useRef(new Set<string>());
  const [data, setData] = useState<Post[]>([]);
  const [dataLimit, setDataLimit] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const listData = useMemo(() => (isLoading ? data.concat(SHOW_LOADER) : data), [data, isLoading]);

  const loadMore = useCallback((limit: number, skip: number) => {
    const apiUrl = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}&select=title,body`;
    if (loadedUrls.current.has(apiUrl)) return;

    loadedUrls.current.add(apiUrl);
    setIsLoading(true);

    fetch(apiUrl)
      .then((response) => response.json())
      .then((result) => {
        setDataLimit(result.total);
        setData((posts) => posts.concat(result.posts));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const onAfterRender = useCallback(
    (_startIndex: number, endIndex: number) => {
      if (endIndex === data.length - 1 && endIndex < dataLimit - 1 && !isLoading) {
        loadMore(10, data.length);
      }
    },
    [data, dataLimit, isLoading, loadMore],
  );

  return (
    <LayoutVirtual<Post>
      overscanHeight={200}
      data={listData}
      renderItem={ArticleCard}
      scrollerClass="lv-scroller"
      viewportClass="lv-viewport"
      contentLayerClass="lv-content-layer"
      onAfterItemsRendered={onAfterRender}
    />
  );
}
```

Vanilla update pattern:

```ts
const { container, api } = LayoutVirtual<Post>({
  data: getListData(),
  renderItem: ArticleCard,
  onAfterItemsRendered: onAfterRender,
});

function loadMore() {
  isLoading = true;
  api.setData(getListData());

  fetch(apiUrl)
    .then((response) => response.json())
    .then((result) => {
      data = data.concat(result.posts);
    })
    .finally(() => {
      isLoading = false;
      api.setData(getListData());
    });
}
```

## Framework Type Notes

| Framework | `scrollerRef` type | Class prop type | Item renderer |
| --- | --- | --- | --- |
| JS / TS | `HTMLDivElement` | `string` | `renderItem(props) => HTMLElement` |
| React | `React.RefObject<HTMLElement>` | `string` | `renderItem(props) => React.ReactNode` |
| Vue | `Ref<HTMLElement>` | Vue `ClassValue` | `#renderItem` slot |
| Angular | `ElementRef<HTMLElement>` | `string \| string[] \| Set<string> \| Record<string, boolean>` | `#renderItem` template |

## Integration Checklist For Agents

- Install the adapter package for the target framework.
- Pass a stable `data` array to the virtual component.
- Render each item root with `data-index` equal to the provided index.
- Provide `scrollerClass`, `viewportClass`, and `contentLayerClass` if necessary.
- Give the scroller a definite width and height.
- Put `display: grid` or `display: flex` on the content layer class.
- Use `onAfterItemsRendered` when you need counters, diagnostics, or infinite-scroll loading.
- For vanilla JS/TS, use the returned `api.setData(nextData)` after async data changes.
