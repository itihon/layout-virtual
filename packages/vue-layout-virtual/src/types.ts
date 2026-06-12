/**
 * @fileoverview Types for VirtualizedList Vue renderer and component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { type ClassValue, type Ref } from 'vue';
import type { VirtualScrollStructure, ILayoutVirtual } from 'layout-virtual/types';

export interface ListItemProps<T = unknown> {
  data: T;
  index: number;
}

export type VueRendererOptions<T> = {
  itemsSetter: (items: ListItemProps<T>[]) => void;
} & VirtualScrollStructure;

export interface VirtualizedListVueClasses {
  scrollerClass?: ClassValue;
  viewportClass?: ClassValue;
  contentLayerClass?: ClassValue;
}

export interface VirtualizedListVueProps<T> extends VirtualizedListVueClasses {
  scrollerRef?: Ref<HTMLElement>;
  overscanHeight?: number; 
  data: T[];
  getApi?: (api: ILayoutVirtual) => void;
}
