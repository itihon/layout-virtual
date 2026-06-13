import { useCallback, useState } from 'react';
import Resizer from './Resizer';
import VirtualizedGrid, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';
import type { ILayoutVirtual } from 'layout-virtual/types';
import classes from './ResponsiveGridExample.module.css';

const styling: VirtualizedListReactClasses = {
  scrollerClass: classes['lv-scroller'],
  viewportClass: classes['lv-viewport'],
  contentLayerClass: classes['lv-content-layer'],
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
    <div ref={ref} className={classes['list-item']} id={`item-${i}`} data-index={index}>
      <div className={classes['li-icon']}>📁</div>
      <div className={classes['li-index']}>{`#${i}`}</div>
      <div className={classes['li-header']}>{ header }</div>
      <div className={classes['li-description']}>{ description }</div>
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
      <div>Rendered indeces {startIndex} - {endIndex}, total {total} of {data.length}.</div>
      <Resizer className={classes.resizer} buttonRight={18} buttonBottom={4} initialWidth={'100%'} initialHeight={'70vh'} widthFactor={2}>
        <VirtualizedGrid<Data> overscanHeight={100} data={data} renderItem={ListItem} {...styling} getApi={getApi} />
      </Resizer>
    </>
  );
};

export default ResponsiveGridExample;