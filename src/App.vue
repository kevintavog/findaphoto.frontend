<template>
  <div id="app" class="fp-color-white">
    <div v-for="err in errors" :key="err.id" role="alert" class="c-alert c-alert--error fp-error">
      <button class="c-button c-button--close fp-error-button-close" @click='closeError(err)'>&times;</button>
      Message: {{err.message}}
    </div>
    <ul class="navigation-group">
      <li class="navigation-item" @click="navigateToHome()"> <font-awesome-icon icon="home"/> Home </li>
      <li class="navigation-item" @click="navigateToByDay()"> <font-awesome-icon icon="calendar"/> By Day </li>
      <li class="navigation-item" @click="navigateToMap()"> <font-awesome-icon icon="map"/> Map </li>
      <li class="navigation-item"> <router-link to="/about"> <font-awesome-icon icon="info"/> About</router-link> </li>
    </ul>
    <router-view/>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ErrorMessageAndId } from '@/store/ErrorMessageModule'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'

@Component({})
export default class App extends Vue {
    private navigateToHome() {
        // If not on the home page and there's a text search, retain the text search
        const searchRequest = this.$store.state.serverRequest.request
        if (this.$route.name !== 'search'
          && searchRequest.searchType === 's'
          && searchRequest.searchText.length > 0) {

            searchRequest.first = 1
            this.$router.push({ path: '/search', query: searchRouteBuilder.toParameters(searchRequest) })

        } else {
            this.$router.push({ path: '/search' })
        }
    }

    private navigateToByDay() {
        console.log('byday:', this.$route.path, this.$route.name)
        this.$router.push({ path: '/byday' })
    }

    private navigateToMap() {
        // Retain a text search in order to put those on a map
        const searchRequest = this.$store.state.serverRequest.request
        if (searchRequest.searchType === 's'
          && searchRequest.searchText.length > 0) {

              searchRequest.first = 1
              this.$router.push({ path: '/map', query: searchRouteBuilder.toParameters(searchRequest) })
          } else {
              this.$router.push({ path: '/map' })
          }
    }

    private closeError(err: ErrorMessageAndId): void {
      this.$store.commit('closeErrorMessage', err)
    }

    private get errors(): ErrorMessageAndId[] {
        return this.$store.state.errorMessages.messages.slice(0, 4)
    }
}
</script>


<style>
.leaflet-fake-icon-image-2x {
  background-image: url(../node_modules/leaflet/dist/images/marker-icon-2x.png);
}
.leaflet-fake-icon-shadow {
  background-image: url(../node_modules/leaflet/dist/images/marker-shadow.png);
}
@import "../node_modules/leaflet/dist/leaflet.css";

html {
  height:100vh;
  margin:0;
}

body {
  background-color:#202020;
  height:100vh;
  margin:0;
}
</style>


<style scoped>
.fp-color-white {
  color: white;
}

a{
  color: white;
}
a:visited{
  color:white;
}

#app {
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.navigation-group {
  background-color: #111;
  width: 100%;
  margin: 0;
  padding: 0;
  z-index: 3;
  display: inline-flex;
  flex-grow: 0;
}

.navigation-item {
  text-decoration: none;
  cursor: pointer;
  display: block;
  height: 2.0em;
  padding: 0 0.5em;
  color: inherit;
  line-height: 2.0em;
}

@media (max-width: 420px){
  .navigation-item {
    padding: 0 0 0 7px;
  }
}
div a {
  text-decoration: none;
}

.c-alert.fp-error {
  padding: 0.4em;
}
.c-button.c-button--close.fp-error-button-close {
  margin-top: -0.25em;
}
</style>
