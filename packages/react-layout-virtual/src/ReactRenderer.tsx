/**
 * @fileoverview ReactRenderer.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { flushSync } from 'react-dom';
import { BaseRenderer } from 'layout-virtual';
import type { IRangeRenderer, ScrollDirection, IItemStore, IItem, IReactItem, VirtualScrollStructure } from "layout-virtual/types";

type ReactRendererOptions = {
  itemsSetter: React.Dispatch<React.SetStateAction<React.ReactNode[]>>;
} & VirtualScrollStructure;

interface IReactRenderer {
  commit: () => void;
}

type IndexedRef = React.RefObject<HTMLDivElement | null> & { idx: number };

export default class ReactRenderer extends BaseRenderer implements IRangeRenderer, IReactRenderer {
  private _store: IItemStore<IItem> | null = null;
  private _itemsSetter: React.Dispatch<React.SetStateAction<React.ReactNode[]>>;
  private _renderedRangeRefPool = new Map<number, IndexedRef>();
  private _listItems: React.ReactNode[] = [];
  private _flushItems = () => { this._itemsSetter(this._listItems); };

  constructor(opts: ReactRendererOptions) {
    super(opts);
    this._itemsSetter = opts.itemsSetter;
  }

  renderRange(startIndex: number, endIndex: number, direction: ScrollDirection) {
    const store = this._store;
    // const listItems = [];
    const listItems = this._listItems;
    const itemsToAdd: React.ReactNode[] = [];
    const refPool = this._renderedRangeRefPool;

    if (!store) return;

    for (let idx = startIndex; idx <= endIndex; idx++) {
      const item = store.getByIndex(idx) as unknown as IReactItem | undefined;

      if (item) {
        const ListItem = item.render;

        const ref: IndexedRef = refPool.get(idx) || { current: null, idx };

        refPool.set(idx, ref);
        itemsToAdd.push(<ListItem data={item.data} key={idx} ref={ref} index={idx} />);
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
    super.clear();
    this._listItems = [];
    this._itemsSetter(this._listItems);
  }

  attach(store: IItemStore<IItem>) {
    this._store = store;
  }

  flush() {
    flushSync(this._flushItems);
    return Promise.resolve();
  }

  commit() {
    const renderedRefs = this._renderedRangeRefPool;

    for (const ref of renderedRefs.values()) {
      const { idx, current: element } = ref;

      if (element) {
        this.registerElement(idx, element);
      }
    }

    renderedRefs.clear();
  }
}
