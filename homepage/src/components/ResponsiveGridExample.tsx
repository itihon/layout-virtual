import { useCallback, useState, useMemo } from 'react';
import Resizer from './Resizer';
import VirtualizedGrid, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';
import classes from './ResponsiveGridExample.module.css';
import ItemIcon from '../assets/list-item.svg?react';

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
  'A much longer description that wraps to the next line on different card sizes, occupying more vertical space and increasing the card\'s height. This is often the case, especially for blog posts, comments or news feeds.',
];

function ListItem({ data, index }: ListItemProps<Data>) {
  const i = data.i;

  const header = i % 2 ? headers[0] : headers[1];
  const description = i % 2 ? descriptions[0] : descriptions[1];

  return (
    <div className={classes['list-item']} id={`item-${i}`} data-index={index}>
      <ItemIcon className={classes['li-icon']} />
      <div className={classes['li-index']}>{`#${i}`}</div>
      <div className={classes['li-header']}>{ header }</div>
      <div className={classes['li-description']}>{ description }</div>
    </div>
  );
};

const ResponsiveGridExample = () => {
  const data = useMemo(() => Array.from({ length: 1000 }, (_, i) => ({ i })), []);
  const [renderedIndices, setRenderedIndices] = useState({ startIndex: 0, endIndex: 0 });
  const { startIndex, endIndex } = renderedIndices;
  const total = endIndex - startIndex + 1;

  const updateStats = useCallback((startIndex: number, endIndex: number) => {
    setRenderedIndices({ startIndex, endIndex });
  }, []);

  return (
    <>
      <Resizer className={classes.resizer} buttonRight={18} buttonBottom={4} initialWidth={'100%'} initialHeight={'70vh'} widthFactor={2}>
        <div className={classes['status-bar']}>
          <div className={classes['status-left']}>
            <span className={classes['live-badge']}>
              <span className={classes['live-dot']} />
              Live
            </span>

            <span className={classes['status-title']}>
              Virtualization active
            </span>
          </div>

          <div className={classes['status-right']}>
            Showing <strong style={{ minWidth: '2ch', textAlign: 'center' }}>{total}</strong> of <strong>{data.length}</strong> items
            <span className={classes['status-separator']}>•</span>
            <span style={{ minWidth: '9ch', textAlign: 'center' }}>{startIndex} – {endIndex}</span>
          </div>
        </div>

        <VirtualizedGrid<Data> overscanHeight={100} data={data} renderItem={ListItem} {...styling} onAfterItemsRendered={updateStats} />

        <div className={classes['resize-hint']}>
          <span className={classes['live-dot']} />
          Resize
          <span className={classes['resize-arrow']}>⟶</span>
        </div>
      </Resizer>
    </>
  );
};

export default ResponsiveGridExample;