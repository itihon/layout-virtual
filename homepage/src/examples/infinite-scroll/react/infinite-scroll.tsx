import { useCallback, useMemo, useState, useRef } from 'react';
import LayoutVirtual, { type VirtualizedListReactClasses, type ListItemProps } from 'react-layout-virtual';

const styling: VirtualizedListReactClasses = {
  scrollerClass: 'lv-scroller',
  viewportClass: 'lv-viewport',
  contentLayerClass: 'lv-content-layer',
};

const SHOW_LOADER = Symbol('show-loader');

type Post = { title: string; body: string } | typeof SHOW_LOADER;

function Loader({ index }: Omit<ListItemProps<Post>, 'data'>) {
  return <div className='loader-container' data-index={index}><div className='loader'></div></div>;
}

function ArticleCard({ data, index }: ListItemProps<Post>) {
  if (data === SHOW_LOADER) {
    return <Loader index={index} />;
  }

  const { title, body } = data;

  return (
    <div className={'article-card'} data-index={index}>
      <span className='ac-index'>{index}</span>
      <h3 className={'ac-title'}>{title}</h3>
      <p className={'ac-body'}>{body}</p>
      <button className={'ac-button'}>Learn more</button>
    </div>
  );
}

const InfiniteScrollExample = () => {
  const loadedUrls = useRef(new Set());
  const [ data, setData ] = useState<Post[]>([]);
  const [ dataLimit, setDataLimit ] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const listData = useMemo(() => isLoading ? data.concat(SHOW_LOADER) : data, [isLoading, data]);
  const [renderedIndices, setRenderedIndices] = useState({ startIndex: 0, endIndex: 0 });
  const { startIndex, endIndex } = renderedIndices;
  const total = endIndex - startIndex + 1;

  const loadMore = useCallback((limit: number, skip: number) => {
    const apiUrl = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}&select=title,body`;

    if (loadedUrls.current.has(apiUrl)) return;
    
    setIsLoading(true);
    loadedUrls.current.add(apiUrl);

    console.log('will fetch', apiUrl);

    fetch(apiUrl)
      .then(response => response.json())
      .then(result => (setDataLimit(result.total), result))
      .then(result => setData(prevPosts => prevPosts.concat(result.posts)))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const onAfterRender = useCallback((startIndex: number, endIndex: number) => {
    console.log('onAfterItemsRendered', startIndex, endIndex);

    if (endIndex === data.length - 1 && endIndex < dataLimit - 1) {
      if (!isLoading) {
        console.log('will try to fetch data');
        loadMore(10, data.length);
      }
    }

    setRenderedIndices({ startIndex, endIndex });
  }, [data, dataLimit, loadMore, isLoading]);

  return (
    <>
      <h4>Try resizing the container and scroll.</h4>
      <div>Rendered indices {startIndex} - {endIndex}, total {total}. Loaded {data.length} of {dataLimit}.</div>
      <LayoutVirtual<Post> overscanHeight={200} data={listData} renderItem={ArticleCard} {...styling} onAfterItemsRendered={onAfterRender} />
    </>
  );
};

export default InfiniteScrollExample;