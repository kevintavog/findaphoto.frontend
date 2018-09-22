<template>
  <div id="app">
    <div id="error" v-if="this.$store.state.serverResponse.errorMessage !== undefined">
      <div role="alert" class="c-alert c-alert--error">
        Message: {{this.$store.state.serverResponse.errorMessage}}
      </div>
    </div>
    <div id="nav">
      <router-link to="/search" class="c-nav__item navigation-item"> <font-awesome-icon icon="home"/> Search </router-link> |
      <router-link to="/byday" class="c-nav__item navigation-item"> <font-awesome-icon icon="calendar"/> By Day</router-link> |
      <router-link to="/map" class="c-nav__item navigation-item" > <font-awesome-icon icon="map"/> Map</router-link> |
      <router-link to="/about" class="c-nav__item navigation-item"> <font-awesome-icon icon="info"/> About</router-link>
    </div>
    <router-view/>
  </div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class App extends Vue {
}
</script>


<style>
html {
    height:100%;
    margin:0;
}

body {
    background-color:#202020;
    color:#ffffff;
    height:100%;
    margin:0;
}

a{color: white;}
a:visited{
    color:white;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

@media (max-width: 420px){
    .navigation-item {
        padding: 0 0 0 7px;
    }
}
div a {
  text-decoration: none;
}
</style>
