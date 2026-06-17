import LayoutVirtual, { type ListItemProps, type VirtualizedListDOMClasses } from 'layout-virtual';

const styling: VirtualizedListDOMClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

type Data = { i: number; image?: string; title: string; excerpt: string };

const titles = [
  'Windowing 101',
  'Recycling DOM nodes without losing scroll position',
  'Dynamic item heights',
  'Why measure when the browser already knows? What is measuring and how and why it works?',
  'Smooth scrolling through ten thousand rows',
  'Overscan: rendering a little more than you see',
  'From fixed-size lists to fully dynamic grids',
];

const excerpts = [
  'Render only what fits.',
  'Recycling pools reuse existing nodes instead of mounting and unmounting on every scroll event.',
  'Dynamic heights mean no upfront measurement pass and no layout thrashing as items resize.',
  'A short primer on how virtualization keeps memory and paint cost flat regardless of list length.',
  'Scrolling through a long feed should feel the same whether it has a hundred items or a hundred thousand, and that consistency comes from windowing the visible range and letting everything else stay unmounted until it is needed, then recycling the freed nodes for whatever scrolls into view next.',
];

function ArticleCard({ data, index }: ListItemProps<Data>) {
  const articleCard = document.createElement('div');
  const itemIndex = document.createElement('div');
  const body = document.createElement('div');
  const title = document.createElement('h3');
  const excerpt = document.createElement('p');
  const button = document.createElement('button');

  articleCard.classList.add('article-card');
  articleCard.dataset.index = index.toString();

  itemIndex.classList.add('ac-index');
  itemIndex.textContent = `#${data.i}`;
  articleCard.append(itemIndex);

  if (data.image) {
    const image = document.createElement('img');
    image.classList.add('ac-image');
    image.src = data.image;
    image.alt = '';
    image.loading = 'lazy';
    articleCard.append(image);
  }

  body.classList.add('ac-body');

  title.classList.add('ac-title');
  title.textContent = data.title;

  excerpt.classList.add('ac-excerpt');
  excerpt.textContent = data.excerpt;

  button.classList.add('ac-button');
  button.textContent = 'Learn more';

  body.append(title, excerpt, button);
  articleCard.append(body);

  return articleCard;
}

const data = Array.from({ length: 1000 }, (_, i): Data => ({
  i,
  image: i % 3 ? undefined : `https://picsum.photos/seed/${i}/400/240`,
  title: titles[i % titles.length],
  excerpt: excerpts[i % excerpts.length],
}));

function updateStats(startIndex: number, endIndex: number) {
  const total = endIndex - startIndex + 1;
  stats.textContent = `Rendered indices ${startIndex} - ${endIndex}, total ${total} of ${data.length}.`;
}

const title = document.createElement('h4');
title.textContent = 'Try resizing the container and scroll.';

const { container } = LayoutVirtual({ 
  overscanHeight: 200, data, renderItem: ArticleCard, ...styling, onAfterItemsRendered: updateStats,
});

const stats = document.createElement('div');
const app = document.getElementById('app')!;
app.append(title, stats, container);
