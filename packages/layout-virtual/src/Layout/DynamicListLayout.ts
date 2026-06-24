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
  IDisposable,
} from "../types/types";

type DynamicListLayoutOptions<ItemData = unknown, ItemRenderer = Function> = { 
  overscanHeight: number; 
  renderer: IRangeRenderer<ItemData, ItemRenderer>; 
};

export default class DynamicListLayout<ItemData = unknown, ItemRenderer = Function> implements IDynamicListLayout<ItemData, ItemRenderer>, IDisposable {
  private _overscanHeight: number;
  private _eventBus: IEventEmitter<IEventMap> | null = null;
  private _renderer: IRangeRenderer<ItemData, ItemRenderer>;
  private _scrollableContainer: IScrollableContainer;
  private _minItemHeight = document.documentElement.clientHeight;
  private _maxItemHeight = 0;
  // private _scrollAnchorItemOffsetTop = 0;
  // private _scrollAnchorItemOffsetHeight = 0;
  // private _scrollAnchorItemIndex = 0;
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

  // private _getItemIndexByScrollTop2(offset = 0) {
  //   const columnCount = this._scrollableContainer.getColumnCount();
  //   const lastIndex = (this._renderer.dataSize - 1) / columnCount;

  //   return Math.min(Math.round(this._getScrollRatio(offset) * lastIndex), lastIndex) * columnCount;
  // }

  private _getItemIndexByScrollTop() {
    const totalItems = this._renderer.dataSize;
    const columnCount = this._scrollableContainer.getColumnCount();
    const totalRows = Math.ceil(totalItems / columnCount);
    const scrollRatio = this._getScrollRatio();
    const lastIndex = totalItems - 1;
    const fractionalRowIndex = totalRows * scrollRatio;
    const index = Math.min(Math.floor(fractionalRowIndex) * columnCount, lastIndex);
    const fraction = fractionalRowIndex % (totalRows - 1) % Math.max(Math.floor(fractionalRowIndex), 1);

    return { index, fraction };
  }

  private _updateVisibleItems = async () => {
    console.log('🔄 _updateVisibleItems')
    const scrollableContainer = this._scrollableContainer;
    const scrollPosition = scrollableContainer.getScrollTop();
    const scrollHeight = scrollableContainer.getScrollHeight();
    const clientHeight = scrollableContainer.getClientHeight();

    this._renderer.clear();

    // await this._renderer.flush();
    await this._scrollContent(scrollPosition, 'down', 0);

    this._updateItemHeightRange();
    this._updateScrollHeight();

    scrollableContainer.refresh();

    const newScrollHeight = scrollableContainer.getScrollHeight();
    const newClientHeight = scrollableContainer.getClientHeight();
    const scrollHeightRatio = ((newScrollHeight - newClientHeight) || 1) / ((scrollHeight - clientHeight) || 1);

    scrollableContainer.setScrollTop(scrollPosition * scrollHeightRatio);
    this._scrollContent(scrollPosition * scrollHeightRatio, 'down', 0);
  };

  private _updateVisibleItemsOnDataChange = async () => {
    const scrollableContainer = this._scrollableContainer;
    const renderer = this._renderer;

    scrollableContainer.refresh();

    const viewportTop = scrollableContainer.getViewportTop();
    const scrollTop = scrollableContainer.getScrollTop();
    const firstRenderedIndex = renderer.getRenderedBoundaryIndex('first');
    const topSpacerHeight = scrollableContainer.getTopSpacerHeight();

    scrollableContainer.setScrollTop(scrollTop);
    scrollableContainer.setViewportTop(viewportTop);
    scrollableContainer.setTopSpacerHeight(topSpacerHeight); // fix top spacer height before removing items to prevent layout shift

    renderer.clear();
    // await renderer.flush();

    await this._renderItems(viewportTop, 'down', 0, firstRenderedIndex); // starting from the first rendered index, otherwise layout shifts

    this._updateItemHeightRange();
    this._updateScrollHeight();

    scrollableContainer.refresh();

    const topSpacerHeightDelta = topSpacerHeight - scrollableContainer.getTopSpacerHeight();

    scrollableContainer.setScrollTop(scrollTop);
    scrollableContainer.setViewportTop(viewportTop - topSpacerHeightDelta); // spacers have flex-shrink: 0 by default 
    
    console.log('🔃 _updateVisisbleItemsOnDataChange');
  };

