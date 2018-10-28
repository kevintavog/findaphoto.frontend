import Vue from 'vue'
import Router from 'vue-router'
import Search from './views/Search.vue'
import Meta from 'vue-meta'

Vue.use(Router)
Vue.use(Meta)

export default new Router({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? 'fp2' : '',
  routes: [
    {
      path: '/',
      redirect: { name: 'search'},
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
    },
    {
      path: '/byday',
      name: 'byday',
      // this generates a separate chunk (<component>.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/ByDay.vue'),
    },
    {
      path: '/map',
      name: 'map',
      // this generates a separate chunk (<component>.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/Map.vue'),
    },
    {
      path: '/singleitem',
      name: 'singleitem',
      // this generates a separate chunk (<component>.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/SingleItem.vue'),
    },
    {
      path: '/info',
      name: 'info',
      // this generates a separate chunk (<component>.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/Info.vue'),
    },
    {
      path: '/example-searches',
      name: 'examplesearches',
      // this generates a separate chunk (<component>.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/ExampleSearches.vue'),
    },
    {
      path: '/field-values',
      name: 'fieldvalues',
      // this generates a separate chunk (<component>.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/FieldValues.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 }
  },
})
