import { createRoot } from 'react-dom/client';
import { useCallback, useState } from 'react';
import VirtualizedListReact, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';
import '../../tests/e2e/loadFrameValidation';
import type { ILayoutVirtual } from 'layout-virtual/types';

const itemsCount = Number(new URLSearchParams(window.location.search).get('itemsCount')) || 1000;
const styling: VirtualizedListReactClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
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
    <div ref={ref} className="list-item" id={`item-${i}`} data-index={index}>
      {`Item ${i}.`}
      {extraLines.map((text, idx) => <div key={idx}>{text}</div>)}
    </div>
  );
};

function App() {
  const data = Array.from({ length: itemsCount }, (_, i) => ({ i }));
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
      <div>Rendered indices {startIndex} - {endIndex}, total {total} of {data.length}.</div>
      <VirtualizedListReact<Data> overscanHeight={100} data={data} renderItem={ListItem} {...styling} getApi={getApi} />
    </>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);