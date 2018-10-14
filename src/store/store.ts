import Vue from 'vue'
import Vuex from 'vuex'

import serverResponse from './ServerResponseModule'
import serverRequest from './ServerRequestModule'
import errorMessages from './ErrorMessageModule'


Vue.use(Vuex)

const store = new Vuex.Store({
  state: {},
  modules: {
    serverResponse,
    serverRequest,
    errorMessages,
  },
})

export default store
