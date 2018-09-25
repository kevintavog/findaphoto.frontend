<template>
  <div id="app" class="fp-color-white">
    <div id="error" v-if="this.$store.state.serverResponse.errorMessage !== undefined">
      <div role="alert" class="c-alert c-alert--error">
        Message: {{this.$store.state.serverResponse.errorMessage}}
      </div>
    </div>
    <ul class="navigation-group">
      <li class="navigation-item"> <router-link to="/search"> <font-awesome-icon icon="home"/> Search </router-link> </li>
      <li class="navigation-item"> <router-link to="/byday"> <font-awesome-icon icon="calendar"/> By Day</router-link> </li>
      <li class="navigation-item"> <router-link to="/map"> <font-awesome-icon icon="map"/> Map</router-link> </li>
      <li class="navigation-item"> <router-link to="/about"> <font-awesome-icon icon="info"/> About</router-link> </li>
    </ul>
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
  height:100%;
  margin:0;
}

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
}

.navigation-item {
  text-decoration: none;
  cursor: pointer;
  display: block;
  height: 3.5em;
  padding: 0 1em;
  color: inherit;
  line-height: 3.5em;
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