  private _renderItems = async (viewportTop: number, direction: ScrollDirection, _?: number, fromIndex?: number) => {
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
    // const viewportTop = scrollableContainer.getViewportTop();
    const topSpacerBottom = scrollableContainer.getTopSpacerBottom();
    const bottomSpacerTop = scrollableContainer.getBottomSpacerTop();
    const scrollRatio = this._getScrollRatio();
    const { dataSize } = this._renderer;

    let rangeToFillBefore = 0;
    let rangeToFillAfter = 0;
    let minVisibleIndex;
    let maxVisibleIndex;

    const overscanAbove = direction === 'up' ? overscanHeight : 0;
    const overscanBelow = direction === 'down' ? overscanHeight : 0;
    const isContentIntersectingViewport = (topSpacerBottom <= viewportTop + viewportHeight) && (bottomSpacerTop >= viewportTop);

    for (const item of scrollableContainer.getItems()) {
      const { offsetTop, offsetHeight } = item as HTMLElement;

      if (isContentIntersectingViewport) {
        // find the first visible index taking into account overscan height
        if (minVisibleIndex === undefined && offsetTop + offsetHeight >= viewportTop - overscanAbove) {
          minVisibleIndex = this._renderer.getIndex(item);
        }

        // find the last visible index taking into account overscan height
        if (maxVisibleIndex === undefined && offsetTop >= viewportTop + viewportHeight + overscanBelow) {
          maxVisibleIndex = this._renderer.getIndex(item);
        }
      }

      // update min and max item height
      this._updateItemHeightBounds(item, rowGap);
    }

    if (direction === 'down') {
      rangeToFillBefore = viewportHeight * scrollRatio;
      rangeToFillAfter = viewportHeight * (1 - scrollRatio) + overscanHeight;
    }
    else if (direction === 'up') {
      rangeToFillBefore = viewportHeight * scrollRatio + overscanHeight;
      rangeToFillAfter = viewportHeight * (1 - scrollRatio);
    }

    const rowsPerRangeBefore = Math.ceil(rangeToFillBefore / this._minItemHeight);
    const rowsPerRangeAfter = Math.ceil(rangeToFillAfter / this._minItemHeight);
    const middleIndex = this._getItemIndexByScrollTop().index;
    const firstRenderedIndex = this._renderer.getRenderedBoundaryIndex('first');
    const lastRenderedIndex = this._renderer.getRenderedBoundaryIndex('last');
    let renderStartIndex = middleIndex - rowsPerRangeBefore * columnCount;
    let renderEndIndex = middleIndex + (rowsPerRangeAfter + 1) * columnCount;

    // const isFastScroll = (direction === 'down' && scrollableContainer.getBottomSpacerTop() < scrollTop)
    //   || (direction === 'up' && scrollableContainer.getTopSpacerBottom() > scrollTop + viewportHeight);

    // if (minVisibleIndex === undefined) { // all rendered items are above the viewport
    //   minVisibleIndex = firstRenderedIndex;
    // }

    // if (maxVisibleIndex === undefined) { // all rendered items are above the viewport
    //   maxVisibleIndex = lastRenderedIndex;
    // }

    if (minVisibleIndex !== undefined && maxVisibleIndex !== undefined) {
      if (direction === 'down' && renderEndIndex < dataSize - 1) {
        // renderStartIndex = minVisibleIndex === firstRenderedIndex ? minVisibleIndex : Math.max(renderStartIndex, Math.min(minVisibleIndex, middleIndex));
        // renderStartIndex = Math.max(renderStartIndex, Math.min(minVisibleIndex, middleIndex));
        // renderStartIndex = Math.min(minVisibleIndex, middleIndex);

        // if (renderStartIndex < minVisibleIndex) {
          renderStartIndex = Math.min(minVisibleIndex, middleIndex);
        // }

        // if (!isFastScroll) {
          renderEndIndex = maxVisibleIndex === lastRenderedIndex ? renderEndIndex : Math.max(maxVisibleIndex, middleIndex);
        // }
      }
      else if (direction === 'up' && renderStartIndex > 0) {
        // if (!isFastScroll) {
          renderStartIndex = minVisibleIndex === firstRenderedIndex ? renderStartIndex : Math.min(minVisibleIndex, middleIndex);
        // }

        // renderEndIndex = maxVisibleIndex === lastRenderedIndex ? maxVisibleIndex : Math.min(renderEndIndex, Math.max(maxVisibleIndex, middleIndex));
        // renderEndIndex = Math.min(renderEndIndex, Math.max(maxVisibleIndex, middleIndex));
        // renderEndIndex = Math.max(maxVisibleIndex, middleIndex);

        // if (renderEndIndex > maxVisibleIndex) {
          renderEndIndex = Math.max(maxVisibleIndex, middleIndex);
        // }
      }
    }

    console.log('_renderItems', 'viewportTop:', viewportTop, 'renderStartIndex:', renderStartIndex, 'middleIndex:', middleIndex, 'renderEndIndex:', renderEndIndex, 'total items count to be rendered:', renderEndIndex - renderStartIndex + 1, 'minVisibleIndex:', minVisibleIndex, 'maxVisibleIndex:', maxVisibleIndex);

    if (fromIndex !== undefined) {
      renderStartIndex = fromIndex;
    }

    const removedHeight = this._renderer.render(renderStartIndex, renderEndIndex, direction);
    
    if (direction === 'down') {
      console.log('SCROLLING DOWN')
      
      // cut extra space below
      if (lastRenderedIndex === dataSize - 1) {
        if (scrollableContainer.getBottomSpacerTop() < scrollableContainer.getViewportTop() + viewportHeight) {
          console.error('cut extra space below')
          scrollableContainer.setScrollCanvasHeight(scrollableContainer.getScrollCanvasHeight() - scrollableContainer.getBottomSpacerHeight());
          scrollableContainer.setBottomSpacerHeight(0);
        }
      }

      // if (isFastScroll) {
      //   console.warn('Fast scroll down.');
      //   scrollableContainer.setTopSpacerHeight(scrollTop - overscanHeight);
      //   scrollableContainer.setBottomSpacerHeight('auto');
      // }
      // else {
        scrollableContainer.setTopSpacerHeight(scrollableContainer.getTopSpacerHeight() + removedHeight);
        scrollableContainer.setBottomSpacerHeight('auto');
      // }

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

      // cut extra space above
      if (firstRenderedIndex === 0) {
        if (scrollableContainer.getTopSpacerBottom() > scrollableContainer.getViewportTop()) {
          console.error('cut extra space above')
          scrollableContainer.setScrollCanvasHeight(scrollableContainer.getScrollCanvasHeight() - scrollableContainer.getTopSpacerHeight());
          scrollableContainer.setTopSpacerHeight(0);
          scrollableContainer.setViewportTop(0);
        }
      }

      // if (isFastScroll) {
      //   console.warn('Fast scroll up.');
      //   scrollableContainer.setTopSpacerHeight('auto');
      //   scrollableContainer.setBottomSpacerHeight(scrollableContainer.getScrollCanvasHeight() - (scrollTop + viewportHeight + overscanHeight));
      // }
      // else {
        scrollableContainer.setTopSpacerHeight('auto');
        scrollableContainer.setBottomSpacerHeight(scrollableContainer.getBottomSpacerHeight() + removedHeight);
      // }

      // Add spare space above.
      if (renderStartIndex > 0) {
        if (scrollableContainer.getTopSpacerHeight() < spareSpace) {
          scrollableContainer.refresh(); // <-- prevents layout shift in Firefox
          scrollableContainer.setScrollCanvasHeight(scrollableContainer.getScrollCanvasHeight() + spareSpace);
          scrollableContainer.setViewportTop(scrollableContainer.getViewportTop() + spareSpace);
          console.warn('Added spare space above.');
        }
      }
    }

    return this._renderer.flush().then(this._onAfterItemsRendered);
  };

