<template>
  <div class="singleitem">
    <div v-if="!hasSearchItem">
      Loading item...
    </div>

    <div v-if="hasSearchItem">
      <div >
        <div v-if="searchItem.mediaType === 'image'" >
          <a :href="searchItem.mediaUrl">
            <img class="o-image centered-image" :src="searchItem.slideUrl" />
          </a>
        </div>

        <div class="o-container info-container" >
          <div class="o-grid">
            <div class="o-grid__cell">
                <div class="o-grid">
                    <div class="result-set-info-text-left o-grid__cell c-text">
                        <font-awesome-icon icon="file"/>
                        {{searchItem.imageName}}
                    </div>
                    <div class="result-set-info-text-left o-grid__cell c-text">
                        <font-awesome-icon icon="tags"/>
                        {{displayer.keywordsString(searchItem)}}
                    </div>
                </div>

                  <div class="o-grid">
                      <div class="result-set-info-text-left o-grid__cell c-text">
                          <font-awesome-icon icon="folder"/>
                          {{searchItem.path}}
                      </div>
                      <div class="result-set-info-text-left o-grid__cell c-text">
                          <font-awesome-icon icon="map-marker"/>
                          {{searchItem.locationName}}
                          <!-- <a *ngIf="hasLocation()" [routerLink]="['/bylocation']" [queryParams]="{ lat:itemInfo.latitude, lon:itemInfo.longitude }">
                              <i class="fa fa-map-marker"></i> {{searchItem.locationName}}
                          </a> -->
                      </div>
                  </div>

                  <div class="o-grid">
                      <div class="result-set-info-text-left o-grid__cell c-text">
                          <font-awesome-icon icon="calendar"/>
                          {{displayer.getItemLocaleDateAndTime(searchItem)}}
                          <!-- <a [routerLink]="['/byday']" [queryParams]="{ m:displayer.itemMonth(itemInfo), d:displayer.itemDay(itemInfo) }">
                              <i class="fa fa-calendar"></i> {{displayer.getItemLocaleDateAndTime(itemInfo)}}
                          </a> -->
                      </div>
                      <div class="result-set-info-text-left o-grid__cell c-text">
                          <font-awesome-icon icon="map"/>
                          {{displayer.latDms(searchItem)}}, {{displayer.lonDms(searchItem)}}
                          <!-- <a *ngIf="hasLocation()" href="http://maps.google.com/maps?q={{searchItem.latitude}},{{searchItem.longitude}}">
                              <i class="fa fa-map"></i> {{displayer.latDms(itemInfo)}}, {{displayer.lonDms(itemInfo)}}
                          </a> -->
                      </div>
                  </div>
              </div>

              <div class="o-grid__cell o-grid__cell--width-20">
                  <div class="map-content" id="singleMap" >
                  </div>
              </div>
          </div>

          <div v-if="searchItem.locationName" class="full-location-name">
              <font-awesome-icon icon="map-pin"/>
              Location name: {{searchItem.locationDisplayName}}
          </div>
          <div v-if="searchItem.tags" class="full-location-name" >
              <font-awesome-icon icon="server"/>
              Automatic tags: {{displayer.tagsString(searchItem)}}
          </div>
          <br>
     </div>
    </div>
  </div>

  <div v-if="hasSearchItem" class="camera-and-media-info" >
    <div class="camera-and-media-info-item"> <font-awesome-icon icon="camera"/> {{searchItem.cameramake}} {{searchItem.cameramodel}}</div>
    <div v-if="searchItem.lensinfo" class="camera-and-media-info-item">, {{searchItem.lensinfo}}</div> <br>
    <div v-if="searchItem.fnumber && searchItem.fnumber != 0" class="camera-and-media-info-item"> <font-awesome-icon icon="info"/> ƒ/{{searchItem.fnumber}}, </div>
    <div v-if="searchItem.exposuretimestring" class="camera-and-media-info-item">{{searchItem.exposuretimestring}} s, </div>
    <div v-if="searchItem.focallength" class="camera-and-media-info-item">{{searchItem.focallength}} mm, </div>
    <div v-if="searchItem.iso" class="camera-and-media-info-item">ISO {{searchItem.iso}} </div>
    <div v-if="searchItem.durationseconds" class="camera-and-media-info-item">Video duration: {{searchItem.durationseconds}} seconds</div>
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


  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { emptySearchItem, SearchItem, SearchResults } from '@/models/SearchResults'
import { MediaIndexResponse } from '@/models/IndexResponse'
import { SearchRequest } from '@/models/SearchRequest'
import { dataDisplayer } from '@/providers/DataDisplayerProvider'
import { searchService } from '@/services/SearchService'

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
  private errorMessage: string = ''
  private showMediaSource = false
  private mediaSource: MediaIndexResponse = { sourceValues: [] }


  private get hasSearchItem(): boolean {
    return this.searchItem.id.length > 0
  }

  private get hasError(): boolean {
    return this.errorMessage.length > 0
  }

  private toggleShowMediaSource() {
    this.showMediaSource = !this.showMediaSource
  }

  private mounted() {
    this.searchItem.id = ''
    this.errorMessage = ''

    const query = this.$route.query
    const searchRequest = new SearchRequest()
    searchRequest.searchType = 's'
    searchRequest.properties = SingleItem.QueryProperties + ',' + SingleItem.CameraProperties +
      ',' + SingleItem.ImageProperties
    searchRequest.first = 1
    searchRequest.pageCount = 1
    searchRequest.searchText = 'path:' + query.id
    searchRequest.drilldown = ''
    searchService.searchCallback(searchRequest, (results?: SearchResults, message?: string) => {
      if (results && results.totalMatches > 0) {
        this.searchItem = results.groups[0].items[0]
        this.getMediaSource()
      }
      if (message) {
        this.errorMessage = message
      }
    })
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
.centered-image {
  display: block;
  margin: 0 auto;
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
</style>