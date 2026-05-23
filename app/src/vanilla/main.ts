import VirtualizedList, { type ListItemProps } from 'layout-virtual';

const itemsCount = Number(new URLSearchParams(window.location.search).get('itemsCount')) || 1000;

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

const data = Array.from({ length: itemsCount }, (_, i) => ({ i }));
const container = VirtualizedList({ overscanHeight: 100, data, renderItem: ListItem });

const app = document.getElementById('app')!;
app.appendChild(container);
