import './styles.css';
import { createApp as createVueApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from './app/App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from 'vue-router/auto-routes';

export async function createApp() {
  const app = createVueApp(App);
  const router = createRouter({
    history: createWebHistory(),
    routes,
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

  return { app, context };
}

createApp().then(({ app }) => app.mount('#root'));
