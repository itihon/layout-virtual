import VirtualizedList, { type ListItemProps, type VirtualizedListDOMClasses } from 'layout-virtual';
import '../../tests/e2e/loadFrameValidation';
import type { ILayoutVirtual } from 'layout-virtual/types';
import type { LayoutVirtual } from 'layout-virtual/core';

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

function addItem() {
  if (layoutVirtualApi) {
    const insertionIndex = Number(addItemInput.value);
    data = data.slice(0, insertionIndex).concat({ i: data.length }, data.slice(insertionIndex));

    layoutVirtualApi.setData(data);
  }

  addItemInput.max = data.length.toString();
}

function updateStats(startIndex: number, endIndex: number) {
  const total = endIndex - startIndex + 1;
  stats.textContent = `Rendered indices ${startIndex} - ${endIndex}, total ${total} of ${data.length}.`;
}

let layoutVirtualApi: LayoutVirtual | undefined;
let data = Array.from({ length: itemsCount }, (_, i) => ({ i }));
const container = VirtualizedList({ overscanHeight: 100, data, renderItem: ListItem, ...styling, onAfterItemsRendered: updateStats });
const stats = document.createElement('div');
const addItemContainer = document.createElement('div');
const addItemButton = document.createElement('button');
const addItemLabel = document.createElement('label');
const addItemInput = document.createElement('input');
const app = document.getElementById('app')!;

addItemButton.textContent = 'Add item';
addItemButton.addEventListener('click', addItem);

addItemLabel.textContent = 'At index:';
addItemLabel.htmlFor = 'insertion-index';

addItemInput.type = 'number';
addItemInput.id = 'insertion-index';
addItemInput.min = '0';
addItemInput.max = data.length.toString();
addItemInput.value = (data.length - 1).toString();

addItemContainer.append(addItemButton, addItemLabel, addItemInput);
app.append(stats, container, addItemContainer);
