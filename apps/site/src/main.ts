import './styles.css';
import { createApp as createVueApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from './app/App.vue';
import { createRouter, createWebHistory, LocationQuery } from 'vue-router';
import { routes } from 'vue-router/auto-routes';
import LZString from 'lz-string';
import qs from 'qs';
import 'virtual:svg-icons-register';
import { MockObjectService } from './services/object';
import { SessionServiceImpl } from './services/session';

export async function createApp() {
  const app = createVueApp(App);
  const router = createRouter({
    history: createWebHistory(),
    routes,
    parseQuery: (query) => {
      const parsed = qs.parse(query, { ignoreQueryPrefix: true });
      const compressedString = parsed['q'] as string | undefined;
      if (compressedString) {
        const jsonString =
          LZString.decompressFromEncodedURIComponent(compressedString);
        if (jsonString) {
          console.log('decode querystring', jsonString)
          try {
            return JSON.parse(jsonString);
          } catch (e) {
            console.error('Failed to parse decompressed JSON:', e);
          }
        }
      }

      // 如果解析失敗或沒有壓縮參數，傳回空物件
      return {};
    },
    stringifyQuery: (query) => {
      const jsonString = JSON.stringify(query);
      const compressedString =
        LZString.compressToEncodedURIComponent(jsonString);
      return qs.stringify({ ['q']: compressedString }, { encode: false });
    },
  });
  const pinia = createPinia();
  const context = {
    router,
    pinia,
  };

  app
    .provide('context', context)
    .use(context.pinia)
    .use(context.router)
    .use(PrimeVue, {
      theme: {
        preset: Aura,
      },
    });

  app
    .provide('sessionService', new SessionServiceImpl())
    .provide('objectService', new MockObjectService());

  return { app, context };
}

createApp().then(({ app }) => app.mount('#root'));
