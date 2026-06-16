import { createRoot } from 'react-dom/client';
import { useCallback, useState } from 'react';
import VirtualizedListReact, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';
import '../../tests/e2e/loadFrameValidation';

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
  const [data, setData] = useState(Array.from({ length: itemsCount }, (_, i) => ({ i })));
  const [insertionIndex, setInsertionIndex] = useState(data.length - 1);
  const [renderedIndices, setRenderedIndices] = useState({ startIndex: 0, endIndex: 0 });
  const { startIndex, endIndex } = renderedIndices;
  const total = endIndex - startIndex + 1;

  const addItem = () => {
    const newData = data.slice(0, insertionIndex).concat({ i: data.length }, data.slice(insertionIndex));
    setData(newData);
  };

  const updateStats = useCallback((startIndex: number, endIndex: number) => {
    setRenderedIndices({ startIndex, endIndex });
  }, []);

  return (
    <>
      <div>Rendered indices {startIndex} - {endIndex}, total {total} of {data.length}.</div>
      <VirtualizedListReact<Data> overscanHeight={100} data={data} renderItem={ListItem} {...styling} onAfterItemsRendered={updateStats} />
      <div>
        <button onClick={addItem}>Add item</button>
        <label htmlFor="insertion-index">At index:</label>
        <input type="number" id="insertion-index" min={0} max={data.length} onChange={({ target }) => setInsertionIndex(Number(target.value))} value={insertionIndex}/>
      </div>
    </>
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);