<template>
  <div class="singleitem">
    <div v-if="!hasSearchItem">
      Loading item...
    </div>

    <div v-if="hasSearchItem">
      <div class="next-previous-group">
        <button type="button" class="c-button c-button--warning c-button--ghost c-button--rounded selected-item-next-previous" 
              @click="previousItem" >
            <font-awesome-icon icon="arrow-left"/>
        </button>
        <button type="button" class="c-button c-button--warning c-button--ghost c-button--rounded selected-item-next-previous" 
              @click="nextItem" >
            <font-awesome-icon icon="arrow-right"/>
        </button>
        {{itemIndex}} of {{totalMatches}}
      </div>

      <div >
        <div v-if="searchItem.mediaType === 'image'" class="media-container" >
            <img class="o-image centered-image" :src="searchItem.slideUrl" />
        </div>
        <div v-if="searchItem.mediaType == 'video'" class="media-container" >
            <video class="o-image centered-image" controls autoplay :src="searchItem.mediaUrl" />
        </div>

        <br>

        <div class="o-container info-container" >
          <div class="o-grid">
            <div class="o-grid__cell">
                <div class="o-grid">
                    <div class="result-set-info-text-left o-grid__cell c-text">
                      <a :href="searchItem.mediaUrl">
                        <font-awesome-icon class="info-icon" icon="file"/>
                        {{searchItem.imageName}}
                      </a>
                    </div>
                    <div class="result-set-info-text-left o-grid__cell c-text">
                        <font-awesome-icon class="info-icon" icon="tags"/>
                        <span v-for="k in searchItem.keywords" :key="k">
                          <router-link :to="{ path: '/search', query: { q: 'keywords:' + k } }" >{{k}}</router-link>,
                        </span>
                    </div>
                </div>

                  <div class="o-grid">
                      <div class="result-set-info-text-left o-grid__cell c-text">
                          <router-link :to="{ path: '/byday', query: { m: displayer.itemMonth(searchItem), d: displayer.itemDay(searchItem) } }" >
                            <font-awesome-icon class="info-icon" icon="calendar"/>
                            {{displayer.getItemLocaleDateAndTime(searchItem)}}
                          </router-link>
                      </div>
                      <div class="result-set-info-text-left o-grid__cell c-text">
                          <router-link :to="{ path: '/search', query: { q: 'path.value:' + displayer.searchablePath(searchItem) } }" >
                            <font-awesome-icon class="info-icon" icon="folder"/>
                            {{searchItem.path}}
                          </router-link>
                      </div>
                  </div>

                  <div class="o-grid">
                      <div class="result-set-info-text-left o-grid__cell c-text">
                        <font-awesome-icon class="info-icon" icon="camera"/> {{searchItem.cameramake}} {{searchItem.cameramodel}}
                        <div v-if="searchItem.lensinfo" class="camera-and-media-info-item">, {{searchItem.lensinfo}}</div>
                      </div>
                      <div class="result-set-info-text-left o-grid__cell c-text">
                          <font-awesome-icon class="info-icon" icon="map-marker"/>
                          <span v-if="searchItem.locationDisplayName">
                            <router-link :to="{ path: '/map', query: { lat: searchItem.latitude, lon: searchItem.longitude } }" >
                              {{searchItem.locationName}}
                            </router-link>
                          </span>
                      </div>
                  </div>

                  <div class="o-grid">
                      <div class="result-set-info-text-left o-grid__cell c-text">
                        <span v-if="searchItem.fnumber && searchItem.fnumber != 0"> <font-awesome-icon class="info-icon" icon="info"/> ƒ/{{searchItem.fnumber}}, </span>
                        <span v-if="searchItem.exposuretimestring" class="camera-and-media-info-item">{{searchItem.exposuretimestring}} s, </span>
                        <span v-if="searchItem.focallength" class="camera-and-media-info-item">{{searchItem.focallength}} mm, </span>
                        <span v-if="searchItem.iso" class="camera-and-media-info-item">ISO {{searchItem.iso}} </span>
                        <span v-if="searchItem.durationseconds" class="camera-and-media-info-item">Video duration: {{searchItem.durationseconds}} seconds</span>
                      </div>
                      <div class="result-set-info-text-left o-grid__cell c-text">
                        <font-awesome-icon class="info-icon" icon="map"/>
                        <span v-if="searchItem.locationDisplayName">
                          {{displayer.latDms(searchItem)}}, {{displayer.lonDms(searchItem)}}
                            <a class="map-link" 
                                :href="'http://maps.google.com/maps?q=' + searchItem.latitude + ',' + searchItem.longitude" >
                              (Google)
                            </a>
                            <a class="map-link"
                                :href="'http://www.openstreetmap.org/?mlat=' + searchItem.latitude + '&mlon='  + searchItem.longitude" >
                              (OpenStreetMap)
                            </a>
                        </span>
                      </div>
                  </div>

                  <br>

                  <div v-if="searchItem.locationName" class="o-grid">
                    <router-link :to="{ path: '/map', query: { lat: searchItem.latitude, lon: searchItem.longitude } }" >
                      <div class="result-set-info-text-left o-grid__cell c-text">
                        <font-awesome-icon class="info-icon" icon="map-pin"/>
                        Location name: {{searchItem.locationDisplayName}}
                      </div>
                    </router-link>
                  </div>
                  <br>

                  <div v-if="searchItem.tags" class="o-grid">
                      <div class="result-set-info-text-left o-grid__cell c-text">
                        <font-awesome-icon class="info-icon" icon="server"/>
                        Automatic tags:
                        <span v-for="t in searchItem.tags" :key="t">
                          <router-link :to="{ path: '/search', query: { q: 'tags:' + t } }" >{{t}}</router-link>,
                        </span>
                      </div>
                  </div>

              </div>

          </div>
     </div>
    </div>
  </div>

  <br>
  <div v-if="showMediaSource" class="c-text media-source-header" >
      <div @click="toggleShowMediaSource()" class="media-source-clickable">
          <font-awesome-icon icon="cogs" size="2x" />
          <div class="media-source-message"> Full document source </div>
          <font-awesome-icon icon="caret-down" size="2x" />
      </div>

      <div class="o-container o-container--large">
          <div class="o-grid c-text media-source-table-header" >
              <div class="o-grid__cell--width-20 media-source-name"> Field name </div>
              <div class="o-grid__cell media-source-value">Value</div>
          </div>
          <div v-for="nv in mediaSource.sourceValues" :key="nv.name" class="o-grid c-text media-source media-source-row" >
              <div class="o-grid__cell--width-20 media-source-name"> {{nv.name}} </div>
              <div class="o-grid__cell media-source-value ">{{nv.value}}</div>
          </div>
      </div>
  </div>
  <div v-else class="c-text media-source-header" >
      <div @click="toggleShowMediaSource()" class="media-source-clickable">
          <font-awesome-icon icon="cogs" size="2x"/>
          <div class="media-source-message"> Full document source </div>
          <font-awesome-icon icon="caret-right" size="2x"/>
      </div>
  </div>

  <div class="next-previous-group">
    <button type="button" class="c-button c-button--warning c-button--ghost c-button--rounded selected-item-next-previous" 
          @click="previousItem" >
        <font-awesome-icon icon="arrow-left"/>
    </button>
    <button type="button" class="c-button c-button--warning c-button--ghost c-button--rounded selected-item-next-previous" 
          @click="nextItem" >
        <font-awesome-icon icon="arrow-right"/>
    </button>
    {{itemIndex}} of {{totalMatches}}
  </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { emptySearchItem, SearchItem, SearchResults } from '@/models/SearchResults'
