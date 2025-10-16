import './styles.css';
import 'virtual:svg-icons-register';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './app/App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#root');
