import { useCallback, useState } from 'react';
import LayoutVirtual, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';
import type { ILayoutVirtual } from 'layout-virtual/types';

const styling: VirtualizedListReactClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

type Data = { i: number };

const headers = [
  'One line header.', 
  'Longer header, wraps to the next lines.',
];

const descriptions = [
  'A very short description.',
  'A much longer description text that wraps to the next lines at different card sizes.',
];

function ListItem({ data, ref, index }: ListItemProps<Data>) {
  const i = data.i;

  const header = i % 2 ? headers[0] : headers[1];
  const description = i % 2 ? descriptions[0] : descriptions[1];

  return (
    <div ref={ref} className={'list-item'} id={`item-${i}`} data-index={index}>
      <div className={'li-icon'}>📁</div>
      <div className={'li-index'}>{`#${i}`}</div>
      <div className={'li-header'}>{ header }</div>
      <div className={'li-description'}>{ description }</div>
    </div>
  );
};

const ResponsiveGridExample = () => {
  const data = Array.from({ length: 1000 }, (_, i) => ({ i }));
  const [renderedIndeces, setRenderedIndeces] = useState({ startIndex: 0, endIndex: 0 });
  const { startIndex, endIndex } = renderedIndeces;
  const total = endIndex - startIndex + 1;

  const getApi = useCallback((api: ILayoutVirtual) => {
    api.on('onAfterItemsRendered', (startIndex, endIndex) => {
      setRenderedIndeces({ startIndex, endIndex });
    });
  }, []);

  return (
    <>
      <h4>Try to resize the container and scroll.</h4>
      <div>Rendered indeces {startIndex} - {endIndex}, total {total} of {data.length}.</div>
      <LayoutVirtual<Data> overscanHeight={100} data={data} renderItem={ListItem} {...styling} getApi={getApi} />
    </>
  );
};

export default ResponsiveGridExample;