/**
 * @fileoverview DynamicListLayout measures unknown items' heights one frame before rendering. Items' heights depend on their content.
 * @license MIT
 * @author Alexandr Kalabin
 */

import type { 
  IEventEmitter,
  IEventMap,
  ScrollDirection,
  IRangeRenderer,
  IDynamicListLayout,
  IScrollableContainer,
} from "../types/types";

type DynamicListLayoutOptions<ItemData = unknown, ItemRenderer = Function> = { 
  overscanHeight: number; 
  renderer: IRangeRenderer<ItemData, ItemRenderer>; 
};

type SchedulerFn = {
  (): void;
  done(cb: () => void): SchedulerFn;
};

class RAFScheduler {
  private _rAFid: number | null = null;
  private _doneCBs: (() => void)[] = [];
  private _fn = () => {};
  private _call = (cb: () => void) => cb();

  private _wrapper = () => {
    this._fn();
    this._doneCBs.forEach(this._call);
    this._rAFid = null;
  };

  private _scheduler = (() => {
    if (this._rAFid === null) {
      this._rAFid = requestAnimationFrame(this._wrapper);
    }
  }) as SchedulerFn;

  private _done = (cb: () => void) => {
    this._doneCBs.push(cb);
    return this._scheduler;
  };

  constructor() {
    this._scheduler = Object.assign(this._scheduler, { done: this._done });
  }

  schedule = (fn: () => void) => {
    this._fn = fn;
    return this._scheduler;
  };
}

export default class DynamicListLayout<ItemData = unknown, ItemRenderer = Function> implements IDynamicListLayout<ItemData, ItemRenderer> {
  private _overscanHeight: number;
  private _eventBus: IEventEmitter<IEventMap> | null = null;
  private _renderer: IRangeRenderer<ItemData, ItemRenderer>;
  private _scrollableContainer: IScrollableContainer;
  private _minItemHeight = document.documentElement.clientHeight;
  private _maxItemHeight = 0;
  private _previousDirection: ScrollDirection | '' = '';
  private _scrollAnchorItemOffsetTop = 0;
  private _scrollAnchorItemOffsetHeight = 0;
  private _scrollAnchorItemIndex = 0;
  private _spareSpace = 5000;

  private _getScrollRatio(offset = 0): number {
    const scrollableContainer = this._scrollableContainer;
    const scrollTop = scrollableContainer.getScrollTop();
    const scrollHeight = scrollableContainer.getScrollHeight(); 
    const clientHeight = scrollableContainer.getClientHeight();
    
    // const scrollRatio = Math.min(Math.max(viewportTop + offset, 0) / Math.min(Math.max(scrollCanvasHeight - viewportHeight, 1), 0), 0) || 0;
    const scrollRatio = Math.max(scrollTop + offset, 0) / (scrollHeight - clientHeight) || 0;
    console.log('scrollRatio:', scrollRatio, 'offset:', offset, scrollTop, scrollHeight, clientHeight);

    return scrollRatio;
  }

  private _getItemIndexByScrollTop(offset = 0) {
    const columnCount = this._scrollableContainer.getColumnCount();
    const lastIndex = (this._renderer.dataSize - 1) / columnCount;

    return Math.min(Math.round(this._getScrollRatio(offset) * lastIndex), lastIndex) * columnCount;
  }

  private _updateVisibleItems = () => {
    console.log('_updateVisibleItems')
    const scrollableContainer = this._scrollableContainer;
    
    scrollableContainer.setTopSpacerHeight(scrollableContainer.getTopSpacerHeight());
    scrollableContainer.setBottomSpacerHeight(scrollableContainer.getBottomSpacerHeight());

    this._renderer.clear();
    this._renderItems(scrollableContainer.getViewportTop(), 'down');
  };

  private _scheduleVisibleItemsUpdate = new RAFScheduler().schedule(this._updateVisibleItems);

  private _detectScrollAnchorItemOffset(item: Element, direction: ScrollDirection): boolean {
    const scrollableContainer = this._scrollableContainer;
    const viewportTop = scrollableContainer.getViewportTop();
    const viewportHeight = scrollableContainer.getViewportHeight();
    const offsetAnchor = direction === 'down' 
      ? viewportTop + viewportHeight
      : viewportTop;

    const { offsetTop, offsetHeight } = (item as HTMLElement);
    const itemStyle = getComputedStyle(item);
    const rowGap = scrollableContainer.getRowGap();
    const marginTop = parseFloat(itemStyle.marginTop);
    const marginBottom = parseFloat(itemStyle.marginBottom);
    const itemIndex = this._renderer.getIndex(item);

    if (itemIndex === undefined) return false;

    if (offsetTop - marginTop <= offsetAnchor && offsetTop + offsetHeight + marginBottom + rowGap >= offsetAnchor) {
      this._scrollAnchorItemOffsetTop = offsetTop - marginTop;
      this._scrollAnchorItemOffsetHeight = marginTop + offsetHeight + marginBottom + rowGap;
      this._scrollAnchorItemIndex = itemIndex;
      return true;
    }

    return false;
  }

