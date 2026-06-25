import LayoutVirtual, { type ListItemProps, type VirtualizedListDOMClasses } from 'layout-virtual';

const styling: VirtualizedListDOMClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

const SHOW_LOADER = Symbol('show-loader');
type Post = { title: string; body: string } | typeof SHOW_LOADER;

const loadedUrls = new Set<string>();
let data: Post[] = [];
let dataLimit = 100;
let isLoading = false;

function Loader(index: number): HTMLElement {
  const container = document.createElement('div');
  const spinner = document.createElement('div');
  container.className = 'loader-container';
  container.dataset.index = index.toString();
  spinner.className = 'loader';
  container.append(spinner);
  return container;
}

function ArticleCard({ data: item, index }: ListItemProps<Post>): HTMLElement {
  if (item === SHOW_LOADER) return Loader(index);

  const { title, body } = item as { title: string; body: string };
  const card = document.createElement('div');
  const indexEl = document.createElement('span');
  const titleEl = document.createElement('h3');
  const bodyEl = document.createElement('p');
  const button = document.createElement('button');

  card.className = 'article-card';
  card.dataset.index = index.toString();
  indexEl.className = 'ac-index';
  indexEl.textContent = String(index);
  titleEl.className = 'ac-title';
  titleEl.textContent = title;
  bodyEl.className = 'ac-body';
  bodyEl.textContent = body;
  button.className = 'ac-button';
  button.textContent = 'Learn more';

  card.append(indexEl, titleEl, bodyEl, button);
  return card;
}

function getListData(): Post[] {
  return isLoading ? data.concat(SHOW_LOADER) : data;
}

function onAfterRender(startIndex: number, endIndex: number) {
  console.log('onAfterItemsRendered', startIndex, endIndex);
  const total = endIndex - startIndex + 1;
  stats.textContent = `Rendered indices ${startIndex} - ${endIndex}, total ${total}. Loaded ${data.length} of ${dataLimit}.`;

  if (endIndex === data.length - 1 && endIndex < dataLimit - 1 && !isLoading) {
    console.log('will try to fetch data');
    loadMore(10, data.length);
  }
}

function loadMore(limit: number, skip: number) {
  const apiUrl = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}&select=title,body`;
  if (loadedUrls.has(apiUrl)) return;

  isLoading = true;
  loadedUrls.add(apiUrl);

  console.log('will fetch', apiUrl);

  api.setData(getListData());

  setTimeout(() => {
    fetch(apiUrl)
      .then(r => r.json())
      .then(result => {
        dataLimit = result.total;
        data = data.concat(result.posts);
      })
      .catch(console.error)
      .finally(() => {
        isLoading = false;
        api.setData(getListData());
      });
  }, 5000)
}

const title = document.createElement('h4');
title.textContent = 'Try resizing the container and scroll.';
const stats = document.createElement('div');

const { container, api } = LayoutVirtual<Post>({
  overscanHeight: 200,
  data: getListData(),
  renderItem: ArticleCard,
  ...styling,
  onAfterItemsRendered: onAfterRender,
});

const app = document.getElementById('app')!;
app.append(title, stats, container);

loadMore(10, 0);