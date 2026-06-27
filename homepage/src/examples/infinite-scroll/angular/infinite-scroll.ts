import '@angular/compiler';
import { CommonModule } from '@angular/common';
import { Component, signal, computed } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import LayoutVirtual from 'angular-layout-virtual';

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
      scrollerClass="lv-scroller"
      viewportClass="lv-viewport"
      contentLayerClass="lv-content-layer"
      (afterItemsRendered)="onAfterRender(...$event)">
        <ng-template #renderItem let-itemData="data" let-index="index">
          @if (itemData===loader) {
            <div class="loader-container" [attr.data-index]="index">
              <div class="loader"></div>
            </div>
          } @else {
            <div class="article-card" [attr.data-index]="index">
              <span class="ac-index">{{ index }}</span>
              <h3 class="ac-title">{{ itemData.title }}</h3>
              <p class="ac-body">{{ itemData.body }}</p>
              <button class="ac-button">Learn more</button>
            </div>
          }
        </ng-template>
    </layout-virtual>
  `,
})
export default class InfiniteScrollExample {
  private loadedUrls = new Set<string>();

  data = signal<Post[]>([]);
  dataLimit = signal(100);
  isLoading = signal(false);
  loader = SHOW_LOADER;

  listData = computed(() =>
    this.isLoading() ? this.data().concat(SHOW_LOADER) : this.data()
  );

  startIndex = signal(0);
  endIndex = signal(0);
  total = computed(() => this.endIndex() - this.startIndex() + 1);

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