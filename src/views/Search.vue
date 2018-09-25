<template>
   <div class="search">
    <p style="margin-bottom:.5em;" >
    <div class="c-input-group fp-horz-margins">
      <div class="o-field">        
        <input class="c-field" placeholder="Enter search text" type="text" v-model="typedText" @keyup.enter="onSearch" >
      </div>
      <button class="c-button c-button--info" type="submit" @click="onSearch" > <font-awesome-icon icon="search"/> Search</button>
    </div>

    <div v-if="results && isSearching === false" >

      <!-- The results header -->
      <h2 class="search-result-info" v-if="results.totalMatches == 0">
        No matches were found for '{{resultsSearchText}}'
      </h2>

      <div class="search-result-info" v-if="results.totalMatches > 0 && pageCount == 1">
        Showing all {{results.totalMatches}} items
      </div>

      <div class="search-result-info" v-if="results.totalMatches > 0 && pageCount > 1">
        <b>{{pageCount}}</b> pages / <b>{{results.totalMatches}}</b> matching items
      </div>

      <Paging/>

      <!-- Search results, by group -->
      <div v-for="group in results.groups" :key="group.name" >
        <div style="clear:both;"></div>
        <div class="group-outer-container">
          <div class="group-inner-container">
            <div class="group-item-header"> {{group.name}} </div>

            <div class="group-item-list">
              <div v-for="item in group.items" :key="item.id" class="group-item">

                <div class="group-item-thumbnail">
                  <!-- TODO: In order for slideshow to work, overall search index is needed (group index + item index) -->
                  <router-link :to="{ path: 'singleitem', query: { id: item.id }}">
                    <img :src="item.thumbUrl" >
                  </router-link>
                </div>

                <div class="group-item-info">
                  <div class="o-grid">
                    <div class="group-item-info-text-left o-grid__cell c-text" >{{item.imageName}}</div>
                    <div class="group-item-info-text-right o-grid__cell c-text">
                            {{item.city}}
                        <!-- <a [routerLink]="['/bylocation']" [queryParams]="{ lat:item.latitude, lon:item.longitude }">
                            {{item.city}}
                        </a> -->
                    </div>
                  </div>
                  <div class="o-grid">
                    <div class="group-item-info-text-left o-grid__cell c-text">
                            {{displayer.getItemLocaleDate(item)}}
                        <!-- <a [routerLink]="['/byday']" [queryParams]="{ m:displayer.itemMonth(item), d:displayer.itemDay(item) }">
                            {{displayer.getItemLocaleDate(item)}}
                        </a> -->
                    </div>
                    <div class="group-item-info-text-right o-grid__cell c-text">{{displayer.keywordsString(item)}}</div>
                  </div>
                  <!-- <div class="o-grid" *ngIf="uiState.showDistance">
                      <div *ngIf="item.distancekm == 0"> Same location</div>
                      <div *ngIf="item.distancekm > 0 && item.distancekm < 1.0"> Distance: {{(item.distancekm * 1000).toFixed(0)}} meters</div>
                      <div *ngIf="item.distancekm >= 1.0"> Distance: {{item.distancekm.toFixed(2)}} KM</div>
                  </div> -->
                  <div class="o-grid" v-if="item.warnings">
                      <span class="c-badge c-badge--secondary">{{item.warnings.length}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style="clear:both;"></div>
          </div>
        </div>
      </div>

      <Paging/>

    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { searchService } from '@/services/SearchService'
import { SearchResults } from '@/models/SearchResults'
import { dataDisplayer } from '@/providers/DataDisplayerProvider'
import { SearchRequest } from '@/models/SearchRequest'
import Paging from '@/components/Paging.vue'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'


@Component({
  components: {
    Paging,
  },
})

export default class Search extends Vue {
  public static QueryProperties: string = 'id,city,keywords,imageName,createdDate,latitude,longitude' +
    ',thumbUrl,slideUrl,warnings'
  private typedText: string = ''
  private resultsSearchText?: string = undefined
  private displayer = dataDisplayer

  private invokeSearchService(query: any): void {
      const searchRequest = searchRouteBuilder.toSearchRequest(query)
      searchRequest.properties = Search.QueryProperties
      searchService.search(searchRequest)
      this.typedText = this.resultsSearchText = searchRequest.searchText
  }

  private onSearch(): void {
    // Only update on a change
    if (this.resultsSearchText === undefined || this.resultsSearchText !== this.typedText) {
      // Rather than search directly, update the URL, which will indirectly invoke onRouteChanged
      // This will add the searches to the browser history
      const searchRequest = this.$store.state.serverRequest.request
      searchRequest.first = 1
      searchRequest.searchType = 's'
      searchRequest.searchText = this.typedText
      searchRequest.properties = Search.QueryProperties
      searchRequest.pageCount = SearchRequest.defaultItemsPerPage

      this.resultsSearchText = this.typedText

      this.$router.push({ path: 'search', query: searchRouteBuilder.toParameters(searchRequest)})
    }
  }

  private mounted() {
    const query = this.$route.query
    if ('q' in query || 't' in query) {
      this.invokeSearchService(query)
    }
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any) {
    this.invokeSearchService(to.query)
  }

  private get isSearching(): boolean {
    return this.$store.state.serverResponse.isSearching
  }

  private get results(): SearchResults {
    return this.$store.state.serverResponse.results
  }

  private get pageCount(): number {
    if (this.results) {
      return Math.ceil(this.results.totalMatches / this.$store.state.serverRequest.request.pageCount)
    }
    return 0
  }
}
</script>


<style scoped>
.fp-horz-margins {
  padding-left: 1em;
  padding-right: 1em;
}
.search-result-info {
  text-align: center;
}
.group-outer-container {
	background: #303030;
  margin-bottom: 1.5em;
}
.group-inner-container {
  margin-top: 0;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  margin-left: 5px;
}
.group-item-header {
	font-size: 2em;
	padding-left: 5px;
  text-align: left;
}
.group-item-list {
	-webkit-flex-wrap: wrap;
	display: flex;
	flex-wrap: wrap;
	float:left;
  font-size:small;
  width: 100%;
}
.group-item {
  background: #585858;
  float:left;
  margin-bottom:10px;
  margin-right:10px;
  padding: 10px 10px 3px 10px;
}
.group-item-thumbnail {
  text-align:center;
}
.group-item-info {
	font-size:1.2em;
}
.group-item-info-text-left {
	color:white;
	text-align: left;
	padding:0 0 0 3px;
}
.group-item-info-text-right {
	color:white;
	text-align: right;
	margin:0 0 0 10px;
	padding:0 3px 0 0;
}

</style>
