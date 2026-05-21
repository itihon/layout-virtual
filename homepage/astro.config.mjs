// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import baseUrlModifierRemarkPlugin from '../base-url-remark-plugin';

const BASE_URL = '/layout-virtual';

// https://astro.build/config
export default defineConfig({
  site: 'https://itihon.github.io',
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
		}),
	],
});
