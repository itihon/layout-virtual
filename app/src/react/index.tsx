import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './main';
import InfiniteScrollExample from '../../../homepage/src/examples/infinite-scroll/react/infinite-scroll';
import ResponsiveGridExample from '../../../homepage/src/examples/responsive-grid/react/responsive-grid';
import AppExampleStyles from '../main.css?raw';
import InfiniteScrollExampleStyles from '../../../homepage/src/examples/infinite-scroll/styles.css?raw';
import ResponsiveGridExampleStyles from '../../../homepage/src/examples/responsive-grid/styles.css?raw';

const styles = {
  'main': AppExampleStyles,
  'infinite-scroll': InfiniteScrollExampleStyles,
  'responsive-grid': ResponsiveGridExampleStyles,
}

const examples = {
  'main': <App />,
  'infinite-scroll': <InfiniteScrollExample />,
  'responsive-grid': <ResponsiveGridExample />,
};

type ExampleName = keyof typeof examples;

const example = (new URLSearchParams(window.location.search).get('example') || 'main') as ExampleName;

const root = createRoot(document.getElementById('app')!);
root.render(
  <StrictMode>
    <nav>
      {
        Object.keys(examples).map(key => <a key={key} className={key === example ? 'active' : ''} href={`./?example=${key}`}>{key}</a>)
      }
    </nav>
    <style>
      {
        styles[example]
      }
    </style>
    {
      examples[example]
    }
  </StrictMode>
);