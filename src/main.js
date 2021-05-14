// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { Tabs, Tab } from 'vue-tabs-component';
import VModal from 'vue-js-modal';
import Notifications from 'vue-notification';
import VueSocketio from 'vue-socket.io';

import oblectoClient from '@/oblectoClient';
import { host } from '@/oblectoClient';

Vue.use(VModal);

Vue.use(Notifications);

Vue.use(VueAxios, axios);

store.dispatch('updateHost', host);
Vue.use(VueSocketio, host);

Vue.component('tabs', Tabs);
Vue.component('tab', Tab);

Vue.config.productionTip = false;

let connectionFailedCount = 0;

/* eslint-disable no-new */
export const instance = new Vue({
    store,
    sockets: {
        connect_error: function () {
            connectionFailedCount++;

            if (connectionFailedCount === 1) {
                this.$notify({
                    group: 'system',
                    title: 'Connection failed',
                    text: 'Failed to connect to the Oblecto web socket server. Is the server online?',
                    type: 'error'
                });
            }
        },
        connect: function () {
            connectionFailedCount = 0;

            this.$notify({
                group: 'system',
                title: 'Connection to Oblecto succeeded',
                text: 'Client has successfully connected to the Oblecto websocket interface!',
                type: 'success'
            });

            // Authenticate socket if auth token exits
            if (oblectoClient.accessToken) {
                this.$socket.emit('authenticate', { token: oblectoClient.accessToken });

                this.$notify({
                    group: 'system',
                    title: 'Authentication success',
                    text: 'Socket interface has been authenticated',
                    type: 'success'
                });

                this.$store.dispatch('updateAll');
            }
        },
        indexer: function (val) {
            if (val.event === 'added') {
                this.$store.dispatch('updateAll');
            }
        },
        play: function (msg) {
            if (msg.episodeId) {
                store.dispatch('playEpisodeLocal', msg.episodeId);
            }

            if (msg.movieId) {
                store.dispatch('playMovieLocal', msg.movieId);
            }
        }
    },
    router,
    render: h => h(App)
}).$mount('#app');
