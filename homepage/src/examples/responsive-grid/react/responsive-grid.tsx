import { useCallback, useState } from 'react';
import LayoutVirtual, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';
import type { ILayoutVirtual } from 'layout-virtual/types';

const styling: VirtualizedListReactClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

type Data = { i: number; image?: string; title: string; excerpt: string };

const titles = [
  'Windowing 101',
  'Recycling DOM nodes without losing scroll position',
  'Dynamic item heights',
  'Why measure when the browser already knows? What is measuring and how and why it works?',
  'Smooth scrolling through ten thousand rows',
  'Overscan: rendering a little more than you see',
  'From fixed-size lists to fully dynamic grids',
];

const excerpts = [
  'Render only what fits.',
  'Recycling pools reuse existing nodes instead of mounting and unmounting on every scroll event.',
  'Dynamic heights mean no upfront measurement pass and no layout thrashing as items resize.',
  'A short primer on how virtualization keeps memory and paint cost flat regardless of list length.',
  'Scrolling through a long feed should feel the same whether it has a hundred items or a hundred thousand, and that consistency comes from windowing the visible range and letting everything else stay unmounted until it is needed, then recycling the freed nodes for whatever scrolls into view next.',
];

function ArticleCard({ data, ref, index }: ListItemProps<Data>) {
  const { image, title, excerpt } = data;

  return (
    <div ref={ref} className={'article-card'} data-index={index}>
      <div className={'ac-index'}>{`#${data.i}`}</div>
      {image && <img className={'ac-image'} src={image} alt={''} loading={'lazy'} />}
      <div className={'ac-body'}>
        <h3 className={'ac-title'}>{title}</h3>
        <p className={'ac-excerpt'}>{excerpt}</p>
        <button className={'ac-button'}>Learn more</button>
      </div>
    </div>
  );
}

const ResponsiveGridExample = () => {
  const data = Array.from({ length: 1000 }, (_, i) => ({
    i,
    image: i % 3 ? undefined : `https://picsum.photos/seed/${i}/400/240`,
    title: titles[i % titles.length],
    excerpt: excerpts[i % excerpts.length],
  }));
  const [renderedIndices, setRenderedIndices] = useState({ startIndex: 0, endIndex: 0 });
  const { startIndex, endIndex } = renderedIndices;
  const total = endIndex - startIndex + 1;

  const getApi = useCallback((api: ILayoutVirtual) => {
    api.on('onAfterItemsRendered', (startIndex, endIndex) => {
      setRenderedIndices({ startIndex, endIndex });
    });
  }, []);

  return (
    <>
      <h4>Try to resize the container and scroll.</h4>
      <div>Rendered indices {startIndex} - {endIndex}, total {total} of {data.length}.</div>
      <LayoutVirtual<Data> overscanHeight={200} data={data} renderItem={ArticleCard} {...styling} getApi={getApi} />
    </>
  );
};

export default ResponsiveGridExample;