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

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { emptySearchItem, SearchItem, SearchResults } from '@/models/SearchResults'
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

  @Watch('results')
  private onResultsChanged(to: any, from: any) {
    if (this.results.totalMatches > 0) {
      this.searchItem = this.results.groups[0].items[0]
      console.log('searchItem updated')
    }
  }

  private get hasSearchItem(): boolean {
    return this.searchItem.id.length > 0
  }

  private get results(): SearchResults {
    return this.$store.state.serverResponse.results
  }

  private mounted() {
    this.searchItem.id = ''
    const query = this.$route.query
    const searchRequest = new SearchRequest()
    searchRequest.searchType = 's'
    searchRequest.properties = SingleItem.QueryProperties + ',' + SingleItem.CameraProperties +
      ',' + SingleItem.ImageProperties
    searchRequest.first = 1
    searchRequest.pageCount = 1
    // searchRequest.searchText = 'path:"' + query.id + '"'
    searchRequest.searchText = 'path:' + query.id
    searchRequest.drilldown = ''
    searchService.search(searchRequest)
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
@media (max-width: 1024px){
    .info-container {
        max-width:64em;
    }
}
@media (max-width: 740px){
    .info-container {
        max-width:30em;
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

</style>