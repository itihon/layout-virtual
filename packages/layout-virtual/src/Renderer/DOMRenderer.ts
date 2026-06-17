/**
 * @fileoverview DOMRenderer.
 * @license MIT
 * @author Alexandr Kalabin
 */

import BaseRenderer from "./BaseRenderer";
import type { IRangeRenderer, ScrollDirection } from "../types/types";

export type ItemRenderer<T> = (props: { data: T, index: number }) => HTMLElement;

export default class DOMRenderer<DataType = unknown> extends BaseRenderer implements IRangeRenderer<DataType, ItemRenderer<DataType>> {
  private _store: DataType[] = [];
  private _renderItem: ItemRenderer<DataType> | null = null;

  constructor(container: HTMLElement) {
    super({ container });
  }

  renderRange(startIndex: number, endIndex: number, direction: ScrollDirection) {
    const store = this._store;
    const fragment = document.createDocumentFragment();

    for (let index = startIndex; index <= endIndex; index++) {
      const data = store[index];

      if (data) {
        const element = this._renderItem?.({ data, index });

        if (element) {
          fragment.append(element);
        }
      }
    }

    if (direction === 'down') {
      this.scrollableContainer.appendItem(fragment);
    }
    else if (direction === 'up') {
      this.scrollableContainer.prependItem(fragment);
    }
  }

  removeRange(startIndex: number, endIndex: number) {
    const removal = super.removeRange(startIndex, endIndex);
    const { itemsToRemove } = removal;
    const itemsCount = itemsToRemove.length;

    for (let idx = 0; idx < itemsCount; idx++) {
      itemsToRemove[idx]!.remove();
    }

    return removal;
  }

  clear() {
    super.clear();
    this._scrollableContainer.clear();
  }

  setData(store: DataType[]) {
    this._store = store;
  }

  setRenderItem(renderItem: ItemRenderer<DataType>) {
    this._renderItem = renderItem;
  }

  flush() {
    return super.flush();
  }

  get dataSize() {
    return this._store.length;
  }
}
