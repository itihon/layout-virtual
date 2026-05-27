/**
 * @fileoverview VirtualizedList DOM component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { LayoutVirtual, DynamicListLayout } from 'layout-virtual/core';
import DOMRenderer, { type ItemRenderer} from './DOMRenderer';

export interface ListItemProps<T = unknown> {
  data: T;
  index: number;
}

export interface VirtualizedListDOMClasses {
  scrollerClass?: string;
  viewportClass?: string;
  contentLayerClass?: string;
}

export interface VirtualizedListDOMProps<ItemData> extends VirtualizedListDOMClasses {
  scrollerRef?: HTMLDivElement;
  overscanHeight?: number; 
  data: ItemData[];
  renderItem: (props: ListItemProps<ItemData>) => HTMLElement;
}

export default function VirtualizedListDOM<ItemData>(props: VirtualizedListDOMProps<ItemData>): HTMLElement {
  const { overscanHeight = 200, data, renderItem, scrollerRef } = props;
  const { scrollerClass, viewportClass, contentLayerClass } = props;
  const container = scrollerRef ?? document.createElement('div');
  const renderer = new DOMRenderer<ItemData>(container);
  const layout = new DynamicListLayout<ItemData, ItemRenderer<ItemData>>({ overscanHeight, renderer });
  const list = new LayoutVirtual<ItemData, ItemRenderer<ItemData>>({ layout });
  const viewport = container.querySelector('[data-lv-viewport]');
  const contentLayer = container.querySelector('[data-lv-content-layer]');

  container.classList.add(scrollerClass || '');
  viewport?.classList.add(viewportClass || '');
  contentLayer?.classList.add(contentLayerClass || '');

  list.setData(data);
  list.setRenderItem(renderItem);

  return container;
}