  private _renderItems = (scrollTop: number, direction: ScrollDirection) => {
    const scrollableContainer = this._scrollableContainer;
    const overscanHeight = this._overscanHeight;
    const spareSpace = this._spareSpace;

    scrollableContainer.refresh();

    // prevents layout shift in Firefox
    // if (this._previousDirection !== direction) {
    //   scrollableContainer.setTopSpacerHeight(scrollableContainer.getTopSpacerHeight());
    //   scrollableContainer.setBottomSpacerHeight(scrollableContainer.getBottomSpacerHeight());
    //   this._previousDirection = direction;
    //   return;
    // }

    // calculate index range to be rendered
    const columnCount = scrollableContainer.getColumnCount();
    const rowGap = scrollableContainer.getRowGap();
    const viewportHeight = scrollableContainer.getViewportHeight();
    const halfViewportHeight = viewportHeight / 2;
    const halfRangeToFill = halfViewportHeight + overscanHeight;
    const itemsPerHalfRange = Math.ceil(halfRangeToFill / this._minItemHeight) * columnCount;
    const middleIndex = this._getItemIndexByScrollTop();
    const firstRenderedIndex = this._renderer.getRenderedBoundaryIndex('first');
    const lastRenderedIndex = this._renderer.getRenderedBoundaryIndex('last');
    const renderStartIndex = middleIndex - itemsPerHalfRange;
    const renderEndIndex = middleIndex + itemsPerHalfRange - 1;
    const { dataSize } = this._renderer;

    console.log('_renderItems middle range index:', middleIndex, 'items per half range:', itemsPerHalfRange, 'total items count to be rendered:', renderEndIndex - renderStartIndex + 1);

    for (const item of scrollableContainer.getItems()) {
      // update min and max item height
      this._updateItemHeightBounds(item, rowGap);
    }

    const removedHeight = this._renderer.render(renderStartIndex, renderEndIndex, direction);
    
    if (direction === 'down') {
      console.log('SCROLLING DOWN')
      const isFastScroll = scrollableContainer.getBottomSpacerTop() < scrollTop;
      
      // cut extra space below
      if (lastRenderedIndex === dataSize - 1) {
        if (scrollableContainer.getBottomSpacerTop() < scrollableContainer.getViewportTop() + viewportHeight) {
          console.error('cut extra space below')
          scrollableContainer.setScrollCanvasHeight(scrollableContainer.getScrollCanvasHeight() - scrollableContainer.getBottomSpacerHeight());
          scrollableContainer.setBottomSpacerHeight(0);
        }
      }

      if (isFastScroll) {
        console.warn('Fast scroll down.');
        scrollableContainer.setTopSpacerHeight(scrollTop - overscanHeight);
        scrollableContainer.setBottomSpacerHeight('auto');
      }
      else {
        scrollableContainer.setTopSpacerHeight(scrollableContainer.getTopSpacerHeight() + removedHeight);
        scrollableContainer.setBottomSpacerHeight('auto');
      }

      // add spare space below
      if (renderEndIndex < dataSize - 1) {
        if (scrollableContainer.getBottomSpacerHeight() < spareSpace) {
          scrollableContainer.setScrollCanvasHeight(scrollableContainer.getScrollCanvasHeight() + spareSpace);
          console.warn('Added spare space below');
        }
      }
    }
    else if (direction === 'up') {
      console.log('SCROLLING UP')
      const isFastScroll = scrollableContainer.getTopSpacerBottom() > scrollTop + viewportHeight;

      // cut extra space above
      if (firstRenderedIndex === 0) {
        if (scrollableContainer.getTopSpacerBottom() > scrollableContainer.getViewportTop()) {
          console.error('cut extra space above')
          scrollableContainer.setScrollCanvasHeight(scrollableContainer.getScrollCanvasHeight() - scrollableContainer.getTopSpacerHeight());
          scrollableContainer.setTopSpacerHeight(0);
          scrollableContainer.setViewportTop(0);
        }
      }

      if (isFastScroll) {
        console.warn('Fast scroll up.');
        scrollableContainer.setTopSpacerHeight('auto');
        scrollableContainer.setBottomSpacerHeight(scrollableContainer.getScrollCanvasHeight() - (scrollTop + viewportHeight + overscanHeight));
      }
      else {
        scrollableContainer.setTopSpacerHeight('auto');
        scrollableContainer.setBottomSpacerHeight(scrollableContainer.getBottomSpacerHeight() + removedHeight);
      }

      // Add spare space above.
      if (renderStartIndex > 0) {
        
        // prevents layout shift in WebKit and in Firefox
        if (this._previousDirection !== direction) {
          scrollableContainer.refresh();
          console.error('Direction changed. Refresh.');
        }

        if (scrollableContainer.getTopSpacerHeight() < spareSpace) {
          scrollableContainer.setScrollCanvasHeight(scrollableContainer.getScrollCanvasHeight() + spareSpace);
          scrollableContainer.setViewportTop(scrollableContainer.getViewportTop() + spareSpace);
          console.warn('Added spare space above.');
        }
      }
    }

    this._previousDirection = direction;

    return this._renderer.flush();
  };

