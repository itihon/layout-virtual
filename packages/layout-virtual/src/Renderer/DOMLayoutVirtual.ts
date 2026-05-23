/**
 * @fileoverview VirtualizedList DOM component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { LayoutVirtual, DynamicListLayout, ArrayItemStore } from 'layout-virtual';
import DOMRenderer from './DOMRenderer';

export interface ListItemProps<T = unknown> {
  data: T;
  index: number;
}

export interface VirtualizedListDOMProps<T> {
  scrollerRef?: HTMLDivElement;
  overscanHeight?: number; 
  data: T[];
  renderItem: (props: ListItemProps<T>) => React.ReactNode;
}

export default function VirtualizedListDOM<T>(props: VirtualizedListDOMProps<T>): HTMLElement {
  const { overscanHeight = 200, data, renderItem, scrollerRef } = props;
  const container = scrollerRef ?? document.createElement('div');
  const store = new ArrayItemStore();
  const renderer = new DOMRenderer(container);
  const layout = new DynamicListLayout({ overscanHeight, renderer });
  const list = new LayoutVirtual({ layout, store });
 
  for (let idx = 0; idx < data.length; idx++) {
    list.insert({ data: data[idx], render: renderItem }, idx);
  }

  return container;
}