/**
 * @fileoverview Provides the scroll host abstraction used by the virtualized list.
 * Creates and owns the DOM layers (scroll-height filler, viewport, and content layer),
 * tracks container size and scroll state, and emits lifecycle events 
 * for scrolling, resizing.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type { IDisposable, IEventEmitter, IEventMap, IScrollableContainer, VirtualScrollStructure } from '../types/types';
import DOMConstructor from '../Renderer/DOMConstructor';
import ScrollRelay from './ScrollRelay';
import classes from './NativeScrollContainer.module.css';

export default class ScrollableContainer implements IScrollableContainer, IDisposable {
  private _container: HTMLElement;
  private _scrollHeightFiller: DOMConstructor;
  private _viewportContainer: DOMConstructor;
  private _scrollCanvas: DOMConstructor;
  private _topSpacer: DOMConstructor;
  private _bottomSpacer: DOMConstructor;
  private _contentLayer: DOMConstructor;
  private _eventBus: IEventEmitter<IEventMap> | null = null;
  private _containerScroller: ScrollRelay;
  private _viewportScroller: ScrollRelay;
  private _contentLayerStyles: CSSStyleDeclaration;
  private _resizeObserver: ResizeObserver;

  private _handleResize: ResizeObserverCallback = () => {

    this.refresh();

    const { clientWidth, clientHeight } = this._container;

    this._contentLayer.setWidth(this._viewportContainer.DOMRoot.clientWidth);

    this._eventBus?.emit('onResize', clientWidth, clientHeight);
  };

  private _setSpacerHeight(spacer: DOMConstructor, height: number | 'auto') {
    if (height === 'auto') {
      spacer.setHeight(0);
      spacer.DOMRoot.style.flexGrow = '1';
    }
    else {
      spacer.setHeight(height);
      spacer.DOMRoot.style.flexGrow = '0';
    }
  }

  constructor(opts: VirtualScrollStructure) {
    this._container = opts.container;
    this._container.classList.add(classes.scrollableContainer!);
    this._scrollHeightFiller = new DOMConstructor(this._container, [classes.scrollHeightFiller!], opts.scrollHeightFiller);
    this._viewportContainer = new DOMConstructor(this._container, [classes.viewportContainer!], opts.viewportContainer);
    this._scrollCanvas = new DOMConstructor(this._viewportContainer.DOMRoot, [classes.scrollCanvas!], opts.scrollCanvas);
    this._topSpacer = new DOMConstructor(this._scrollCanvas.DOMRoot, [classes.topSpacer!], opts.topSpacer);
    this._contentLayer = new DOMConstructor(this._scrollCanvas.DOMRoot, [classes.contentLayer!], opts.contentLayer);
    this._bottomSpacer = new DOMConstructor(this._scrollCanvas.DOMRoot, [classes.bottomSpacer!], opts.bottomSpacer);
    this._containerScroller = new ScrollRelay(this._container);
    this._viewportScroller = new ScrollRelay(this._viewportContainer.DOMRoot);
    this._contentLayerStyles = getComputedStyle(this._contentLayer.DOMRoot);

    this._container.setAttribute('data-lv-scroller', '');
    this._viewportContainer.DOMRoot.setAttribute('data-lv-viewport', '');
    this._contentLayer.DOMRoot.setAttribute('data-lv-content-layer', '');

    this._resizeObserver = new ResizeObserver(this._handleResize);
    
    this._resizeObserver.observe(this._container);
    this._resizeObserver.observe(this._viewportContainer.DOMRoot);

    requestAnimationFrame(() => {
      this._container.scrollTop = 0;
      this._viewportContainer.DOMRoot.scrollTop = 0;
      this.setTopSpacerHeight(0);
      this.setBottomSpacerHeight('auto');
    });
  }

  attach(eventBus: IEventEmitter<IEventMap>) {
    this._eventBus = eventBus;
    this._containerScroller.attach(eventBus, 'onScroll');
    this._viewportScroller.attach(eventBus, 'onContentScroll');
  }

  scroll(top: number) {
    this._viewportContainer.DOMRoot.scroll({ top });
  }

  setScrollTop(scrollTop: number) {
    this._containerScroller.setScrollTop(scrollTop);
  }

  getScrollTop(): number {
    return this._containerScroller.scrollTop;
  }

  setViewportTop(viewportTop: number) {
    this._viewportScroller.setScrollTop(viewportTop);
  }

  getViewportTop(): number {
    return this._viewportScroller.scrollTop;
  }

  setScrollHeight(scrollHeight: number) {
    this._scrollHeightFiller.setHeight(scrollHeight);
  }

  getScrollHeight(): number {
    return this._containerScroller.scrollHeight;
  }

  setScrollCanvasHeight(height: number) {
    this._scrollCanvas.setHeight(height);
  }

  getScrollCanvasHeight(): number {
    return this._viewportScroller.scrollHeight;
  }

  getTopSpacerBottom(): number {
    return this._topSpacer.offsetHeight;
  }

  getBottomSpacerTop(): number {
    return this._bottomSpacer.offsetTop;
  }

  setTopSpacerHeight(height: number | 'auto') {
    this._setSpacerHeight(this._topSpacer, height);
  }

  getTopSpacerHeight(): number {
    return this._topSpacer.offsetHeight;
  }

  setBottomSpacerHeight(height: number | 'auto') {
    this._setSpacerHeight(this._bottomSpacer, height);
  }

  getBottomSpacerHeight(): number {
    return this._bottomSpacer.offsetHeight;
  }

  appendItem(item: HTMLElement | DocumentFragment) {
    this._contentLayer.DOMRoot.appendChild(item);
  }

  prependItem(item: HTMLElement | DocumentFragment) {
    this._contentLayer.DOMRoot.prepend(item);
  }

  getClientWidth(): number {
    return this._containerScroller.clientWidth;
  }

  getClientHeight(): number {
    return this._containerScroller.clientHeight;
  }
  
  getViewportWidth(): number {
    return this._viewportScroller.clientWidth;
  }

  getViewportHeight(): number {
    return this._viewportScroller.clientHeight;
  }

  getRowGap(): number {
    return parseFloat(this._contentLayerStyles.rowGap) || 0; // 0 in case rowGap returns "normal" and therefore parseFloat returns NaN
  }

  getColumnCount(): number {
    return this._contentLayerStyles.gridTemplateColumns.split(' ').length;
  }

  getFirstItem(): Element | null {
    return this._contentLayer.DOMRoot.firstElementChild;
  }

  getLastItem(): Element | null {
    return this._contentLayer.DOMRoot.lastElementChild;
  }

  getItems(): HTMLCollection {
    return this._contentLayer.DOMRoot.children;
  }

  getContentLayer(): HTMLElement {
    return this._contentLayer.DOMRoot;
  }

  clear() {
    const contentLayer = this._contentLayer.DOMRoot;

    while(contentLayer.firstChild) {
      contentLayer.firstChild.remove();
    }
  }

  refresh() {
    this._containerScroller.refresh();
    this._viewportScroller.refresh();
    this._topSpacer.refresh();
    this._bottomSpacer.refresh();
  }

  dispose() {
    this._containerScroller.dispose();
    this._viewportScroller.dispose();
    this._resizeObserver.disconnect();    
    this._eventBus = null;
  }
}