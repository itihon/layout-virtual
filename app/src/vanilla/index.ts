import AppExampleStyles from '../main.css?raw';
import InfiniteScrollExampleStyles from '../../../homepage/src/examples/infinite-scroll/styles.css?raw';
import ResponsiveGridExampleStyles from '../../../homepage/src/examples/responsive-grid/styles.css?raw';

const styles = {
  'main': AppExampleStyles,
  'infinite-scroll': InfiniteScrollExampleStyles,
  'responsive-grid': ResponsiveGridExampleStyles,
}

const examples = {
  'main': './main',
  'infinite-scroll': '../../../homepage/src/examples/infinite-scroll/vanilla/infinite-scroll',
  'responsive-grid': '../../../homepage/src/examples/responsive-grid/vanilla/responsive-grid',
};

type ExampleName = keyof typeof examples;

const example = (new URLSearchParams(window.location.search).get('example') || 'main') as ExampleName;

const app = document.getElementById('app')!;
const nav = document.createElement('nav');
const style = document.createElement('style');
const exampleLinks = Object.keys(examples).map(key => {
  const link = document.createElement('a');
  link.className = key === example ? 'active' : '';
  link.href = `./?example=${key}`;
  link.textContent = key;
  return link;
});

style.textContent = styles[example];

document.head.append(style);
nav.append(...exampleLinks);
app.append(nav);

if (example === 'main') {
  await import('./main');
}
else if (example === 'infinite-scroll') {
  await import('../../../homepage/src/examples/infinite-scroll/vanilla/infinite-scroll');
}
else if (example === 'responsive-grid') {
  await import('../../../homepage/src/examples/responsive-grid/vanilla/responsive-grid');
}