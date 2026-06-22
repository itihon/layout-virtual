import '@angular/compiler';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import LayoutVirtual, { type VirtualizedListAngularClasses } from 'angular-layout-virtual';

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

@Component({
  selector: '#app',
  standalone: true,
  imports: [CommonModule, LayoutVirtual],
  template: `
    <h4>Try resizing the container and scroll.</h4>
    <div>Rendered indices {{ startIndex }} - {{ endIndex }}, total {{ total }} of {{ data.length }}.</div>
    <layout-virtual [overscanHeight]="200" [data]="data" [scrollerClass]="styling.scrollerClass" [viewportClass]="styling.viewportClass" [contentLayerClass]="styling.contentLayerClass" (afterItemsRendered)="updateStats(...$event)">
      <ng-template #renderItem let-data="data" let-index="index">
        <div class="article-card" [attr.data-index]="index">
          <div class="ac-index">#{{ data.i }}</div>
          <img *ngIf="data.image" class="ac-image" [src]="data.image" alt="" loading="lazy">
          <div class="ac-body">
            <h3 class="ac-title">{{ data.title }}</h3>
            <p class="ac-excerpt">{{ data.excerpt }}</p>
            <button class="ac-button">Learn more</button>
          </div>
        </div>
      </ng-template>
    </layout-virtual>
  `,
})
export default class ResponsiveGridExample {
  data = Array.from({ length: 1000 }, (_, i): Data => ({
    i,
    image: i % 3 ? undefined : `https://picsum.photos/seed/${i}/400/240`,
    title: titles[i % titles.length],
    excerpt: excerpts[i % excerpts.length],
  }));
  startIndex = 0;
  endIndex = 0;

  styling: VirtualizedListAngularClasses = {
    scrollerClass: 'lv-scroller',
    viewportClass: 'lv-viewport',
    contentLayerClass: 'lv-content-layer',
  };

  get total() {
    return this.endIndex - this.startIndex + 1;
  }

  updateStats = (startIndex: number, endIndex: number) => {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  };
}

bootstrapApplication(ResponsiveGridExample).catch((error: unknown) => {
  console.error(error);
});
