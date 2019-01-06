<template>
  <div class="map box">
    <div class="controls">
      <b-dropdown>
        <button class="button has-background-black-bis has-text-primary" slot="trigger">
            <b-icon icon="align-justify" />
        </button>
        <b-dropdown-item @click="toggleSearchBar">
            <b-icon icon="search" />
            <span> Toggle search bar </span>
        </b-dropdown-item>
        <b-dropdown-item @click="fitToMap">
            <b-icon icon="vector-square" />
            <span> Fit to map </span>
        </b-dropdown-item>
        <b-dropdown-item @click="searchCenterOfMap">
            <b-icon icon="bullseye" />
            <span> Search near center of map </span>
        </b-dropdown-item>
        <b-dropdown-item @click="searchNearby">
            <b-icon icon="location-arrow" />
            <span> Search nearby </span>
        </b-dropdown-item>

      </b-dropdown>

      <span v-if="!isLoading && totalMatches > 0" class="loaded-status">
          <span class="loaded-message">
              {{totalMatches}} items {{readableSearchString}}
          </span>
      </span>

      <span v-if="!isLoading && totalMatches == 0" class="loaded-status">
          <span class="loaded-message">
              No matches {{readableSearchString}}
          </span>
      </span>

      <span v-if="isLoading" class="loading-status">
          <span class="loading-message">
              Loading {{totalMatches}} items
          </span>
          <span class="c-progress c-progress--rounded u-small">
            <span role="progressbar" aria-valuemin="0" aria-valuemax="100" 
                v-bind:style="{ 'width': percentageLoadedWidth }" class="c-progress__bar c-progress__bar--info" />
          </span>
      </span>
      <div style="clear: both;" />
      <SearchBar v-if="searchBarVisible" page="map" :search-type="searchType" :query-properties="queryProperties" class="search-bar" />

    </div>


    <div class="content-container">
        <main class="map-content" id="map" >
        </main>

        <!-- <div class="selected-item" > -->
        <div v-if="selectedItem !== undefined" class="selected-item" >
            <div aria-hidden class="c-overlay c-overlay--visible" @click="closeSelectedItemDialog" ></div>
            <div role="dialog" class="o-modal o-modal--visible selected-item-dialog">
              <div class="c-card">

                <div class="c-card__body dialog-body">
                  <button type="button" class="c-button c-button--close dialog-close-button" @click="closeSelectedItemDialog" >
                    &times;
                  </button>
                  <div>
                    <button type="button" class="c-button c-button--warning c-button--ghost c-button--rounded selected-item-next-previous" 
                          @click="previousItem" >
                        <b-icon icon="arrow-left" />
                    </button>
                    <button type="button" class="c-button c-button--warning c-button--ghost c-button--rounded selected-item-next-previous" 
                          @click="nextItem" >
                        <b-icon icon="arrow-right" />
                    </button>
                    {{currentItemMarkerIndex + 1}} of {{totalMatches}}
                  </div>

                  <span v-if="selectedItem.mediaType == 'image'">
                      <img v-if="selectedItem.width >= selectedItem.height" class="info-image info-image-landscape" v-bind:src="selectedItem.slideUrl" >
                      <img v-if="selectedItem.width < selectedItem.height" class="info-image info-image-portrait" v-bind:src="selectedItem.slideUrl" >
                  </span>
                  <div v-if="selectedItem.mediaType == 'video'" >
                      <video v-if="selectedItem.width >= selectedItem.height" class="info-image info-image-landscape" controls autoplay :src="selectedItem.mediaUrl" />
                      <video v-if="selectedItem.width < selectedItem.height" class="info-image info-image-portrait" controls autoplay :src="selectedItem.mediaUrl" />
                  </div>

                  <div class="c-paragraph">
                    <a :href="selectedItem.mediaUrl">
                        <b-icon icon="file" />
                        {{selectedItem.imageName}}
                    </a>
                  </div>
                  <div class="c-paragraph">
                    <b-icon icon="folder" />
                    {{displayer.parentFolder(selectedItem)}}
                  </div>
                  <div class="c-paragraph">
                    <b-icon icon="calendar" />
                    {{displayer.getItemLocaleDateAndTime(selectedItem)}} 
                  </div>
                  <div class="c-paragraph">
                    <b-icon icon="map-marker" />
                    {{selectedItem.locationDisplayName}} 
                  </div>

                </div>
              </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import SearchBar from '@/components/SearchBar.vue'
