import LayoutVirtual, { type ListItemProps, type VirtualizedListDOMClasses } from 'layout-virtual';
import type { ILayoutVirtual } from 'layout-virtual/types';

const styling: VirtualizedListDOMClasses = {
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

function ListItem({ data, index }: ListItemProps<Data>) {
  const i = data.i;
  const listItem = document.createElement('div');
  const icon = document.createElement('div');
  const itemIndex = document.createElement('div');
  const header = document.createElement('div');
  const description = document.createElement('div');

  listItem.classList.add('list-item');
  listItem.id = `item-${i}`;
  listItem.dataset.index = index.toString();

  icon.classList.add('li-icon');
  icon.textContent = '📁';

  itemIndex.classList.add('li-index');
  itemIndex.textContent = `#${i}`;

  header.classList.add('li-header');
  header.textContent = i % 2 ? headers[0] : headers[1];

  description.classList.add('li-description');
  description.textContent = i % 2 ? descriptions[0] : descriptions[1];

  listItem.append(icon, itemIndex, header, description);

  return listItem;
}

const data = Array.from({ length: 1000 }, (_, i): Data => ({ i }));

function getApi(api: ILayoutVirtual) {
  api.on('onAfterItemsRendered', (startIndex, endIndex) => {
    const total = endIndex - startIndex + 1;
    stats.textContent = `Rendered indeces ${startIndex} - ${endIndex}, total ${total} of ${data.length}.`;
  });
}

const title = document.createElement('h4');
title.textContent = 'Try to resize the container and scroll.';

const container = LayoutVirtual({ overscanHeight: 100, data, renderItem: ListItem, ...styling, getApi });

const stats = document.createElement('div');
const app = document.getElementById('app')!;
app.append(title, stats, container);