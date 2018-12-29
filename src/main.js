import Vue from 'vue'
import App from './app.vue'
import router from './router'
import store from './store'

import { Swipe, SwipeItem } from 'vant';
import 'vant/lib/index.css';

Vue.use(Swipe).use(SwipeItem);

import './assets/styles/reset.styl'

new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
})