import { MediaIndexResponse } from '@/models/IndexResponse'
import { SearchRequest } from '@/models/SearchRequest'
import { dataDisplayer } from '@/providers/DataDisplayerProvider'
import { searchService } from '@/services/SearchService'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'

@Component({})
export default class SingleItem extends Vue {
  private static QueryProperties: string = 'city,createdDate,keywords,id,imageName,latitude' +
    ',locationDisplayName,locationName,longitude,mediaType,mediaUrl,path,slideUrl,tags,thumbUrl' +
    ',warnings'
  private static CameraProperties: string = 'cameramake,cameramodel,lensinfo,lensmodel'
  private static ImageProperties: string = 'aperture,durationseconds,exposeureprogram' +
    ',exposuretimestring,flash,fnumber,focallength,height,iso,width'

  private displayer = dataDisplayer
  private searchItem: SearchItem = emptySearchItem
  private showMediaSource = false
  private mediaSource: MediaIndexResponse = { sourceValues: [] }
  private itemIndex = 0
  private totalMatches = 0

  private get tags(): string {
    return dataDisplayer.tagsString(this.searchItem)
  }

  private get hasSearchItem(): boolean {
    return this.searchItem.id.length > 0
  }

  private previousItem(): void {
    let newIndex = this.itemIndex - 1
    if (newIndex < 1) {
      newIndex = this.totalMatches
    }
    this.invokePage(newIndex)
  }

