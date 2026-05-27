/**
 * @fileoverview VirtualizedList Angular component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import type { AfterViewInit, ElementRef } from '@angular/core';
import type { IRangeRenderer } from 'layout-virtual/types';
import { LayoutVirtual, DynamicListLayout } from 'layout-virtual/core';
import AngularRenderer from './AngularRenderer';
import type { AngularClassAttribute, ListItemProps } from './types';

export type VirtualizedListItemContext<T> = ListItemProps<T> & {
  $implicit: T;
};

@Component({
  selector: 'angular-layout-virtual',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container [class]="scrollerClass">
      <div #scrollHeightFiller></div>
      <div #viewportContainer [class]="viewportClass">
        <div #scrollCanvas>
          <div #topSpacer></div>
          <div #contentLayer [class]="contentLayerClass">
            <ng-container
              *ngFor="let item of visibleItems; trackBy: trackByIndex"
            >
              <ng-container
                *ngTemplateOutlet="
                  renderItemTemplate;
                  context: getItemContext(item)
                "
              ></ng-container>
            </ng-container>
          </div>
          <div #bottomSpacer></div>
        </div>
      </div>
    </div>
  `,
})
export default class VirtualizedListAngular<T> implements AfterViewInit {
  @Input({ required: true }) data: T[] = [];
  @Input() overscanHeight = 200;
  @Input() scrollerRef?: ElementRef<HTMLElement>;
  @Input() scrollerClass?: AngularClassAttribute;
  @Input() viewportClass?: AngularClassAttribute;
  @Input() contentLayerClass?: AngularClassAttribute;

  @ContentChild('renderItem', { read: TemplateRef })
  renderItemTemplate!: TemplateRef<VirtualizedListItemContext<T>>;

  @ViewChild('container', { static: true })
  private containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollHeightFiller', { static: true })
  private scrollHeightFillerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('viewportContainer', { static: true })
  private viewportContainerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollCanvas', { static: true })
  private scrollCanvasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('topSpacer', { static: true })
  private topSpacerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('contentLayer', { static: true })
  private contentLayerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('bottomSpacer', { static: true })
  private bottomSpacerRef!: ElementRef<HTMLDivElement>;

  visibleItems: ListItemProps<T>[] = [];
  private renderer: AngularRenderer<T> | undefined;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.renderer = new AngularRenderer<T>({
      container: this.scrollerRef?.nativeElement || this.containerRef.nativeElement,
      scrollHeightFiller: this.scrollHeightFillerRef.nativeElement,
      viewportContainer: this.viewportContainerRef.nativeElement,
      scrollCanvas: this.scrollCanvasRef.nativeElement,
      topSpacer: this.topSpacerRef.nativeElement,
      contentLayer: this.contentLayerRef.nativeElement,
      bottomSpacer: this.bottomSpacerRef.nativeElement,
      itemsSetter: this.setVisibleItems,
      itemsFlusher: this.flushVisibleItems,
    });

    const layout = new DynamicListLayout({
      overscanHeight: this.overscanHeight,
      renderer: this.renderer as unknown as IRangeRenderer,
    });

    const list = new LayoutVirtual({
      layout,
    } as unknown as ConstructorParameters<typeof LayoutVirtual>[0]);
    
    list.setData(this.data);
  }

  trackByIndex(_position: number, item: ListItemProps<T>) {
    return item.index;
  }

  getItemContext(item: ListItemProps<T>): VirtualizedListItemContext<T> {
    return {
      $implicit: item.data,
      data: item.data,
      index: item.index,
    };
  }

  private setVisibleItems = (items: ListItemProps<T>[]) => {
    this.visibleItems = items;
  };

  private flushVisibleItems = () => {
    this.changeDetectorRef.detectChanges();
    this.commit();
  };

  private commit() {
    const renderedRefs = new Map<number, Element>();
    const itemElements = Array.from(
      this.contentLayerRef.nativeElement.children,
    );

    itemElements.forEach((element, position) => {
      const item = this.visibleItems[position];

      if (item) {
        renderedRefs.set(item.index, element);
      }
    });

    this.renderer?.commit(renderedRefs);
  }
}
