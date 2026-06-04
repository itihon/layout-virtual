export const contentLayerVisualizer = () => {
  const scroller = document.querySelector('[data-lv-scroller]')!;
  const contentLayer = document.querySelector('[data-lv-content-layer]')!;
  const viewportContainer = document.querySelector('[data-lv-viewport]')!;
  const layerVisualizer = document.createElement('div');
  const layerVisualizerStyles = layerVisualizer.style;

  Object.assign(layerVisualizerStyles, {
    position: 'absolute',
    zIndex: '-1',
    backgroundColor: 'lightblue',
    border: '1px solid royalblue',
    left: '0',
    top: '0',
  });

  layerVisualizer.setAttribute('data-content-layer-visualizer', '');

  scroller.insertAdjacentElement('beforebegin', layerVisualizer);

  const contentLayerObserver = new IntersectionObserver((entries, observer) => {
    const lastEntry = entries[entries.length - 1]!;
    const { left, top, width, height } = lastEntry.boundingClientRect;

    requestAnimationFrame(() => {
      layerVisualizerStyles.width = `${width}px`;
      layerVisualizerStyles.height = `${height}px`;
      layerVisualizerStyles.transform = `translate(${left}px, ${top}px)`;
    });

    observer.disconnect();
  }, { root: document.documentElement });


  viewportContainer.addEventListener('scroll', () => {
    contentLayerObserver.observe(contentLayer);
  });

  contentLayerObserver.observe(contentLayer);
};