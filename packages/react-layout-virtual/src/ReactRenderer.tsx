/**
 * @fileoverview ReactRenderer.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { flushSync } from 'react-dom';
import { BaseRenderer } from 'layout-virtual/core';
import type { IRangeRenderer, ScrollDirection } from "layout-virtual/types";
import type { ItemRenderer, ReactRendererOptions } from './types';

export default class ReactRenderer<DataType = unknown> extends BaseRenderer implements IRangeRenderer<DataType, ItemRenderer<DataType>> {
  private _store: DataType[] = [];
  private _renderItem: ItemRenderer<DataType> | null = null;
  private _itemsSetter: React.Dispatch<React.SetStateAction<React.ReactNode[]>>;
  private _listItems: React.ReactNode[] = [];
  private _flushItems = () => this._itemsSetter(this._listItems);
  private _flushSync = () => flushSync(this._flushItems);

  constructor(opts: ReactRendererOptions) {
    super(opts);
    this._itemsSetter = opts.itemsSetter;
  }

  renderRange(startIndex: number, endIndex: number, direction: ScrollDirection) {
    const store = this._store;
    const listItems = this._listItems;
    const itemsToAdd: React.ReactNode[] = [];

    for (let index = startIndex; index <= endIndex; index++) {
      const data = store[index];

      if (data) {
        const ListItem = this._renderItem;

        if (ListItem) {
          itemsToAdd.push(<ListItem data={data} key={index} index={index} />);
        }
      }
    }

    this._listItems = direction === 'down' 
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
    console.warn('ReactRenderer: Clearing items.');
    super.clear();
    this._listItems = [];
    this._itemsSetter(this._listItems);
    // return this.flush(); // Fixes the bug with duplicating items that appeared on scroll after insertion.
  }

  setData(store: DataType[]) {
    this._store = store;
  }

  setRenderItem(renderItem: ItemRenderer<DataType>) {
    this._renderItem = renderItem;
  }

  flush(): Promise<void> {
    Promise.resolve().then(this._flushSync);
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
    this._renderItem = null;
  }
}
