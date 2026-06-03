export type ScrollDirection = 'down' | 'up';


export const frameValidation = () => {
  const viewportContainer = document.querySelector('[data-lv-viewport]')!;
  const contentLayer = document.querySelector('[data-lv-content-layer]')!;

  let previousViewportTop = 0;
  let scrollDirection: ScrollDirection = 'down';

  const testCases = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const viewportTop = viewportContainer.scrollTop;
    const viewportTopDelta = viewportTop - previousViewportTop;

    scrollDirection = viewportTopDelta > 0
      ? 'down'
      : 'up';

    assertMonotonicItemMovement(entries);

    previousViewportTop = viewportTop;
    observer.disconnect();
  };

  const contentLayerScrollObserver = new IntersectionObserver(testCases, { root: document.documentElement });

  /**
   * vertical positions of the rendered items consistently increase/decrease while scrolling up/down 
   * i.e. content doesn't jump back and forth between frames
   */
  const assertMonotonicItemMovement = (() => {
    let renderedItemsPositions = new WeakMap<Element, { position: number, delta?: number }>();
    let previousScrollDirection: ScrollDirection = scrollDirection;

    return (entries: IntersectionObserverEntry[]) => {
      if (previousScrollDirection !== scrollDirection) {
        renderedItemsPositions = new WeakMap();
        previousScrollDirection = scrollDirection;
        return;
      }

      entries.forEach(entry => {
        const currentPosition = entry.boundingClientRect.top;
        const previousStats = renderedItemsPositions.get(entry.target);

        if (previousStats) {
          const previousPosition = previousStats.position;
          const previousDelta = previousStats.delta;
          const currenDelta = currentPosition - previousPosition;
          const itemIndex = (entry.target as HTMLElement).dataset.index;
          const direction = currenDelta > 0 ? 'up' : 'down';
          const errorMsg = `
            Item ${itemIndex} jumped while scrolling ${direction}.
            previousPosition: ${previousPosition};
            currentPosition: ${currentPosition};
          `;

          if ((entry.target as HTMLElement).offsetParent) {
            if (previousDelta !== undefined) {
              if (currenDelta * previousDelta <= 0) {
                throw new Error(errorMsg);
              }
            }
          }

          renderedItemsPositions.set(entry.target, { position: currentPosition, delta: currenDelta });
        }
        else {
          renderedItemsPositions.set(entry.target, { position: currentPosition });
        }
      });
    };
  })();

  const onScroll = () => {
    const items = contentLayer.children;

    for (const item of items) {
      contentLayerScrollObserver.observe(item);
    }
  };

  viewportContainer.addEventListener('scroll', onScroll);
};