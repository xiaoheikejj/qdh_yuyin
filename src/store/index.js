import Vue from 'vue'
import Vuex from 'vuex'
import CommonModule from './common'

Vue.use(Vuex)


export default new Vuex.Store({
    modules: {
        common: CommonModule
    }
})
