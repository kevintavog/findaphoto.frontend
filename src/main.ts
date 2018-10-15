import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft, faArrowRight, faBullseye, faCalendar, faCamera, faCaretLeft, faCaretRight,
  faFastBackward, faFastForward, faFile, faFolder,
  faHome, faInfo, faLocationArrow, faMap, faMapMarker,
  faMapPin, faSearch, faServer, faTags, faVectorSquare } from '@fortawesome/free-solid-svg-icons'

import 'blaze-css/dist/blaze.min.css'

/* tslint:disable:no-var-requires */
declare function require(name: string): any
const fontawesome = require('@fortawesome/vue-fontawesome')

library.add(faArrowLeft, faArrowRight, faBullseye, faCalendar, faCamera, faCaretLeft, faCaretRight,
  faFastBackward, faFastForward, faFile, faFolder,
  faHome, faInfo, faLocationArrow, faMap, faMapMarker, faMapPin, faSearch, faServer, faVectorSquare, faTags)

Vue.component('font-awesome-icon', fontawesome.FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
