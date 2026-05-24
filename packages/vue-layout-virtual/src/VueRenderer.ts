/**
 * @fileoverview VueRenderer.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { nextTick, type Ref } from 'vue';
import { BaseRenderer } from 'layout-virtual';
import type { IItem, IItemStore, IRangeRenderer, ScrollDirection, VirtualScrollStructure, IVueItem } from 'layout-virtual/types';

export interface ListItemProps<T = unknown> {
  data: T;
  index: number;
}

type VueRendererOptions<T> = {
  itemsSetter: (items: ListItemProps<T>[]) => void;
} & VirtualScrollStructure;

export type IndexedRef = {
  value: Element | null;
  idx: number;
};

export default class VueRenderer<T> extends BaseRenderer implements IRangeRenderer {
  private _store: IItemStore<IItem> | null = null;
  private _itemsSetter: (items: ListItemProps<T>[]) => void;
  private _listItems: ListItemProps<T>[] = [];

  constructor(opts: VueRendererOptions<T>) {
    super(opts);
    this._itemsSetter = opts.itemsSetter;
  }

  renderRange(startIndex: number, endIndex: number, direction: ScrollDirection) {
    const store = this._store;
    const listItems = this._listItems;
    const itemsToAdd: ListItemProps<T>[] = [];

    if (!store) return;

    for (let idx = startIndex; idx <= endIndex; idx++) {
      const item = store.getByIndex(idx) as IVueItem<T> | undefined;

      if (item) {
        itemsToAdd.push({ data: item.data, index: idx });
      }
    }

    this._listItems =
      direction === 'down'
        ? listItems.concat(itemsToAdd)
        : direction === 'up'
          ? itemsToAdd.concat(listItems)
          : this._listItems;
  }

  removeRange(startIndex: number, endIndex: number, direction?: ScrollDirection) {
    const removal = super.removeRange(startIndex, endIndex);
    const removedItemsCount = removal.itemsToRemove.length;

    if (removedItemsCount) {
      this._listItems = direction === 'down'
        ? this._listItems.slice(removedItemsCount)
        : direction === 'up'
          ? this._listItems.slice(0, -removedItemsCount)
          : this._listItems;
    }

    return removal;
  }

  clear() {
    super.clear();
    this._listItems = [];
    this._itemsSetter(this._listItems);
  }

  attach(store: IItemStore<IItem>) {
    this._store = store;
  }

  flush() {
    this._itemsSetter(this._listItems);
    return nextTick();
  }

  commit(renderedRefs: Map<number, Ref<HTMLElement | undefined>>) {
    for (const [idx, { value: element }] of renderedRefs.entries()) {
      if (element) {
        this.registerElement(idx, element);
      }
    }

    renderedRefs.clear();
  }
}