  private _onAfterItemsRendered = () => {
    this._eventBus?.emit(
      'onAfterItemsRendered', 
      this._renderer.getRenderedBoundaryIndex('first') ?? -1,
      this._renderer.getRenderedBoundaryIndex('last') ?? -1,
      this._scrollableContainer.getItems(),
    );
  };

  private _getScrollAnchorItemPosition(): number | null {
    const scrollableContainer = this._scrollableContainer;
    const renderer = this._renderer;
    const totalItems = renderer.dataSize;
    const columnCount = scrollableContainer.getColumnCount();
    const totalRows = Math.ceil(totalItems / columnCount);
    const viewportHeight = scrollableContainer.getViewportHeight();
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

    const viewportAnchor = viewportHeight * scrollRatio;

    const position = interpolatedTop - viewportAnchor;

    console.log('_getScrollAnchorItemPosition:', index1, index2, fractionalRowIndex, indexFraction, position);

    return position;
  }

  private _scrollContent = async (scrollTop: number, direction: ScrollDirection, scrollDelta: number) => {

    const scrollableContainer = this._scrollableContainer;
    const clientHeight = scrollableContainer.getClientHeight();
    const scrollHeight = scrollableContainer.getScrollHeight();
    const viewportHeight = scrollableContainer.getViewportHeight();
    const scrollCanvasHeight = scrollableContainer.getScrollCanvasHeight();
    const scrollRangeRatio = ((scrollCanvasHeight - viewportHeight) || 1) / ((scrollHeight - clientHeight) || 1);
    const viewportTop = scrollableContainer.getViewportTop() + scrollDelta * scrollRangeRatio;
    
    await this._renderItems(viewportTop, direction);

    const scrollAnchorTop = this._getScrollAnchorItemPosition();

    scrollableContainer.refresh();

    const topSpacerBottom = scrollableContainer.getTopSpacerBottom();
    const bottomSpacerTop = scrollableContainer.getBottomSpacerTop();

    if (scrollAnchorTop !== null) {
      // prevents scroll canvas from viewport partial overlapping which entails gaps either at the top or at the bottom
      const upperDelta = scrollAnchorTop - topSpacerBottom;
      const lowerDelta = bottomSpacerTop - (scrollAnchorTop + viewportHeight);
      const newViewportTop = Math.min(Math.max(scrollAnchorTop, scrollAnchorTop - upperDelta), scrollAnchorTop + lowerDelta);

      scrollableContainer.setViewportTop(newViewportTop);
    }
    else {
      // less precise position in case scroll anchor item was not found for some reason (highly unlikely)
      const scrollRatio = this._getScrollRatio();
      const contentLayerHeight = bottomSpacerTop - topSpacerBottom;
      scrollableContainer.setViewportTop(topSpacerBottom + contentLayerHeight * scrollRatio - viewportHeight * scrollRatio);
    }

    console.warn('_scrollContent scrollTop:', scrollTop, 'viewportTop:', viewportTop, 'scrollAnchorTop:', scrollAnchorTop, 'scrollHeight:', scrollHeight, 'scrollCanvasHeight:', scrollCanvasHeight, 'scrollRangeRatio:', scrollRangeRatio, 'scrollDelta:', scrollDelta)
  };

