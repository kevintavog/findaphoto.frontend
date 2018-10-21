import Vue from 'vue'
import Vuex from 'vuex'

import errorMessages from './ErrorMessageModule'
import fieldValues from './FieldValuesModules'
import serverResponse from './ServerResponseModule'
import serverRequest from './ServerRequestModule'


Vue.use(Vuex)

const store = new Vuex.Store({
  state: {},
  modules: {
    errorMessages,
    fieldValues,
    serverResponse,
    serverRequest,
  },
})

export default store
