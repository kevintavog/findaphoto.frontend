<template>
  <div class="searchresults" v-if="hasResults && isSearching === false">

    <!-- The results header -->
    <h2 v-if="results.totalMatches == 0" class="search-result-info" >
      No matches were found for '{{request.searchText}}'
    </h2>
    <div v-else>
      <div v-if="hideSearchDescription !== true" class="search-description" >
        Results {{searchDescription}}
      </div>
    </div>

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
          <div class="group-item-header"> {{groupName(group)}} </div>

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
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { SearchRequest } from '@/models/SearchRequest'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import { dataDisplayer } from '@/providers/DataDisplayerProvider'
import { SearchGroup, SearchResults } from '@/models/SearchResults'
import Paging from '@/components/Paging.vue'

@Component({
  components: {
    Paging,
  },
})

export default class SearchResultsList extends Vue {
  private static days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  @Prop() private dayInGroupName!: boolean
  @Prop() private hideSearchDescription!: boolean
  private displayer = dataDisplayer

  private get isSearching(): boolean {
    return this.$store.state.serverResponse.isSearching
  }

  private groupName(group: SearchGroup): string {
    if (this.dayInGroupName && group.items.length > 0) {
      return group.name + ' - ' + SearchResultsList.days[new Date(group.items[0].createdDate).getDay()]
    }
    return group.name
  }

  private get searchDescription(): string {
    return searchRouteBuilder.toReadableString(this.request)
  }

  private get request(): SearchRequest {
    return this.$store.state.serverRequest.request
  }

  private get hasResults(): boolean {
    return this.$store.state.serverResponse.hasResults
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

.search-description {
  font-size: 1.5em;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
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
