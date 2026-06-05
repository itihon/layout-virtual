import { test, expect } from '@playwright/test';
import { frameValidation, type ScrollDirection } from './frameValidation';

const scroll = (container: HTMLElement, scrollOptions: ScrollToOptions[]) => new Promise<void>(resolve => {
  const positions = scrollOptions.slice();
  let timeout: NodeJS.Timeout;

  function animateScroll() {
    const position = positions.shift();

    if (position) {
      container.scroll(position);
      requestAnimationFrame(animateScroll);
    }
    else {
      clearTimeout(timeout);
      timeout = setTimeout(resolve, 64);
    }
  }

  requestAnimationFrame(animateScroll);
});

const smoothScroll = (container: HTMLElement, top: number) => new Promise<unknown>(resolve => {
  container.addEventListener('scrollend', resolve, { once: true });
  container.scroll({ top, behavior: 'smooth' });
});

test('Renders corectly on viewport scroll', async ({ page }) => {
  await page.goto('http://localhost:5173/vanilla/');
  const scrollViewport = await page.waitForSelector('[data-lv-viewport]');

  page.on('console', (msg) => {
    console.log(msg);
  });

  page.on('pageerror', (err) => { throw err; });

  await expect(page.locator('[data-lv-viewport]')).toBeVisible();
  page.addInitScript<ScrollDirection>(frameValidation, 'down');

  await scrollViewport.evaluate(smoothScroll, 10000);
  await scrollViewport.evaluate(smoothScroll, 0);
});