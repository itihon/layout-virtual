/**
 * @fileoverview AngularRenderer.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { BaseRenderer } from 'layout-virtual/core';
import type { IRangeRenderer, ScrollDirection } from 'layout-virtual/types';
import type { ListItemProps, AngularRendererOptions } from './types';

export default class AngularRenderer<DataType = unknown> extends BaseRenderer implements IRangeRenderer<DataType> {
  private _store: DataType[] = [];
  private _itemsSetter: (items: ListItemProps<DataType>[]) => void;
  private _itemsFlusher: () => void;
  private _listItems: ListItemProps<DataType>[] = [];

  constructor(opts: AngularRendererOptions<DataType>) {
    super(opts);
    this._itemsSetter = opts.itemsSetter;
    this._itemsFlusher = opts.itemsFlusher;
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
      this._listItems =
        direction === 'down'
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
    /* not needed for Angular renderer */
  }

  flush() {
    this._itemsSetter(this._listItems);
    this._itemsFlusher();
    return super.flush();
  }

  get dataSize() {
    return this._store.length;
  }

  dispose() {
    super.dispose();    
    this.clear();
    this._store = [];
    this._itemsSetter = () => {};
    this._itemsFlusher = () => {};
  }
}
