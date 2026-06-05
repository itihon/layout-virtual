// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import baseUrlModifierRemarkPlugin from './base-url-remark-plugin';
import { BASE_URL, PROD_HOST } from './config.mjs';
import svgr from 'vite-plugin-svgr';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: PROD_HOST,
  base: BASE_URL,
  vite: {
    plugins: [svgr()],
  }, 
  markdown: {
    remarkPlugins: [ 
      [baseUrlModifierRemarkPlugin, { basePath: BASE_URL }],
    ],
  },
    integrations: [starlight({
      favicon: '/hero-image-1.png',
      title: 'Layout virtual',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/itihon/layout-virtual' }],
      pagefind: false,
      sidebar: [
        {
          label: 'About',
          link: '/',
          attrs: { class: 'hidden-on-wide-screens' },
        },
        {
            label: 'Examples',
            items: [{ autogenerate: { directory: 'examples' } }],
        },
        {
          label: 'API',
          link: '/API',
          attrs: { class: 'hidden-on-wide-screens' },
        },
      ],
      components: {
        Hero: './src/components/Hero.astro',
        Header: './src/components/Header.astro',
      },
      customCss: [ '/src/styles/custom.css' ],
		}), react()],
});