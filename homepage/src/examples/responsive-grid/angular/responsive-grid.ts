import '@angular/compiler';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import LayoutVirtual, { type VirtualizedListAngularClasses } from 'angular-layout-virtual';
import type { ILayoutVirtual } from 'layout-virtual/types';

type Data = { i: number };

const headers = [
  'One line header.',
  'Longer header, wraps to the next lines.',
];

const descriptions = [
  'A very short description.',
  'A much longer description text that wraps to the next lines at different card sizes.',
];

@Component({
  selector: '#app',
  standalone: true,
  imports: [CommonModule, LayoutVirtual],
  template: `
    <h4>Try to resize the container and scroll.</h4>
    <div>Rendered indeces {{ startIndex }} - {{ endIndex }}, total {{ total }} of {{ data.length }}.</div>
    <angular-layout-virtual [overscanHeight]="100" [data]="data" [scrollerClass]="styling.scrollerClass" [viewportClass]="styling.viewportClass" [contentLayerClass]="styling.contentLayerClass" [getApi]="getApi">
      <ng-template #renderItem let-data="data" let-index="index">
        <div class="list-item" [id]="'item-' + data.i" [attr.data-index]="index">
          <div class="li-icon">📁</div>
          <div class="li-index">#{{ data.i }}</div>
          <div class="li-header">{{ data.i % 2 ? headers[0] : headers[1] }}</div>
          <div class="li-description">{{ data.i % 2 ? descriptions[0] : descriptions[1] }}</div>
        </div>
      </ng-template>
    </angular-layout-virtual>
  `,
})
class AppComponent {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  data = Array.from({ length: 1000 }, (_, i): Data => ({ i }));
  headers = headers;
  descriptions = descriptions;
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

  getApi = (api: ILayoutVirtual) => {
    api.on('onAfterItemsRendered', (startIndex, endIndex) => {
      this.startIndex = startIndex;
      this.endIndex = endIndex;
      this.changeDetectorRef.markForCheck();
    });
  };
}

bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error(error);
});
