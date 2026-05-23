/**
 * @fileoverview DOMRenderer.
 * @license MIT
 * @author Alexandr Kalabin
 */

import BaseRenderer from "./BaseRenderer";
import type { IRangeRenderer, ScrollDirection, IItemStore, IItem } from "../types/types";

export default class DOMRenderer extends BaseRenderer implements IRangeRenderer {
  private _store: IItemStore<IItem> | null = null;

  constructor(container: HTMLElement) {
    super({ container });
  }

  renderRange(startIndex: number, endIndex: number, direction: ScrollDirection) {
    const store = this._store;
    const fragment = document.createDocumentFragment();

    if (!store) return;

    for (let idx = startIndex; idx <= endIndex; idx++) {
      const item = store.getByIndex(idx);

      if (item) {
        const element = item.render({ data: item.data, index: idx });

        fragment.append(element);
        this.registerElement(idx, element);
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

  attach(store: IItemStore<IItem>) {
    this._store = store;
  }

  flush() {
    return Promise.resolve();
  }
}
