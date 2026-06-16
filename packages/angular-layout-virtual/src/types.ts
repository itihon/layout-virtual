/**
 * @fileoverview Types for VirtualizedList Angular renderer and component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type { ElementRef } from '@angular/core';
import type { VirtualScrollStructure, ILayoutVirtualEvents } from 'layout-virtual/types';

export interface ListItemProps<T = unknown> {
  data: T;
  index: number;
}

export type AngularRendererOptions<T> = {
  itemsSetter: (items: ListItemProps<T>[]) => void;
  itemsFlusher: () => void;
} & VirtualScrollStructure;

export type AngularClassAttribute = string | string[] | Set<string> | Record<string, boolean>;

export interface VirtualizedListAngularClasses {
  scrollerClass?: AngularClassAttribute;
  viewportClass?: AngularClassAttribute;
  contentLayerClass?: AngularClassAttribute;
}

export interface VirtualizedListAngularProps<T> extends VirtualizedListAngularClasses, Partial<ILayoutVirtualEvents> {
  scrollerRef?: ElementRef<HTMLElement>;
  overscanHeight?: number; 
  data: T[];
}
