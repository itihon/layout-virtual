// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import baseUrlModifierRemarkPlugin from './base-url-remark-plugin';
import { BASE_URL, PROD_HOST } from './config.mjs';

// https://astro.build/config
export default defineConfig({
  site: PROD_HOST,
  base: BASE_URL,
  markdown: {
    remarkPlugins: [ 
      [baseUrlModifierRemarkPlugin, { basePath: BASE_URL }],
    ],
  },
	integrations: [
		starlight({
      favicon: '/hero-image-1.png',
			title: 'Layout virtual',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/itihon/layout-virtual' }],
      pagefind: false,
			sidebar: [
				{
					label: 'Examples',
					items: [{ autogenerate: { directory: 'examples' } }],
				},
			],
      components: {
        Hero: './src/components/Hero.astro',
      },
		}),
	],
});
