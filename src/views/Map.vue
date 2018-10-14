<template>
  <div class="map box">
    <div class="controls">
      <button v-if="searchBarVisible" class="c-button c-button--rounded c-button--ghost-success u-small control-button" @click="toggleSearchBar">
          <font-awesome-icon icon="search"/>
      </button>
      <button v-if="!searchBarVisible" class="c-button c-button--rounded c-button--ghost-info u-small control-button" @click="toggleSearchBar">
          <font-awesome-icon icon="search"/> Search
      </button>
      <button class="c-button c-button--rounded c-button--ghost-info u-small control-button" @click="searchNearby">
          <font-awesome-icon icon="location-arrow"/> Nearby
      </button>
      <button class="c-button c-button--rounded c-button--ghost-info u-small control-button" @click="searchCenterOfMap">
          <font-awesome-icon icon="bullseye"/> Center of map
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import SearchBar from '@/components/SearchBar.vue'
import { SearchRequest } from '@/models/SearchRequest'
import { SearchItem, SearchResults } from '@/models/SearchResults'
import { locationProvider, FPLocation } from '@/providers/LocationProvider'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import { searchService } from '@/services/SearchService'
import * as leaflet from 'leaflet'

@Component({
  components: {
    SearchBar,
  },
})
export default class Map extends Vue {
    private searchBarVisible = false
    private searchType = 'l'
    private queryProperties: string = 'createdDate,height,id,imageName,latitude' +
        ',longitude,locationDisplayName,thumbUrl,width'
    private map?: leaflet.Map
    private southWestCornerLatLng: leaflet.LatLngTuple = [90, 180]
    private northEastCornerLatLng: leaflet.LatLngTuple = [-90, -180]
    private itemsRetrieved = 0


    private invokeSearchService(query: any): void {
        this.southWestCornerLatLng = [90, 180]
        this.northEastCornerLatLng = [-90, -180]
        this.itemsRetrieved = 0

        const searchRequest = searchRouteBuilder.toSearchRequest(query, this.searchType)
        searchRequest.properties = this.queryProperties
        searchService.search(searchRequest)
    }

    private mounted(): void {
        this.initializeMap()
        this.invokeSearchService(this.$route.query)
    }

    private get results(): SearchResults {
        return this.$store.state.serverResponse.results
    }

    private get request(): SearchRequest {
        return this.$store.state.serverRequest.request
    }

    @Watch('results')
    private onResultsChanged(to: any, from: any) {
        if (this.results) {
            this.results.groups.forEach( (group) => {
                group.items.forEach( (item) => {
                    this.addItem(item)
                })
            })

            this.map!.fitBounds([this.southWestCornerLatLng, this.northEastCornerLatLng], undefined)

            this.itemsRetrieved = this.request.first + this.results.resultCount - 1
            if (this.results.resultCount > 0 && this.itemsRetrieved < this.results.totalMatches) {
console.log('still need to retrieve more...')
                const searchRequest = this.request
                searchRequest.first = this.request.first + this.request.pageCount
                searchService.search(searchRequest)
            }
        }
    }

    private addItem(item: SearchItem): void {
        if (item.latitude && item.longitude) {
            this.updateBounds(item)
            this.createMarker(item).addTo(this.map!)
        }
    }

    @Watch('$route')
    private onRouteChanged(to: any, from: any) {
        this.invokeSearchService(to.query)
    }

    private toggleSearchBar(): void {
        this.searchBarVisible = !this.searchBarVisible
    }

    private searchCenterOfMap(): void {
        if (this.map) {
          const center = this.map!.getCenter()
          this.searchLocation(center.lat, center.lng)
        }
    }

    private searchNearby(): void {
        locationProvider.currentLocation( (location?: FPLocation, errorMessage?: string) => {
            if (errorMessage && errorMessage.length > 0) {
                this.$store.commit('addErrorMessage', errorMessage)
            } else if (location) {
                this.searchLocation(location.latitude, location.longitude)
            }
        })
    }

    private searchLocation(latitude: number, longitude: number): void {
        const searchRequest = this.$store.state.serverRequest.request
        searchRequest.latitude = latitude
        searchRequest.longitude = longitude
        searchRequest.maxKilometers = 1
        searchRequest.count = 200
        searchRequest.first = 1
        this.$router.push({ path: 'map', query: searchRouteBuilder.toParameters(searchRequest)})
    }

    private initializeMap(): void {
        if (this.map) { return }

        this.map = leaflet.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            zoomControl: false,
        })

        leaflet.control.zoom({ position: 'topright' }).addTo(this.map)

        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        }).addTo(this.map)

        leaflet.control.scale({ position: 'bottomright' }).addTo(this.map)
    }

    private createMarker(item: SearchItem) {
        const marker = leaflet.marker(
            [item.latitude, item.longitude],
            {
                icon: this.getDefaultThumbnailIcon(item),
            })
        marker.on('click', (evt) => {
            console.log(item.imageName + ', ' + item.width + 'x' + item.height)
        })
        return marker
    }

    private getDefaultThumbnailIcon(item: SearchItem): leaflet.DivIcon {
        let width = 40
        let height = 40
        if (item.width >= item.height) {
            height = item.height * (width / item.width)
        } else {
            width = item.width * (height / item.height)
        }
        return leaflet.divIcon({
            iconSize: [width, height],
            html: '<img class="markerImage" src="' + item.thumbUrl + '" width="100%" height="100%" />',
        })
    }

    private updateBounds(item: SearchItem) {
        if (item.latitude < this.southWestCornerLatLng[0]) {
            this.southWestCornerLatLng[0] = item.latitude
        }
        if (item.longitude < this.southWestCornerLatLng[1]) {
            this.southWestCornerLatLng[1] = item.longitude
        }

        if (item.latitude > this.northEastCornerLatLng[0]) {
            this.northEastCornerLatLng[0] = item.latitude
        }
        if (item.longitude > this.northEastCornerLatLng[1]) {
            this.northEastCornerLatLng[1] = item.longitude
        }
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
