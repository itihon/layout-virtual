const runTests = new URLSearchParams(window.location.search).get('runTests');

addEventListener('DOMContentLoaded', async() => {
  if (runTests) {
    const frameValidation = (await import('./frameValidation')).frameValidation;
    const contentLayerVisualizer = (await import('./contentLayerVisualizer')).contentLayerVisualizer;

    frameValidation();
    contentLayerVisualizer();

    console.warn('Frame validation is loaded.');
  }
});