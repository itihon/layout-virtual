/**
 * @fileoverview Relays DOM scroll events to the shared event bus with position and direction metadata.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type { IDisposable, IEventEmitter, IEventMap } from '../types/types';
import ElementMetricsCache from '../Renderer/ElementMetricsCache';

export default class ScrollRelay extends ElementMetricsCache implements IDisposable {
  private _container: HTMLElement;
  private _eventBus: IEventEmitter<IEventMap> | null = null;
  private _eventType: 'onScroll' | 'onContentScroll' | null = null;
  private _ignoreNextScroll = false;
  private _ignoreTimer: number = 0;

  handleEvent() {
    if (this._ignoreNextScroll) {
      this._ignoreNextScroll = false;
      return;
    }

    const eventBus = this._eventBus;
    const eventType = this._eventType;
    const previousScrollTop = this.scrollTop;
    const scrollTop = this._container.scrollTop;

    this.refresh();

    if (!eventBus || !eventType) return;

    const scrollDelta = scrollTop - previousScrollTop;

    if (previousScrollTop < scrollTop) {
      eventBus.emit(eventType, scrollTop, 'down', scrollDelta);
    }
    else if (previousScrollTop > scrollTop) {
      eventBus.emit(eventType, scrollTop, 'up', scrollDelta);
    }
  };

  constructor(container: HTMLElement) {
    super(container);
    this._container = container;
    this._container.addEventListener('scroll', this);
  }

  setScrollTop(scrollTop: number) {
    const maxScrollRange = this.scrollHeight - this.clientHeight;

    if (scrollTop < .1 || scrollTop >= maxScrollRange) {
      // There will not be scroll evenets anymore.
      this._ignoreTimer = setTimeout(() => { this._ignoreNextScroll = false; }, 32) as unknown as number;
    }

    this._ignoreNextScroll = true;
    this._container.scrollTop = scrollTop;
    this.refresh('scrollTop');
  }

  attach(eventBus: IEventEmitter<IEventMap>, eventType: 'onScroll' | 'onContentScroll') {
    this._eventBus = eventBus;
    this._eventType = eventType;
  }

  dispose() {
    this._container.removeEventListener('scroll', this);
    this._eventBus = null;
    this._eventType = null;
    clearTimeout(this._ignoreTimer);
  }
}
