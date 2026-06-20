/**
 * @fileoverview VirtualizedList class implementation.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type { 
  IDisposable,
  IDynamicListLayout,
  IEventMap, 
  ILayoutVirtual, 
  IVirtualizedDynamicListOptions,
} from "./types/types";
import EventBus from "./EventBus/EventBus";

export default class VirtualizedList<ItemData = unknown, ItemRenderer = Function> implements ILayoutVirtual, IDisposable {
  private _eventBus = new EventBus<IEventMap>();
  private _layout: IDynamicListLayout<ItemData, ItemRenderer>;
  private _publicEvents = new Map<keyof IEventMap, IEventMap[keyof IEventMap]>();
  private _renderItem: ItemRenderer | null = null;

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
    
    if (this._renderItem !== renderItem) {
      this._renderItem = renderItem;
      this._eventBus.emit('onChange');
    }
  }

  setEventListener<K extends keyof IEventMap>(event: K, cb?: IEventMap[K]) {
    const attachedCb = this._publicEvents.get(event) as IEventMap[typeof event];
    this._eventBus.off(event, attachedCb);

    if (cb) {
      this._eventBus.on(event, cb);
      this._publicEvents.set(event, cb);
    }
  }

  scrollToIndex() {

  }

  dispose() {
    this._layout.dispose();
    this._eventBus.clear();
    this._renderItem = null;
  }
}