  private _updateItemHeightRange = () => {
    const renderedItems = this._scrollableContainer.getItems(); 
    const rowGap = this._scrollableContainer.getRowGap();

    for (const item of renderedItems) {
      this._updateItemHeightBounds(item, rowGap);
    }
  };
  
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

  // private _detectScrollAnchorItemOffset(item: Element, direction: ScrollDirection): boolean {
  //   const scrollableContainer = this._scrollableContainer;
  //   const viewportTop = scrollableContainer.getViewportTop();
  //   const viewportHeight = scrollableContainer.getViewportHeight();
  //   const offsetAnchor = direction === 'down' 
  //     ? viewportTop + viewportHeight
  //     : viewportTop;

  //   const { offsetTop, offsetHeight } = (item as HTMLElement);
  //   const itemStyle = getComputedStyle(item);
  //   const rowGap = scrollableContainer.getRowGap();
  //   const marginTop = parseFloat(itemStyle.marginTop);
  //   const marginBottom = parseFloat(itemStyle.marginBottom);
  //   const itemIndex = this._renderer.getIndex(item);

  //   if (itemIndex === undefined) return false;

  //   if (offsetTop - marginTop <= offsetAnchor && offsetTop + offsetHeight + marginBottom + rowGap >= offsetAnchor) {
  //     this._scrollAnchorItemOffsetTop = offsetTop - marginTop;
  //     this._scrollAnchorItemOffsetHeight = marginTop + offsetHeight + marginBottom + rowGap;
  //     this._scrollAnchorItemIndex = itemIndex;
  //     return true;
  //   }

  //   return false;
  // }

  // private _adjustScrollbarThumb = (viewportTop: number, direction: ScrollDirection) => {
  //   const scrollableContainer = this._scrollableContainer;
  //   // const viewportTop = scrollableContainer.getViewportTop();
  //   const viewportHeight = scrollableContainer.getViewportHeight();
  //   const scrollHeight = scrollableContainer.getScrollHeight();
  //   const clientHeight = scrollableContainer.getClientHeight();
  //   // const items = scrollableContainer.getItems();
  //   const offsetAnchor = direction === 'down' 
  //     ? viewportTop + viewportHeight
  //     : viewportTop;

  //   let fraction = (offsetAnchor - this._scrollAnchorItemOffsetTop) / this._scrollAnchorItemOffsetHeight;

  //   if (fraction > 1 || fraction < 0) {
  //     console.error('Index fraction must be between 0 and 1. fraction:', fraction, 'Corrected to 0');
  //     fraction = 0;
  //   }

