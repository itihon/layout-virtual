const runTests = new URLSearchParams(window.location.search).get('runTests');

addEventListener('DOMContentLoaded', async() => {
  if (runTests) {
    const frameValidation = (await import('./frameValidation')).frameValidation;
    frameValidation();

    console.warn('Frame validation is loaded.');
  }
});