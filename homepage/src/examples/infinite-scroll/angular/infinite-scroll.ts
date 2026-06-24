import '@angular/compiler';
import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import LayoutVirtual, { type VirtualizedListAngularClasses } from 'angular-layout-virtual';

const SHOW_LOADER = Symbol('show-loader');
type Post = { title: string; body: string } | typeof SHOW_LOADER;

@Component({
  selector: '#app',
  standalone: true,
  imports: [CommonModule, LayoutVirtual],
  template: `
    <h4>Try resizing the container and scroll.</h4>
    <div>
      Rendered indices {{ startIndex() }} - {{ endIndex() }}, total {{ total() }}.
      Loaded {{ data().length }} of {{ dataLimit() }}.
    </div>
    <layout-virtual
      [overscanHeight]="200"
      [data]="listData()"
      [scrollerClass]="styling.scrollerClass"
      [viewportClass]="styling.viewportClass"
      [contentLayerClass]="styling.contentLayerClass"
      (afterItemsRendered)="onAfterRender(...$event)"
    >
      <ng-template #renderItem let-itemData="data" let-index="index">
        <ng-container *ngIf="isLoader(itemData); else articleCard">
          <div class="loader-container" [attr.data-index]="index">
            <div class="loader"></div>
          </div>
        </ng-container>
        <ng-template #articleCard>
          <div class="article-card" [attr.data-index]="index">
            <span class="ac-index">{{ index }}</span>
            <h3 class="ac-title">{{ asPost(itemData).title }}</h3>
            <p class="ac-body">{{ asPost(itemData).body }}</p>
            <button class="ac-button">Learn more</button>
          </div>
        </ng-template>
      </ng-template>
    </layout-virtual>
  `,
})
export default class InfiniteScrollExample {
  private loadedUrls = new Set<string>();

  data = signal<Post[]>([]);
  dataLimit = signal(100);
  isLoading = signal(false);

  listData = computed(() =>
    this.isLoading() ? this.data().concat(SHOW_LOADER) : this.data()
  );

  startIndex = signal(0);
  endIndex = signal(0);
  total = computed(() => this.endIndex() - this.startIndex() + 1);

  styling: VirtualizedListAngularClasses = {
    scrollerClass: 'lv-scroller',
    viewportClass: 'lv-viewport',
    contentLayerClass: 'lv-content-layer',
  };

  isLoader(item: Post): item is typeof SHOW_LOADER {
    return item === SHOW_LOADER;
  }

  asPost(item: Post): { title: string; body: string } {
    return item as { title: string; body: string };
  }

  onAfterRender(start: number, end: number, _:  unknown) {
    console.log('onAfterItemsRendered', start, end);
    if (end === this.data().length - 1 && end < this.dataLimit() - 1 && !this.isLoading()) {
      console.log('will try to fetch data');
      this.loadMore(10, this.data().length);
    }
    this.startIndex.set(start);
    this.endIndex.set(end);
  }

  private loadMore(limit: number, skip: number) {
    const apiUrl = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}&select=title,body`;
    if (this.loadedUrls.has(apiUrl)) return;

    this.isLoading.set(true);
    this.loadedUrls.add(apiUrl);
    console.log('will fetch', apiUrl);

    fetch(apiUrl)
      .then(result => result.json())
      .then(result => {
        this.dataLimit.set(result.total);
        this.data.update(posts => posts.concat(result.posts));
      })
      .catch(console.error)
      .finally(() => this.isLoading.set(false));
  }
}

bootstrapApplication(InfiniteScrollExample).catch((error: unknown) => {
  console.error(error);
});