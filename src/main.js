import { createApp } from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import store from './store';
import router from './router';
import App from './App.vue';

// const host = `${window.location.protocol}//${window.location.hostname}:${window.location.port || '80'}`;

const host = 'http://oblecto';

store.dispatch('updateHost', host);

createApp(App)
  .use(store)
  .use(router)
  .use(VueAxios, axios)
  .mount('#app');
