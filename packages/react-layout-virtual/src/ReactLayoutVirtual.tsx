/**
 * @fileoverview VirtualizedList React component.
 * @license MIT
 * @author Alexandr Kalabin
 */

import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutVirtual, DynamicListLayout } from 'layout-virtual/core';
import ReactRenderer from './ReactRenderer';
import type { ItemRenderer, VirtualizedListReactProps } from './types';

export default function VirtualizedListReact<ItemData = unknown>(props: VirtualizedListReactProps<ItemData>) {
  const { overscanHeight = 200, data, renderItem, scrollerRef } = props;
  const { scrollerClass, viewportClass, contentLayerClass } = props;
  const { onAfterItemsRendered } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollHeightFillerRef = useRef<HTMLDivElement>(null);
  const viewportContainerRef = useRef<HTMLDivElement>(null);
  const scrollCanvasRef = useRef<HTMLDivElement>(null);
  const topSpacerRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<HTMLDivElement>(null);
  const bottomSpacerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<React.ReactNode[]>([]);
  const renderer = useRef<ReactRenderer<ItemData> | undefined>(undefined);
  const list = useRef<LayoutVirtual<ItemData, ItemRenderer<ItemData>> | undefined>(undefined);

  useLayoutEffect(() => {
    renderer.current = new ReactRenderer<ItemData>({
      container: scrollerRef?.current || containerRef.current!,
      scrollHeightFiller: scrollHeightFillerRef.current!,
      viewportContainer: viewportContainerRef.current!,
      scrollCanvas: scrollCanvasRef.current!,
      topSpacer: topSpacerRef.current!,
      contentLayer: contentLayerRef.current!,
      bottomSpacer: bottomSpacerRef.current!,
      itemsSetter: setVisibleItems,
    });

    const layout = new DynamicListLayout<ItemData, ItemRenderer<ItemData>>({ overscanHeight, renderer: renderer.current });
    
    list.current = new LayoutVirtual<ItemData, ItemRenderer<ItemData>>({ layout });

    const scroller = scrollerRef?.current;

    if (scroller) {
      scroller.classList.add(scrollerClass || '');
    }
  }, []);

  useEffect(() => {
    if (list.current) {
      list.current.setData(data);
      list.current.setRenderItem(renderItem);
    }
  }, [data, renderItem]);

  useEffect(() => {
    if (list.current) {
      list.current.setEventListener('onAfterItemsRendered', onAfterItemsRendered);
    }
  }, [onAfterItemsRendered]);

  useEffect(() => {
    renderer.current?.commit();
  }, [visibleItems]);

  const scrollerContent = <>
    <div ref={scrollHeightFillerRef}></div>
    <div className={viewportClass} ref={viewportContainerRef}>
      <div ref={scrollCanvasRef}>
        <div ref={topSpacerRef}></div>
        <div className={contentLayerClass} ref={contentLayerRef}>{ visibleItems }</div>
        <div ref={bottomSpacerRef}></div>
      </div>
    </div>
  </>;

  return (
    scrollerRef && scrollerRef.current 
      ? createPortal(scrollerContent, scrollerRef.current)
      : <div className={scrollerClass} ref={containerRef}>{ scrollerContent }</div>
  );
};
