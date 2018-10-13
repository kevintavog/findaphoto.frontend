<template>
  <div class="map box">
    <div class="controls">
      <button v-if="searchBarVisible" class="c-button c-button--rounded c-button--ghost-success u-small control-button" @click="toggleSearchBar">
          <font-awesome-icon icon="search"/>
      </button>
      <button v-if="!searchBarVisible" class="c-button c-button--rounded c-button--ghost-info u-small control-button" @click="toggleSearchBar">
          <font-awesome-icon icon="search"/> Search
      </button>
      <button class="c-button c-button--rounded c-button--ghost-info u-small" @click="searchNearby">
          <font-awesome-icon icon="location-arrow"/> Nearby
      </button>
      <SearchBar v-if="searchBarVisible" :search-type="searchType" :query-properties="queryProperties" class="search-bar" />
    </div>

    <div class="content-container">
        <main class="map-content" id="map" >
        </main>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SearchBar from '@/components/SearchBar.vue'
import { locationProvider, FPLocation } from '@/providers/LocationProvider'
import * as leaflet from 'leaflet'

@Component({
  components: {
    SearchBar,
  },
})
export default class Map extends Vue {
    private searchBarVisible = true
    private searchType = 'm'
    private queryProperties: string = 'createdDate,id,imageName,latitude,longitude,locationDisplayName,thumbUrl'
    private map?: leaflet.Map

    private mounted(): void {
        this.initializeMap()
    }

    private toggleSearchBar(): void {
        this.searchBarVisible = !this.searchBarVisible
    }

    private searchNearby(): void {
        locationProvider.currentLocation( (location?: FPLocation, errorMessage?: string) => {
            console.log('current location result:', location, errorMessage)
        })
    }

    private initializeMap(): void {
        if (this.map) { return }


        this.map = leaflet.map('map', {
            center: [20, 0],
            zoom: 3,
            minZoom: 3,
            zoomControl: false
        })

        leaflet.control.zoom({ position: 'topright' }).addTo(this.map)

        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(this.map)

        leaflet.control.scale({ position: 'bottomright' }).addTo(this.map)
    }
}

</script>

<style scoped>
.box {
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  height: 100%;
}

.controls {
  text-align: left;
  padding-top: 0.4em;
  padding-left: 1.0em;
  padding-right: 0.1em;
  padding-bottom: 0.3em;
}

.control-button {
  margin-right: 0.8em;
}
.search-bar {
  padding-top: 0.4em;
  margin-left: -1.0em;
}

.content-container {
  flex-grow: 1;
  height: 100%;
}

.map-content {
  flex-grow: 1;
  height: 100%;
}
</style>
