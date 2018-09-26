<template>
  <div class="byday">
    <SearchResultsList />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { searchService } from '@/services/SearchService'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import SearchResultsList from '@/components/SearchResultsList.vue'

@Component({
  components: {
    SearchResultsList,
  },
})
export default class ByDay extends Vue {
  private searchType = 'd'
  private queryProperties: string = 'id,city,keywords,imageName,createdDate,latitude,longitude' +
    ',thumbUrl,slideUrl,warnings'


  private invokeSearchService(query: any): void {
      const searchRequest = searchRouteBuilder.toSearchRequest(query, this.searchType)
      searchRequest.searchType = this.searchType
      searchRequest.properties = this.queryProperties
      searchService.search(searchRequest)
  }

  private mounted() {
    this.invokeSearchService(this.$route.query)
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any) {
    console.log('route changed - byday')
    this.invokeSearchService(to.query)
  }
}

</script>