  //   const indexRatio = (this._scrollAnchorItemIndex + fraction) / (this._renderer.dataSize - 1);
  //   const scrollbarThumbPosition = indexRatio * (scrollHeight - clientHeight);
  //   
  //   scrollableContainer.setScrollTop(scrollbarThumbPosition);

  //   console.log('_adjustScrollbarThumb scroll anchor item index:', this._scrollAnchorItemIndex, 'fraction:', fraction, 'indexRatio:', indexRatio, 'position:', scrollbarThumbPosition);
  // };

  private _updateScrollbar = (_: number, direction: ScrollDirection) => {
    new ResizeObserver((_, observer) => {
      console.warn('ResizeObserver')
      // const items = this._scrollableContainer.getItems();
      // const itemsCount = items.length;
      const scrollableContainer = this._scrollableContainer;

      scrollableContainer.refresh();

      // for (let idx = 0; idx < itemsCount; idx++) {
      //   if(this._detectScrollAnchorItemOffset(items[idx]!, direction)) break;
      // }

      // ------------------------------------------
      const { index: scrollAnchorItemIndex, fraction: indexFraction } = this._getItemIndexByScrollTop();
      const scrollAnchorItem = this._renderer.getItem(scrollAnchorItemIndex);

      if (scrollAnchorItem) {
        const scrollTop = scrollableContainer.getScrollTop();
        const scrollHeight = scrollableContainer.getScrollHeight();
        const viewportTop = scrollableContainer.getViewportTop();
        const viewportHeight = scrollableContainer.getViewportHeight();
        const scrollCanvasHeight = scrollableContainer.getScrollCanvasHeight();
        const scrollRatio = this._getScrollRatio();
        const { offsetTop, offsetHeight } = (scrollAnchorItem as HTMLElement);
        const marginTop = parseFloat(getComputedStyle(scrollAnchorItem).marginTop);
        const marginBottom = parseFloat(getComputedStyle(scrollAnchorItem).marginBottom);
        const scrollAnchorItemOffset = offsetTop - marginTop + (offsetHeight + marginBottom + marginTop) * indexFraction;
        const scrollAnchorOffset = viewportTop + viewportHeight * scrollRatio;
        const viewportTopDelta = scrollAnchorOffset - scrollAnchorItemOffset;
        const scrollHeightRatio = scrollHeight / scrollCanvasHeight;
        const scrollTopDelta = viewportTopDelta * scrollHeightRatio;
        // const scrollCanvasDelta = scrollDelta * scrollHeightRatio;
        // let normalizedScrollDelta = direction === 'down' ? Math.max(scrollTopDelta, 1, scrollCanvasDelta)  : Math.min(scrollTopDelta, -1, scrollCanvasDelta); // scrollCanvasDelta is used for fast scrolling,
        let normalizedScrollDelta = 0;

        if (direction === 'down') {
          normalizedScrollDelta = Math.max(scrollTopDelta, 1);
        }
        else if (direction === 'up') {
          normalizedScrollDelta = Math.min(scrollTopDelta, -1);
        }

        // if (Math.abs(scrollDelta) > viewportHeight) {
        //   normalizedScrollDelta = scrollCanvasDelta;
        // }

        const scrollbarThumbPosition = scrollTop + normalizedScrollDelta;

        scrollableContainer.setScrollTop(scrollbarThumbPosition);

        console.log('_updateScrollbar scrollbarThumbPosition:', scrollbarThumbPosition, 'normalizedScrollDelta:', normalizedScrollDelta, 'scrollAnchorItemIndex:', scrollAnchorItemIndex, 'scrollTopDelta:', scrollTopDelta);
      }

      // ------------------------------------------
      
      // this._adjustScrollbarThumb(scrollTop, direction);

      observer.disconnect();
    }).observe(document.body);
  };

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

    this._eventBus.on('onChange', this._updateVisibleItemsOnDataChange);
    this._eventBus.on('onResize', this._updateVisibleItems);
    this._eventBus.on('onContentScroll', this._renderItems);
    this._eventBus.on('onContentScroll', this._updateScrollbar);
    this._eventBus.on('onScroll', this._scrollContent);

    console.log('attached')
  } 

  dispose() {
    this._renderer.dispose();
    this._eventBus?.off('onChange', this._updateVisibleItemsOnDataChange);
    this._eventBus?.off('onResize', this._updateVisibleItems);
    this._eventBus?.off('onContentScroll', this._renderItems);
    this._eventBus?.off('onContentScroll', this._updateScrollbar);
    this._eventBus?.off('onScroll', this._scrollContent);
    this._eventBus = null;
  }
}