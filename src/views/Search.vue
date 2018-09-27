<template>
   <div class="search">
    <SearchBar :search-type="searchType" :query-properties="queryProperties" />
    <SearchResultsList />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { searchService } from '@/services/SearchService'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import SearchBar from '@/components/SearchBar.vue'
import SearchResultsList from '@/components/SearchResultsList.vue'


@Component({
  components: {
    SearchBar,
    SearchResultsList,
  },
})
export default class Search extends Vue {
  private searchType = 's'
  private queryProperties: string = 'id,city,keywords,imageName,createdDate,latitude,longitude' +
    ',thumbUrl,slideUrl,warnings'


  private invokeSearchService(query: any): void {
    const searchRequest = searchRouteBuilder.toSearchRequest(query, this.searchType)
    searchRequest.searchType = this.searchType
    searchRequest.properties = this.queryProperties
    searchService.search(searchRequest)
    // this.typedText = this.resultsSearchText = searchRequest.searchText
  }

  private mounted() {
    const query = this.$route.query
    if ('q' in query || 't' in query) {
      this.invokeSearchService(query)
    } else {
      this.$store.commit('clearResults')
    }
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any) {
    this.invokeSearchService(to.query)
  }
}

</script>


<style scoped>
.search {
  margin-top:.5em;
}
</style>
