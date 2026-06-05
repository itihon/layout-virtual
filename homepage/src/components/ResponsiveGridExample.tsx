import React from 'react';
import VirtualizedGrid, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';
import Resizer from './Resizer';
import classes from './ResponsiveGridExample.module.css';

const itemsCount = 1000;
const styling: VirtualizedListReactClasses = {
  scrollerClass: classes['lv-scroller'],
  viewportClass: classes['lv-viewport'],
  contentLayerClass: classes['lv-content-layer'],
};

type Data = { i: number };

function ListItem({ data, ref, index }: ListItemProps<Data>) {
  const i = data.i;

  const extraLines =
    i % 5 === 0 ? ['Second line.', 'Third line.', 'Fourth line.'] :
    i % 3 === 0 ? ['Second line.', 'Third line.'] :
    i % 2 === 0 ? ['Second line.'] :
    [];

  return (
    <div ref={ref} className={classes['list-item']} id={`item-${i}`} data-index={index}>
      <div className={classes.icon}>📁</div>
      {`Item ${i}.`}
      {extraLines.map((text, idx) => <div key={idx}>{text}</div>)}
    </div>
  );
};

interface Props {
  
}

const ResponsiveGridExample: React.FC<Props> = ({  }) => {
  const data = Array.from({ length: itemsCount }, (_, i) => ({ i }));

  return (
    <>
      <div>Rendered indeces: n - n of n.</div>
      <Resizer className={classes.resizer} buttonRight={18} buttonBottom={4} initialWidth={'90%'} initialHeight={'70vh'} widthFactor={2}>
        <VirtualizedGrid<Data> overscanHeight={100} data={data} renderItem={ListItem} {...styling} />
      </Resizer>
    </>
  );
};

export default ResponsiveGridExample;