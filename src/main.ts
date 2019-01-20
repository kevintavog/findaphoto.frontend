import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store/store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAlignJustify, faAngleDown, faArrowLeft, faArrowRight, faBullseye,
  faCalendar, faCamera, faCaretDown, faCaretLeft, faCaretRight, faClone, faCogs,
  faExclamationTriangle, faFastBackward, faFastForward, faFile, faFilm, faFolder, faImage,
  faHome, faInfo, faLocationArrow, faLightbulb, faList, faMap, faMapMarker,
  faMapPin, faMapSigns, faSearch,
  faServer, faSlidersH, faTags, faTimes, faVectorSquare, faWindowMinimize } from '@fortawesome/free-solid-svg-icons'

import 'blaze-css/dist/blaze.min.css'

/* tslint:disable:no-var-requires */
declare function require(name: string): any
const fontawesome = require('@fortawesome/vue-fontawesome')

library.add(faAlignJustify, faAngleDown, faArrowLeft, faArrowRight, faBullseye,
  faCalendar, faCamera, faCaretDown, faCaretLeft, faCaretRight, faClone, faCogs,
  faExclamationTriangle,
  faFastBackward, faFastForward, faFile, faFilm, faFolder, faImage,
  faHome, faInfo, faLocationArrow, faLightbulb, faList, faMap, faMapMarker, faMapPin, faMapSigns,
  faSearch, faServer, faSlidersH, faTags, faTimes, faVectorSquare, faWindowMinimize)

Vue.component('font-awesome-icon', fontawesome.FontAwesomeIcon)

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy, { defaultIconPack: 'fas' })


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