  private _adjustScrollbarThumb = (viewportTop: number, direction: ScrollDirection) => {
    const scrollableContainer = this._scrollableContainer;
    // const viewportTop = scrollableContainer.getViewportTop();
    const viewportHeight = scrollableContainer.getViewportHeight();
    const scrollHeight = scrollableContainer.getScrollHeight();
    const clientHeight = scrollableContainer.getClientHeight();
    // const items = scrollableContainer.getItems();
    const offsetAnchor = direction === 'down' 
      ? viewportTop + viewportHeight
      : viewportTop;

    let fraction = (offsetAnchor - this._scrollAnchorItemOffsetTop) / this._scrollAnchorItemOffsetHeight;

    if (fraction > 1 || fraction < 0) {
      console.error('Index fraction must be between 0 and 1. fraction:', fraction, 'Corrected to 0');
      fraction = 0;
    }

    const indexRatio = (this._scrollAnchorItemIndex + fraction) / (this._renderer.dataSize - 1);
    const scrollbarThumbPosition = indexRatio * (scrollHeight - clientHeight);
    
    scrollableContainer.setScrollTop(scrollbarThumbPosition);

    console.log('_adjustScrollbarThumb scroll anchor item index:', this._scrollAnchorItemIndex, 'fraction:', fraction, 'indexRatio:', indexRatio, 'position:', scrollbarThumbPosition);
  };

  private _getScrollAnchorItemPosition(): number | null {
    const scrollableContainer = this._scrollableContainer;
    const renderer = this._renderer;
    const totalItems = renderer.dataSize;
    const columnCount = scrollableContainer.getColumnCount();
    const totalRows = Math.ceil(totalItems / columnCount);
    const clientHeight = scrollableContainer.getClientHeight();
    const scrollRatio = this._getScrollRatio();
    const lastIndex = totalItems - 1;
    const fractionalRowIndex = totalRows * scrollRatio;
    const index1 = Math.min(Math.floor(fractionalRowIndex) * columnCount, lastIndex);
    const index2 = Math.min(index1 + columnCount, lastIndex);
    const renderedItem1 = renderer.getItem(index1) as HTMLElement | undefined;
    const renderedItem2 = renderer.getItem(index2) as HTMLElement | undefined || renderedItem1;
    const indexFraction = fractionalRowIndex % (totalRows - 1) % Math.max(Math.floor(fractionalRowIndex), 1);

    if (!renderedItem1 || !renderedItem2) {
      console.error('Missing items for interpolation', index1, index2);
      return null;
    };
    
    const marginTop1 = parseFloat(getComputedStyle(renderedItem1).marginTop);
    const marginBottom1 = parseFloat(getComputedStyle(renderedItem1).marginBottom);
    const marginTop2 = parseFloat(getComputedStyle(renderedItem2).marginTop);

    const itemTop1 = renderedItem1.offsetTop - marginTop1;
    const itemTop2 = renderedItem2.offsetTop - marginTop2;
    const itemHeight1 = renderedItem1.offsetHeight + marginTop1 + marginBottom1;
    const interpolatedHeight = indexFraction * (itemTop2 - itemTop1) || itemHeight1 * indexFraction;
    const interpolatedTop = itemTop1 + interpolatedHeight;

    const viewportAnchor = clientHeight * scrollRatio;

    const position = interpolatedTop - viewportAnchor;

    console.log('_getScrollAnchorItemPosition:', index1, index2, fractionalRowIndex, indexFraction);

    return position;
  }

