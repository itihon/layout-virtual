import '@angular/compiler';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import VirtualizedListAngular, { type VirtualizedListAngularClasses } from 'angular-layout-virtual';
import '../../tests/e2e/loadFrameValidation';

const itemsCount = Number(new URLSearchParams(window.location.search).get('itemsCount')) || 1000;

type Data = { i: number };

@Component({
  selector: '#app',
  standalone: true,
  imports: [CommonModule, VirtualizedListAngular],
  template: `
    <div>Rendered indices {{ startIndex }} - {{ endIndex }}, total {{ total }} of {{ data.length }}.</div>
    <layout-virtual [data]="data" [overscanHeight]="100" [scrollerClass]="styling.scrollerClass" [viewportClass]="styling.viewportClass" [contentLayerClass]="styling.contentLayerClass" (afterItemsRendered)="updateStats(...$event)">
      <ng-template #renderItem let-data="data" let-index="index">
        <div class="list-item" [id]="'item-' + data.i" [attr.data-index]="index">
          Item {{ data.i }}.
          <div *ngFor="let text of extraLines(data.i)">{{ text }}</div>
        </div>
      </ng-template>
    </layout-virtual>
    <div>
      <button (click)="addItem()">Add item</button>
      <label for="insertion-index">At index:</label>
      <input id="insertion-index" [value]="insertionIndex" (input)="insertionIndex = $event.target.value" type="number" min="0" [max]="data.length" />
    </div>
  `,
})

class AppComponent {
  data = Array.from({ length: itemsCount }, (_, i): Data => ({ i }));
  startIndex = 0;
  endIndex = 0;
  insertionIndex = this.data.length - 1;
  
  styling: VirtualizedListAngularClasses = {
    scrollerClass: 'lv-scroller',
    viewportClass: 'lv-viewport',
    contentLayerClass: 'lv-content-layer',
  };

  get total() {
    return this.endIndex - this.startIndex + 1;
  }

  addItem = () => {
    this.data = this.data.slice(0, this.insertionIndex).concat(
      { i: this.data.length },
      this.data.slice(this.insertionIndex),
    );
  };

  updateStats = (startIndex: number, endIndex: number) => {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  };

  extraLines(i: number) {
    return i % 5 === 0
      ? ['Second line.', 'Third line.', 'Fourth line.']
      : i % 3 === 0
        ? ['Second line.', 'Third line.']
        : i % 2 === 0
          ? ['Second line.']
          : [];
  }
}

bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error(error);
});
