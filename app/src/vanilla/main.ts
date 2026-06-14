import VirtualizedList, { type ListItemProps, type VirtualizedListDOMClasses } from 'layout-virtual';
import '../../tests/e2e/loadFrameValidation';
import type { ILayoutVirtual } from 'layout-virtual/types';

const itemsCount = Number(new URLSearchParams(window.location.search).get('itemsCount')) || 1000;
const styling: VirtualizedListDOMClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

type Data = { i: number };

function ListItem({ data, index }: ListItemProps<Data>) {
  const i = data.i;
  const listItem = document.createElement('div');

  listItem.classList.add('list-item');
  listItem.dataset.index = index.toString();
  listItem.id = `item-${i}`;
  listItem.textContent = `Item ${i}.`

  const extraLines =
    i % 5 === 0 ? ['Second line.', 'Third line.', 'Fourth line.'] :
    i % 3 === 0 ? ['Second line.', 'Third line.'] :
    i % 2 === 0 ? ['Second line.'] :
    [];

  for (const extraLine of extraLines) {
    const div2 = document.createElement('div');
    div2.textContent = extraLine;
    listItem.appendChild(div2);
  }

  return listItem;
};

function getApi(api: ILayoutVirtual) {
  api.on('onAfterItemsRendered', (startIndex, endIndex) => {
    const total = endIndex - startIndex + 1;
    stats.textContent = `Rendered indices ${startIndex} - ${endIndex}, total ${total} of ${data.length}.`;
  });
}

const data = Array.from({ length: itemsCount }, (_, i) => ({ i }));
const container = VirtualizedList({ overscanHeight: 100, data, renderItem: ListItem, ...styling, getApi });
const stats = document.createElement('div');

const app = document.getElementById('app')!;
app.append(stats, container);
