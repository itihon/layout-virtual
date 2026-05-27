/**
 * @fileoverview VueRenderer.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { nextTick, type Ref } from 'vue';
import { BaseRenderer } from 'layout-virtual/core';
import type { IRangeRenderer, ScrollDirection } from 'layout-virtual/types';
import type { ListItemProps, VueRendererOptions } from './types';

export default class VueRenderer<DataType = unknown> extends BaseRenderer implements IRangeRenderer<DataType> {
  private _store: DataType[] = [];
  private _itemsSetter: (items: ListItemProps<DataType>[]) => void;
  private _listItems: ListItemProps<DataType>[] = [];

  constructor(opts: VueRendererOptions<DataType>) {
    super(opts);
    this._itemsSetter = opts.itemsSetter;
  }

  renderRange(startIndex: number, endIndex: number, direction: ScrollDirection) {
    const store = this._store;
    const listItems = this._listItems;
    const itemsToAdd: ListItemProps<DataType>[] = [];

    for (let index = startIndex; index <= endIndex; index++) {
      const data = store[index];

      if (data) {
        itemsToAdd.push({ data, index });
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

  setData(store: DataType[]) {
    this._store = store;
  }

  setRenderItem() {
    /* not needed for Vue renderer */
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

  get dataSize() {
    return this._store.length;
  }
}