import { SearchRequest } from '@/models/SearchRequest'
import { SearchItem, SearchResults, emptySearchItem } from '@/models/SearchResults'
import { locationProvider, FPLocation } from '@/providers/LocationProvider'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import { searchService } from '@/services/SearchService'
import { dataDisplayer } from '@/providers/DataDisplayerProvider'
import L from 'leaflet'
import 'leaflet.markercluster'

@Component({
    components: {
        SearchBar,
    },
    metaInfo() {
        return {
            title: 'Map',
        }
    },
})
export default class Map extends Vue {
    private static defaultMarkerWidthAndHeight = 75
    private static defaultSearchDistanceKm = 5
    private static locationPageSize = 100

    private displayer = dataDisplayer
    private searchBarVisible = false
    private searchType = 'l'
    private queryProperties: string = 'createdDate,height,id,imageName,latitude' +
        ',longitude,locationDisplayName,mediaType,mediaUrl,path,slideUrl,thumbUrl,width'
    private map?: L.Map
    private cluster?: L.MarkerClusterGroup
    private southWestCornerLatLng: L.LatLngTuple = [90, 180]
    private northEastCornerLatLng: L.LatLngTuple = [-90, -180]
    private markers: L.Marker[] = []
    private currentItem: SearchItem = emptySearchItem
    private currentItemMarkerIndex = 0
    private isLoading = false
    private totalMatches = 0
    private itemsRetrieved = 0
    private readableSearchString = ''


    private invokeSearchService(query: any): void {
        this.readableSearchString = ''
        const searchRequest = searchRouteBuilder.toSearchRequest(query, this.searchType)
        if (searchRequest.searchType === 'l'
            && searchRequest.latitude === -1
            && searchRequest.longitude === -1) {
            return
        }

        this.cluster!.clearLayers()
        this.markers = []
        this.southWestCornerLatLng = [90, 180]
        this.northEastCornerLatLng = [-90, -180]
        this.itemsRetrieved = 0
        this.totalMatches = 0
        this.isLoading = true
        this.closeSelectedItemDialog()

        searchRequest.properties = this.queryProperties
        this.readableSearchString = ' ' + searchRouteBuilder.toReadableString(searchRequest)
        searchService.search(searchRequest)
    }

    private mounted(): void {
        this.initializeMap()
        this.invokeSearchService(this.$route.query)
    }

    private get percentageLoadedWidth() {
        let percent = 100
        if (this.isLoading) {
            if (this.totalMatches === 0) {
                percent = 0
            } else {
                percent = Math.round(this.itemsRetrieved * 100 / this.totalMatches)
            }
        }
        return percent.toString() + '%'
    }

    private get selectedItem(): SearchItem | undefined {
        if (this.currentItem.id === '') {
            return undefined
        }
        return this.currentItem
    }

    private get results(): SearchResults {
        return this.$store.state.serverResponse.results
    }

    private get request(): SearchRequest {
        return this.$store.state.serverRequest.request
    }

    private closeSelectedItemDialog(): void {
        this.currentItem = emptySearchItem
    }

    private previousItem(): void {
        if (this.selectedItem) {
            this.selectItemByMarkerIndex(this.currentItemMarkerIndex - 1)
        }
    }

    private nextItem(): void {
        if (this.selectedItem) {
            this.selectItemByMarkerIndex(this.currentItemMarkerIndex + 1)
        }
    }

    private selectItemByMarkerIndex(index: number): void {
        if (index >= this.markers.length) {
            index = 0
        }
        if (index < 0) {
            index = this.markers.length - 1
        }
        this.currentItemMarkerIndex = index
        const options = this.markers[index].options
        this.currentItem = (options as any).item

        this.map!.panTo([this.currentItem.latitude, this.currentItem.longitude])
    }

    @Watch('results')
    private onResultsChanged(to: any, from: any) {
        if (this.results) {
            this.totalMatches = this.results.totalMatches
            this.results.groups.forEach((group) => {
                group.items.forEach((item) => {
                    if (item.latitude && item.longitude) {
                        this.updateBounds(item)
                        this.markers.push(this.createMarker(item, this.markers.length))
                    }
                })
            })

            if (this.request.first === 1) {
                this.fitToMap()
            }

            this.itemsRetrieved = this.request.first + this.results.resultCount - 1
            if (this.results.resultCount > 0 && this.itemsRetrieved < this.results.totalMatches) {
                const searchRequest = this.request
                searchRequest.first = this.request.first + this.request.pageCount
                searchService.search(searchRequest)
            } else {
                this.isLoading = false
                this.cluster!.addLayers(this.markers)
            }
        }
    }

