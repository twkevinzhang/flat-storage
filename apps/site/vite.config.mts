/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import tailwindcss from '@tailwindcss/vite';

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
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      dts: path.resolve(__dirname, 'src', 'auto-imports.d.ts'),
      imports: ['vue'],
    }),

    // 自动注册组件，页面直接使用
    Components({
      dts: path.resolve(__dirname, 'src', 'components.d.ts'),
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
