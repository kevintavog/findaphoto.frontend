<template>
  <div class="searchresults" v-if="hasResults && isSearching === false">

    <!-- The results header -->
    <h2 v-if="results.totalMatches == 0" class="search-result-info" >
      No matches were found {{searchDescription}}
    </h2>
    <div v-else>
      <div v-if="!hideSearchDescription" class="search-description" >
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
    <ResultsFilter />

    <!-- Search results, by group -->
    <div v-for="(group,index) in results.groups" :key="group.name+index" >
      <div style="clear:both;"></div>
      <div class="group-outer-container">
        <div class="group-inner-container">
          <div v-if="!hideGroups" class="group-item-header"> {{groupName(group)}} </div>
          <div v-if="!hideGroups" class="group-item-secondary"> {{locationSynopsis(group)}} </div>

          <div class="group-item-list">
            <div v-for="item in group.items" :key="item.id" class="group-item">

              <div class="group-item-thumbnail">
                <router-link :to="{ path: 'singleitem', query: singleItemParams(group, item)}">
                  <img :src="item.thumbUrl" >
                </router-link>
              </div>

              <div class="group-item-info">
                <div class="o-grid">
                  <div class="group-item-info-text-left o-grid__cell c-text" >{{item.imageName}}</div>
                  <div v-if="item.city" class="group-item-info-text-right o-grid__cell c-text">
                    <router-link :to="{ path: '/map', query: { lat: item.latitude, lon: item.longitude } }" >
                      {{item.city}}
                    </router-link>
                  </div>
                </div>
                <div class="o-grid">
                  <div class="group-item-info-text-left o-grid__cell c-text">
                    <router-link :to="{ path: '/byday', query: { m: displayer.itemMonth(item), d: displayer.itemDay(item) } }" >
                      {{displayer.getItemLocaleDate(item)}}
                    </router-link>
                  </div>
                  <div class="group-item-info-text-right o-grid__cell c-text">
                    <span v-for="k in item.keywords" :key="k" class="item-keyword">
                      <router-link :to="{ path: '/search', query: { q: 'keywords:' + k } }" >{{k}}</router-link>
                    </span>
                  </div>
                </div>
                <div class="o-grid" v-if="showDistance">
                  <div> {{displayer.getItemDistanceString(item)}} </div>
                </div>
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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { SearchRequest } from '@/models/SearchRequest'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import { dataDisplayer } from '@/providers/DataDisplayerProvider'
import { SearchGroup, SearchResults, SearchItem } from '@/models/SearchResults'
import Paging from '@/components/Paging.vue'
import ResultsFilter from '@/components/ResultsFilter.vue'

@Component({
  components: {
    Paging,
    ResultsFilter,
  },
})

export default class SearchResultsList extends Vue {
  private static days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  @Prop(Boolean) private dayInGroupName!: boolean
  @Prop(Boolean) private hideSearchDescription!: boolean
  @Prop(Boolean) private showDistance!: boolean
  @Prop(Boolean) private hideGroups!: boolean
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

  private locationSynopsis(group: SearchGroup): string {
    if (group.locations && group.locations.length > 0) {
      let countries = group.locations
      let states = countries.flatMap( (c) => c.states ).sort( (a, b) => b.count - a.count)
      let cities = states.flatMap( (s) => s.cities).sort( (a, b) => b.count - a.count)
      let sites = cities.flatMap( (c) => c.sites).sort( (a, b) => b.count - a.count)

      let cityDisplay = cities.map( (c) => c.city ).join(', ')
      var siteDisplay = sites.map( (s) => s.site ).join(', ')
      if (siteDisplay.length > 0) {
        return siteDisplay + ' - ' + cityDisplay
      }
      return cityDisplay
    }
    return ''
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

  private singleItemParams(group: SearchGroup, item: SearchItem): any {
    const params = searchRouteBuilder.toPrimaryParameters(this.request)
    params.id = item.id
    params.i = this.searchIndex(group, item).toString()
    return params
  }

  private searchIndex(group: SearchGroup, item: SearchItem): number {
    let index = 0
    for (const g of this.results.groups) {
      if (g === group) {
        for (const i of g.items) {
          if (i === item) {
            return this.request.first + index
          }
          index += 1
        }
      }
      index += g.items.length
    }

    return -1
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
.group-item-secondary {
  padding-left: 10px;
  padding-bottom: 3px;
  text-align: left;
  color: #c5c5c5;
}
.group-item-list {
  -webkit-flex-wrap: wrap;
  display: flex;
  flex-wrap: wrap;
  float: left;
  font-size: small;
  width: 100%;
}
.group-item {
  background: #585858;
  float: left;
  margin-bottom: 10px;
  margin-right: 10px;
  padding: 10px 10px 3px 10px;
}
.group-item-thumbnail {
  text-align: center;
}
.group-item-info {
  font-size: 1.2em;
}
.group-item-info-text-left {
  color: white;
  text-align: left;
  padding: 0 0 0 3px;
}
.group-item-info-text-right {
  color: white;
  text-align: right;
  margin: 0 0 0 10px;
  padding: 0 3px 0 0;
}
.item-keyword {
  margin-left: 0.4em;
}
</style>
