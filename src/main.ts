import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCalendar, faCaretLeft, faCaretRight, faFastBackward, faFastForward,
  faHome, faInfo, faLocationArrow, faMap, faSearch } from '@fortawesome/free-solid-svg-icons'

import 'blaze-css/dist/blaze.min.css'


/* tslint:disable:no-var-requires */
const fontawesome = require('@fortawesome/vue-fontawesome')

library.add(faCalendar, faCaretLeft, faCaretRight, faFastBackward, faFastForward,
  faHome, faInfo, faLocationArrow, faMap, faSearch)

Vue.component('font-awesome-icon', fontawesome.FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
