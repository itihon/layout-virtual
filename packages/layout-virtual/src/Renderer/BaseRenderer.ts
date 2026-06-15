/**
 * @fileoverview Base renderer implementation shared by framework renderers.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type {
  IRangeRenderer,
  ScrollDirection,
  VirtualScrollStructure,
} from "../types/types";
import ScrollableContainer from "./NativeScrollContainer";

function prevDivisible(i: number, div: number): number {
  return i - i % div;
}

function nextDivisible(i: number, div: number): number {
  return i + (div - i % div) % div;
}

export default abstract class BaseRenderer<ItemData = unknown, ItemRenderer = Function> implements IRangeRenderer<ItemData, ItemRenderer> {
  protected _scrollableContainer: ScrollableContainer;
  protected _renderedIndexRegistry = new Map<Element, number>();
  protected _renderedItemsRegistry = new Map<number, Element>();

  constructor(opts: VirtualScrollStructure) {
    this._scrollableContainer = new ScrollableContainer({ ...opts });
  }

  render(startIndex: number, endIndex: number, direction: ScrollDirection): number {
    const firstRenderedIndex = this.getRenderedBoundaryIndex('first');
    const lastRenderedIndex = this.getRenderedBoundaryIndex('last');
    const columnCount = this._scrollableContainer.getColumnCount();

    let renderStartIndex = startIndex;
    let renderEndIndex = endIndex;
    let removeStartIndex = firstRenderedIndex;
    let removeEndIndex = lastRenderedIndex;
    let removedHeight = 0;

    if (direction === 'down') {
      if (removeStartIndex !== undefined && lastRenderedIndex !== undefined) { // there are rendered items
        removeEndIndex = Math.min(renderStartIndex - 1, lastRenderedIndex);
        renderStartIndex = Math.max(lastRenderedIndex + 1, renderStartIndex);

        if (removeEndIndex === lastRenderedIndex) { // not intersecting ranges
          renderStartIndex = nextDivisible(renderStartIndex, columnCount);
        }
        else {
          removeEndIndex = prevDivisible(removeEndIndex, columnCount) - 1;
        }
      }
      else { // there are no rendered items
        renderStartIndex = nextDivisible(renderStartIndex, columnCount);
      }
    }
    else if (direction === 'up') {
      if (removeEndIndex !== undefined && firstRenderedIndex !== undefined) { // there are rendered items
        removeStartIndex = Math.max(renderEndIndex + 1, firstRenderedIndex);
        renderEndIndex = Math.min(firstRenderedIndex - 1, renderEndIndex);
        renderStartIndex = nextDivisible(renderStartIndex, columnCount);
        
        if (removeStartIndex !== firstRenderedIndex) { // intersecting ranges
          removeStartIndex = nextDivisible(removeStartIndex, columnCount);
        }
      }
      else { // there are no rendered items
        renderStartIndex = nextDivisible(renderStartIndex, columnCount);
      }
    }

    if (removeStartIndex !== undefined && removeEndIndex !== undefined) {
      if (removeStartIndex <= removeEndIndex) {
        removedHeight = this.removeRange(removeStartIndex, removeEndIndex, direction).removedHeight;
        console.log('items to be removed:', removeStartIndex, removeEndIndex);
      }
    }

    if (renderStartIndex <= renderEndIndex) {
      this.renderRange(renderStartIndex, renderEndIndex, direction);
      console.log('items to be added:', renderStartIndex, renderEndIndex);
    }

    return removedHeight;
  }

  abstract renderRange(startIndex: number, endIndex: number, direction: ScrollDirection): void;

  removeRange(startIndex: number, endIndex: number, _?: ScrollDirection) {
    const itemsToRemove: Element[] = [];
    const renderedIndices = this._renderedIndexRegistry;
    const renderedItems = this._renderedItemsRegistry;
    const rowGap = this._scrollableContainer.getRowGap();
    let startRange = Infinity;
    let endRange = 0;

    for (let idx = startIndex; idx <= endIndex; idx++) {
      const itemToRemove = renderedItems.get(idx); 

      if (itemToRemove) {
        const { offsetTop, offsetHeight } = itemToRemove as HTMLElement;
        const itemStyle = getComputedStyle(itemToRemove);
        const marginTop = parseFloat(itemStyle.marginTop);
        const marginBottom = parseFloat(itemStyle.marginBottom);

        startRange = Math.min(startRange, offsetTop - marginTop);
        endRange = Math.max(endRange, offsetTop + offsetHeight + marginBottom + rowGap);

        itemsToRemove.push(itemToRemove);
        renderedItems.delete(idx);
        renderedIndices.delete(itemToRemove);
      }
    }

    return {
      itemsToRemove, 
      removedHeight: endRange > startRange ? endRange - startRange : 0,
    };
  }

  clear() {
    console.warn('Clearing items.');
    this._renderedIndexRegistry.clear();
    this._renderedItemsRegistry.clear();
  }

  getRenderedBoundaryIndex(boundary: 'first' | 'last'): number | undefined {
    const renderedItem =
      boundary === 'first'
        ? this._scrollableContainer.getFirstItem()
        : boundary === 'last'
          ? this._scrollableContainer.getLastItem()
          : null;

    if (!renderedItem) return;

    return this.getIndex(renderedItem);
  }

  getIndex(item: Element): number | undefined {
    return this._renderedIndexRegistry.get(item);
  }

  getItem(index: number): Element | undefined {
    return this._renderedItemsRegistry.get(index);
  }

  get scrollableContainer(): ScrollableContainer {
    return this._scrollableContainer;
  }

  abstract setData(store: ItemData[]): void;
  abstract setRenderItem(renderItem: ItemRenderer): void;
  abstract get dataSize(): number;

  protected registerElement(index: number, element: Element) {
    this._renderedIndexRegistry.set(element, index);
    this._renderedItemsRegistry.set(index, element);
  }

  abstract flush(): Promise<void>;
}
