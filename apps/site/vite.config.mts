/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import VueRouter from 'unplugin-vue-router/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
import * as lodash from 'lodash-es';
import * as utilities from './src/utilities/index';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/site',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  resolve: {
    alias: {
      '@site': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      dts: path.resolve(__dirname, 'src', 'auto-imports.d.ts'),
      imports: [
        'vue',
        {
          'lodash-es': Object.keys(lodash),
          '@site/utilities': Object.keys(utilities),
        },
      ],
      vueTemplate: true,
    }),
    Components({
      dts: path.resolve(__dirname, 'src', 'components.d.ts'),
      dirs: ['src'],
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [PrimeVueResolver()],
    }),
    VueRouter({
      dts: path.resolve(__dirname, 'src', 'typed-router.d.ts'),
      routesFolder: 'src/pages',
      /**
       * Data Fetching is an experimental feature from vue & vue-router
       *
       * @see https://github.com/vuejs/rfcs/discussions/460
       * @see https://github.com/posva/unplugin-vue-router/tree/main/src/data-fetching
       */
      dataFetching: true,
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'public/svg')],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__', // Sprite 容器的 ID
    }),
  ],

  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
