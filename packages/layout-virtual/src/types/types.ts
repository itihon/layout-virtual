/**
 * @fileoverview All types used in the library core are declared here.
 * @license MIT
 * @author Alexandr Kalabin
 */

export interface IScrollableContainer {
    attach(eventBus: IEventEmitter<IEventMap>): void;
    scroll(top: number): void;
    setScrollTop(scrollTop: number): void;
    getScrollTop(): number;
    setViewportTop(viewportTop: number): void;
    getViewportTop(): number;
    setScrollHeight(scrollHeight: number): void;
    getScrollHeight(): number;
    setScrollCanvasHeight(height: number): void;
    getScrollCanvasHeight(): number;
    getTopSpacerBottom(): number;
    getBottomSpacerTop(): number;
    setTopSpacerHeight(height: number | 'auto'): void;
    getTopSpacerHeight(): number;
    setBottomSpacerHeight(height: number | 'auto'): void;
    getBottomSpacerHeight(): number;
    appendItem(item: HTMLElement | DocumentFragment): void;
    prependItem(item: HTMLElement | DocumentFragment): void;
    getClientWidth(): number;
    getClientHeight(): number;
    getViewportWidth(): number;
    getViewportHeight(): number;
    getContentLayerHeight(): number;
    getRowGap(): number;
    getColumnCount(): number;
    getFirstItem(): Element | null;
    getLastItem(): Element | null;
    getItems(): HTMLCollection;
    clear(): void;
    refresh(): void;
}

export interface IVirtualizedListEvents {
  onChange: () => void;
}

export type ScrollDirection = 'down' | 'up';

export interface IRangeRenderer<ItemData = unknown, ItemRenderer = Function> {
  render: (startIndex: number, endIndex: number, direction: ScrollDirection) => number;
  renderRange: (startIndex: number, endIndex: number, direction: ScrollDirection) => void;
  removeRange: (startIndex: number, endIndex: number, direction?: ScrollDirection) => { itemsToRemove: Element[], removedHeight: number };
  getRenderedBoundaryIndex: (boundary: 'first' | 'last') => number | undefined;
  getIndex: (item: Element) => number | undefined;
  getItem: (index: number) => Element | undefined;
  setData: (store: ItemData[]) => void;
  setRenderItem: (renderItem: ItemRenderer) => void;
  readonly dataSize: number;
  clear: () => void;
  flush: () => Promise<void>;
  scrollableContainer: IScrollableContainer;
}

export type VirtualScrollStructure = {
  container: HTMLElement;
  scrollHeightFiller?: HTMLElement;
  viewportContainer?: HTMLElement;
  scrollCanvas?: HTMLElement;
  topSpacer?: HTMLElement;
  contentLayer?: HTMLElement;
  bottomSpacer?: HTMLElement;
}

export interface IScrollableContainerEvents {
  onResize: (width: number, height: number) => void;
  onScroll: (position: number, direction: ScrollDirection) => void;
  onContentScroll: (position: number, direction: ScrollDirection) => void;
  onItemsOutOfView: (items: HTMLElement[]) => void;
}

export type IEventMap = IVirtualizedListEvents & IScrollableContainerEvents;

export interface IEventEmitter<T extends { [K in keyof T]: (...args: any[]) => void }> {
  on<K extends keyof T>(event: K, cb: T[K]): void;
  off<K extends keyof T>(event: K, cb: T[K]): void;
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void;
}

export interface IDynamicListLayout<ItemData = unknown, ItemRenderer = Function> {
  readonly renderer: IRangeRenderer<ItemData, ItemRenderer>;
  attach: (eventBus: IEventEmitter<IEventMap>) => void;
  detach: () => void;
}

export interface IVirtualizedDynamicListOptions<ItemData = unknown, ItemRenderer = Function> {
  layout: IDynamicListLayout<ItemData, ItemRenderer>;
}
