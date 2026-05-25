/**
 * @fileoverview VirtualizedList class implementation.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type { 
  IDynamicListLayout,
  IEventMap, 
  IVirtualizedDynamicListOptions, 
} from "./types/types";
import EventBus from "./EventBus/EventBus";

export default class VirtualizedList<ItemData = unknown, ItemRenderer = Function> {
  private _eventBus = new EventBus<IEventMap>();
  private _layout: IDynamicListLayout<ItemData, ItemRenderer>;

  constructor({ layout }: IVirtualizedDynamicListOptions<ItemData, ItemRenderer>) {
    this._layout = layout;
    this._layout.attach(this._eventBus);
  }

  setData(data: ItemData[]) {
    this._layout.renderer.setData(data);
    this._eventBus.emit('onChange');
  }

  setRenderItem(renderItem: ItemRenderer) {
    this._layout.renderer.setRenderItem(renderItem);
    this._eventBus.emit('onChange');
  }
}
