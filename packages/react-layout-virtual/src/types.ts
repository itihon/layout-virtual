/**
 * @fileoverview Types for VirtualizedList React renderer and component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type { VirtualScrollStructure, ILayoutVirtualEvents } from "layout-virtual/types";

export interface ListItemProps<T = unknown> {
  data: T;
  index: number;
}

export type ItemRenderer<T> = React.FC<ListItemProps<T>>;

export type ReactRendererOptions = {
  itemsSetter: React.Dispatch<React.SetStateAction<React.ReactNode[]>>;
} & VirtualScrollStructure;

export interface VirtualizedListReactClasses {
  scrollerClass?: string | undefined;
  viewportClass?: string | undefined;
  contentLayerClass?: string | undefined;
}

export interface VirtualizedListReactProps<T> extends VirtualizedListReactClasses, Partial<ILayoutVirtualEvents> {
  scrollerRef?: React.RefObject<HTMLElement>;
  overscanHeight?: number; 
  data: T[];
  renderItem: (props: ListItemProps<T>) => React.ReactNode;
}