  private _scrollContent = async (scrollTop: number, direction: ScrollDirection) => {

    const scrollableContainer = this._scrollableContainer;

    // scrollableContainer.refresh();

    const scrollHeight = scrollableContainer.getScrollHeight();
    const viewportHeight = scrollableContainer.getViewportHeight();
    const scrollCanvasHeight = scrollableContainer.getScrollCanvasHeight();
    const scrollRatio = this._getScrollRatio();
    const viewportTop = scrollRatio * (scrollCanvasHeight - viewportHeight);

    await this._renderItems(viewportTop, direction);

    const scrollAnchorTop = this._getScrollAnchorItemPosition();

    if (scrollAnchorTop !== null) {
      scrollableContainer.setViewportTop(scrollAnchorTop);
    }
    else {
      // less precise position in case scroll anchor item was not found for some reason (highly unlikely)
      scrollableContainer.setViewportTop(viewportTop);
    }

    console.warn('_scrollContent scrollTop:', scrollTop, 'viewportTop:', viewportTop, 'scrollHeight:', scrollHeight, 'scrollCanvasHeight:', scrollCanvasHeight)
  };

  private _updateItemHeightRange = () => {
    const renderedItems = this._scrollableContainer.getItems(); 
    const rowGap = this._scrollableContainer.getRowGap();

    for (const item of renderedItems) {
      this._updateItemHeightBounds(item, rowGap);
    }
  };
  
  private _scheduleItemHeightRangeUpdate = new RAFScheduler().schedule(this._updateItemHeightRange);

  private _updateItemHeightBounds(item: Element, rowGap: number) {
    const itemStyle = getComputedStyle(item);
    const marginTop = parseFloat(itemStyle.marginTop);
    const marginBottom = parseFloat(itemStyle.marginBottom);
    const itemHeight = (item as HTMLElement).offsetHeight + marginTop + marginBottom + rowGap;

    // ignore 0 size items
    if (itemHeight < 1) return;

    this._minItemHeight = Math.min(this._minItemHeight, itemHeight);
    this._maxItemHeight = Math.max(this._maxItemHeight, itemHeight);
  }

  private _getAvgItemHeight() {
    return (this._minItemHeight + this._maxItemHeight) / 2;
  }

  private _updateScrollHeight = () => {
    const avgItemHeight = this._getAvgItemHeight();
    const columnCount = this._scrollableContainer.getColumnCount();
    const scrollHeight = avgItemHeight * (this._renderer.dataSize / columnCount);
    this._scrollableContainer.setScrollHeight(scrollHeight);
    this._scrollableContainer.setScrollCanvasHeight(scrollHeight);

    console.log('_updateScrollHeight, minItemHeight:', this._minItemHeight, 'maxItemHeight:', this._maxItemHeight, 'avgHeight:', avgItemHeight, 'scrollHeight:', scrollHeight)
  };

  private _updateScrollbar = (scrollTop: number, direction: ScrollDirection) => {
    new ResizeObserver((_, observer) => {
      console.warn('ResizeObserver')
      const items = this._scrollableContainer.getItems();
      const itemsCount = items.length;

      this._scrollableContainer.refresh();

      for (let idx = 0; idx < itemsCount; idx++) {
        if(this._detectScrollAnchorItemOffset(items[idx]!, direction)) break;
      }
      
      this._adjustScrollbarThumb(scrollTop, direction);

      observer.disconnect();
    }).observe(document.body);
  };

  private _scheduleScrollHeightUpdate = new RAFScheduler().schedule(this._updateScrollHeight);

  constructor({ overscanHeight = 100, renderer }: DynamicListLayoutOptions<ItemData, ItemRenderer>) {
    this._renderer = renderer;
    this._scrollableContainer = renderer.scrollableContainer;
    this._overscanHeight = overscanHeight;
  }

  get renderer() {
    return this._renderer;
  }

  attach(eventBus: IEventEmitter<IEventMap>) {
    this._eventBus = eventBus;
    this._scrollableContainer.attach(this._eventBus);

    const scheduleUpdate = this._scheduleVisibleItemsUpdate
      .done(this._scheduleItemHeightRangeUpdate)
      .done(
        this._scheduleScrollHeightUpdate.done(
          () => this._scrollableContainer.refresh()
        )
      );

    this._eventBus.on('onChange', scheduleUpdate);
    this._eventBus.on('onResize', scheduleUpdate);

    this._eventBus.on('onContentScroll', this._renderItems);
    // this._eventBus.on('onContentScroll', this._adjustScrollbarThumb);
    this._eventBus.on('onContentScroll', this._updateScrollbar);

    this._eventBus.on('onScroll', this._scrollContent);

    console.log('attached')
  } 

  detach() {
  }
}