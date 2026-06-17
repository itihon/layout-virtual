/**
 * @fileoverview VirtualizedList DOM component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { LayoutVirtual, DynamicListLayout } from '../core';
import DOMRenderer, { type ItemRenderer} from './DOMRenderer';
import type { ILayoutVirtualEvents, LayoutVirtualEventsArray } from '../types/types';

export interface ListItemProps<T = unknown> {
  data: T;
  index: number;
}

export interface VirtualizedListDOMClasses {
  scrollerClass?: string;
  viewportClass?: string;
  contentLayerClass?: string;
}

export interface VirtualizedListDOMProps<ItemData> extends VirtualizedListDOMClasses, Partial<ILayoutVirtualEvents> {
  scrollerRef?: HTMLDivElement;
  overscanHeight?: number; 
  data: ItemData[];
  renderItem: (props: ListItemProps<ItemData>) => HTMLElement;
}

export default function VirtualizedListDOM<ItemData>(props: VirtualizedListDOMProps<ItemData>): { container: HTMLElement, api: LayoutVirtual<ItemData, ItemRenderer<ItemData>> } {
  const { overscanHeight = 200, data, renderItem, scrollerRef } = props;
  const callbacks = Object.entries(props).filter(([key]) => key.startsWith('on')) as LayoutVirtualEventsArray;
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

  callbacks.forEach(([cbName, cb]) => {
    list.setEventListener(cbName, cb);
  });

  return { container, api: list };
}