/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import * as lodash from 'lodash-es';
import * as utilities from './src/utilities/index';

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
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
      symbolId: 'icon-[dir]-[name]',
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
