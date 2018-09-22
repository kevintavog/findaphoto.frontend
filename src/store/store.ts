import Vue from 'vue'
import Vuex from 'vuex'

import serverResponse from './ServerResponseModule'
import serverRequest from './ServerRequestModule'


Vue.use(Vuex)

const store = new Vuex.Store({
  state: {},
  modules: {
    serverResponse,
    serverRequest,
  },
})

export default store
