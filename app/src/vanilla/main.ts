import VirtualizedList, { DynamicListLayout, ArrayItemStore, DOMRenderer } from 'layout-virtual';

const itemsCount = Number(new URLSearchParams(window.location.search).get('itemsCount')) || 1000;

const app = document.getElementById('app')!;

function render(data: { i: number } | unknown) {
  const item = document.createElement('div');
  const { i } = (data as { i: number });

  item.classList.add('list-item');
  item.id = `item-${i}`;
  item.textContent = `Item ${i}.`

  if (i % 2 === 0) {
    const div2 = document.createElement('div');
    div2.textContent = 'Second line.';
    item.appendChild(div2);
  }
  else if (i % 3 === 0) {
    const div2 = document.createElement('div');
    div2.textContent = 'Second line.';
    item.appendChild(div2);

    const div3 = document.createElement('div');
    div3.textContent = 'Third line.';
    item.appendChild(div3);
  }
  else if (i % 5 === 0) {
    const div2 = document.createElement('div');
    div2.textContent = 'Second line.';
    item.appendChild(div2);

    const div3 = document.createElement('div');
    div3.textContent = 'Third line.';
    item.appendChild(div3);

    const div4 = document.createElement('div');
    div4.textContent = 'Fourth line.';
    item.appendChild(div4);
  }

  return item;
}

const container = document.createElement('div');
const store = new ArrayItemStore();
const renderer = new DOMRenderer(container);
const layout = new DynamicListLayout({ overscanHeight: 100, renderer });
const list = new VirtualizedList({ layout, store });

app.appendChild(container);

for (let i = 0; i < itemsCount; i++) {
  list.insert({
    data: { i: i },
    render,
  }, i);
}