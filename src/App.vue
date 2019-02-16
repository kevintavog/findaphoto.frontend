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

      <b-dropdown class="nav-menu navigation-item is-pulled-right is-right" postion="is-bottom-left" :mobile-modal="false">
        <button id="nav-right-menu-button" class="button is-small is-text has-text-white" slot="trigger">
          <b-icon icon="align-justify" />
        </button>
        <b-dropdown-item has-link>
            <router-link to="/info"> 
              <b-icon icon="info" />
              Info 
            </router-link> 
        </b-dropdown-item>
        <b-dropdown-item has-link>
            <router-link to="/example-searches"> 
              <b-icon icon="search" />
              Example searches 
            </router-link> 
        </b-dropdown-item>
        <b-dropdown-item has-link>
            <router-link :to="{ path: '/field-values', query: fieldValuesParams()}"> 
              <b-icon icon="map-signs" />
              Field values 
            </router-link> 
        </b-dropdown-item>
      </b-dropdown>
    </ul>
    <router-view/>

  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { ErrorMessageAndId } from '@/store/ErrorMessageModule'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'

@Component({
  metaInfo() {
    return {
      title: '',
      titleTemplate: (titleChunk) => {
        return titleChunk ? `${titleChunk} - Find A Photo` : 'Find A Photo'
      },
    }
  },
})
export default class App extends Vue {
  private menuOpen = false

  private created() {
    window.addEventListener('mouseup', this.mouseUp)
  }

  private destroyed() {
    window.addEventListener('mouseup', this.mouseUp)
  }

  private mouseUp(event: MouseEvent) {
    if (this.menuOpen) {
      if (event.target) {
        const element = event.target! as HTMLElement
        if (element.closest('.drop-down-menu-container')) {
          return
        }
      }
      this.toggleMenu()
    }
  }

  private toggleMenu() {
    this.menuOpen = !this.menuOpen
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any) {
    if (this.menuOpen) {
      this.toggleMenu()
    }
  }

  private navigateToHome() {
    // If not on the home page and there's a text search, retain the text search
    const searchRequest = this.$store.state.serverRequest.request
    if (this.$route.name !== 'search' && searchRequest.searchType.length > 0 && searchRequest.searchType !== 'd') {
      this.$router.push({
        path: '/search',
        query: searchRouteBuilder.toPrimaryParameters(searchRequest),
      })
    } else {
      this.$router.push({ path: '/search' })
    }
  }

  private navigateToByDay() {
    this.$router.push({ path: '/byday' })
  }

  private navigateToMap() {
    // Retain the current search in order to put those on a map
    const searchRequest = this.$store.state.serverRequest.request
    if (searchRequest.searchType.length > 0) {
      this.$router.push({
        path: '/map',
        query: searchRouteBuilder.toPrimaryParameters(searchRequest),
      })
    } else {
      this.$router.push({ path: '/map' })
    }
  }

  private fieldValuesParams() {
    const searchRequest = this.$store.state.serverRequest.request
    if (searchRequest.searchType.length > 0) {
      return searchRouteBuilder.toPrimaryParameters(searchRequest)
    } else {
      return {}
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

.main-html {
  height: 100vh;
  margin: 0;
  background-color: #202020;
}

body {
  height: 100vh;
  margin: 0;
}

a:visited {
  color: white;
}

a:hover {
  color: white;
}

a:link {
  color: white;
}

.overrideHoverColor a:hover {
  color: rgb(206, 206, 206);
}

</style>


<style scoped>
.fp-color-white {
  color: white;
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
  background-color: #555;
  width: 100%;
  margin: 0;
  padding: 0;
  text-align: left;
}

.navigation-item {
  cursor: pointer;
  display: inline-block;
  height: 2em;
  padding: 0 0.8em;
  line-height: 2em;
}

.nav-menu {
  z-index: 2000;
}

#nav-right-menu-button:active, #nav-right-menu-button:focus {
  background-color: transparent;
}

.main-menu-drawer {
  background-color: #666;
}

.main-menu-items-list {
  text-align: left;
  list-style-type: none;
  line-height: 2.5em;
}

.menu-icon {
  width: 1.3em;
}

.menu-close-button {
  position: absolute;
  right: 0.7em;
  top: 0.3em;
  background-color: #666;
  border: none;
  color: white;
  font-size: 1.1em;
}

@media (max-width: 420px) {
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