  private nextItem(): void {
    let newIndex = this.itemIndex + 1
    if (newIndex > this.totalMatches) {
      newIndex = 1
    }
    this.invokePage(newIndex)
  }

  private toggleShowMediaSource() {
    this.showMediaSource = !this.showMediaSource
  }

  private invokePage(indexNumber: number) {
    const searchRequest = searchRouteBuilder.toSearchRequest(this.$route.query, 's')
    const params = searchRouteBuilder.toPrimaryParameters(searchRequest)
    params.i = indexNumber.toString()
    this.$router.push({ path: '/singleitem', query: params })
  }

  private invokeSearch(query: any) {
    this.searchItem.id = ''

    const searchRequest = searchRouteBuilder.toSearchRequest(query, 's')
    searchRequest.properties = SingleItem.QueryProperties +
      ',' + SingleItem.CameraProperties +
      ',' + SingleItem.ImageProperties
    searchRequest.pageCount = 1
    searchRequest.drilldown = ''

    searchService.searchCallback(searchRequest, (results?: SearchResults, message?: string) => {
      if (results && results.totalMatches > 0) {
        this.searchItem = results.groups[0].items[0]
        this.totalMatches = results.totalMatches
        this.itemIndex = searchRequest.first
        this.getMediaSource()
      }
    })
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any) {
    this.invokeSearch(to.query)
  }

  private mounted() {
    this.invokeSearch(this.$route.query)
  }

  private getMediaSource() {
    searchService.mediaSource(encodeURI(this.searchItem.id), (results?: MediaIndexResponse) => {
      if (results) {
        this.mediaSource = results!
      }
    })

  }
}
</script>

<style scoped>
.singleitem {
  text-align: initial;
}
.info-icon {
  width: 1.5em;
}
.centered-image {
  display: block;
}

.media-container {
  margin-left: 0.5em;
  margin-right: 0.5em;
}
.info-container {
  max-width: 78em;
}
@media (max-width: 1024px) {
  .info-container {
    max-width: 64em;
  }
}
@media (max-width: 740px) {
  .info-container {
    max-width: 30em;
  }
}

.result-set-info-text-left {
  color: white;
  text-align: left;
  padding: 0 0 0 3px;
  margin-left: 10px;
}
.result-set-info-text-right {
  color: white;
  text-align: right;
  margin: 0 0 0 10px;
  padding: 0 3px 0 0;
}
.full-location-name {
  margin-left: 10px;
}

.map-link {
  margin-left: 1em;
}
.map-content {
  width: 200px;
  margin-top: 1px;
  min-width: 200px;
  max-width: 200px;
  height: 130px;
  min-height: 130px;
  max-height: 130px;
}
.camera-and-media-info {
  margin-left: 10px;
  text-align: left;
}
.camera-and-media-info-item {
  display: inline;
}

.media-source-header {
  text-align: left;
  margin-left: 10px;
  color: white;
  background-color: #34495e;
}
.media-source-clickable {
  margin-left: 1em;
  cursor: pointer;
}
.media-source {
  color: white;
}
.media-source-table-header {
  color: yellow;
  background-color: #14395e;
  cursor: auto;
}
.media-source-message {
  display: inline;
  font-size: 1.9em;
}
.media-source-row:nth-child(odd) {
  background: #14395e;
}
.media-source-name {
  margin-left: 5px;
  display: inline;
  padding-left: 10px;
}
.media-source-value {
  margin-right: 5px;
  display: inline;
}
.next-previous-group {
  text-align: center;
  margin-top: 0.6em;
  margin-bottom: 0.5em;
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