    private fitToMap(): void {
        if (this.totalMatches > 0) {
            this.map!.fitBounds([this.southWestCornerLatLng, this.northEastCornerLatLng], undefined)
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
        locationProvider.currentLocation((location?: FPLocation, errorMessage?: string) => {
            if (errorMessage && errorMessage.length > 0) {
                this.$store.commit('addErrorMessage', errorMessage)
            } else if (location) {
                this.searchLocation(location.latitude, location.longitude)
            }
        })
    }

    private searchLocation(latitude: number, longitude: number): void {
        const searchRequest = this.$store.state.serverRequest.request
        searchRequest.searchType = 'l'
        searchRequest.latitude = latitude
        searchRequest.longitude = longitude
        searchRequest.maxKilometers = Map.defaultSearchDistanceKm     // SHOULD BE ADJUSTABLE BY USER VIA UI
        searchRequest.pageCount = Map.locationPageSize
        searchRequest.first = 1
        this.$router.push({ path: 'map', query: searchRouteBuilder.toParameters(searchRequest) })
    }

    private initializeMap(): void {
        if (this.map) { return }

        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            zoomControl: false,
        })

        L.control.zoom({ position: 'topright' }).addTo(this.map)

        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        }).addTo(this.map)

        L.control.scale({ position: 'bottomright' }).addTo(this.map)

        this.cluster = L.markerClusterGroup({
            spiderfyDistanceMultiplier: 3,
            maxClusterRadius: 100,
            showCoverageOnHover: false,
            iconCreateFunction: (clstr: L.MarkerCluster): L.DivIcon => {
                const childMarkers = clstr.getAllChildMarkers()
                const firstMarker = childMarkers[0]
                const markerIcon = firstMarker.options.icon as L.DivIcon
                return L.divIcon({
                    iconSize: markerIcon.options.iconSize,
                    html:
                        '<div class="cluster-ontainer"> ' +
                        markerIcon.options.html +
                        '<span class="c-badge c-badge--rounded marker-cluster-text">'
                        + childMarkers.length + '</span>' +
                        '</div>',
                })
            },
        })
        this.map.addLayer(this.cluster)
    }

    private createMarker(item: SearchItem, index: number) {
        const marker = L.marker([item.latitude, item.longitude], { icon: this.getDefaultThumbnailIcon(item) })
        const opt = marker.options as any
        opt.item = item
        marker.on('click', (evt) => {
            this.currentItemMarkerIndex = index
            this.currentItem = item
        })
        return marker
    }

    private getDefaultThumbnailIcon(item: SearchItem): L.DivIcon {
        let width = Map.defaultMarkerWidthAndHeight
        let height = Map.defaultMarkerWidthAndHeight
        if (item.width >= item.height) {
            height = item.height * (width / item.width)
        } else {
            width = item.width * (height / item.height)
        }
        return L.divIcon({
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

<style>
.marker-cluster-text {
  position: absolute;
  left: 1px;
  top: 1px;
  background-color: #090;
  color: white;
}

a:visited {
  color: black;
}

a:hover {
  color: black;
}

a:link {
  color: black;
}

.overrideHoverColor a:hover {
  color: black;
}

</style>

<style scoped>
.box {
  background-color: #222;
  color: white;
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  height: 100%;
  padding: 0.1em 0.3em 0.3em 0.3em;
}

.controls {
  z-index: 1000;
  text-align: left;
  padding-top: 0em;
  padding-left: 0.3em;
  padding-right: 0.1em;
  padding-bottom: 0.3em;
}

.control-button {
  margin-right: 0.8em;
}

.loading-message {
  margin-left: 0.5em;
}

.loaded-message {
  margin-left: 0.5em;
}

.search-bar {
  padding-top: 0.4em;
  padding-bottom: 0.4em;
  margin-left: -0.5em;
}

.content-container {
  flex-grow: 1;
  height: 100%;
}

.map-content {
  flex-grow: 1;
  height: calc(100% - 2em);
}

.selected-item {
  text-align: initial;
}

.selected-item-dialog {
  background-color: #606060;
}

.info-image {
  display: block;
  margin: 0 auto;
  padding-top: 3px;
  pointer-events: auto;
}

.info-image-portrait {
  max-width: 50%;
  max-height: 50%;
}

.info-image-landscape {
  max-width: 100%;
  max-height: 50%;
}

.dialog-body {
  padding: 0.6em;
}

.dialog-close-button {
  float: left;
}

.selected-item-next-previous {
  font-size: 1em;
  padding-top: 0.1em;
  padding-bottom: 0.1em;
  margin-right: 1em;
  margin-bottom: 0.2em;
  color: yellow;
}
</style>
