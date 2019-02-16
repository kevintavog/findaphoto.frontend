<template>
  <div class="searchbar c-input-group fp-horz-margins">
    <div class="o-field">        
      <input class="c-field" placeholder="Enter search text" type="text" autocapitalize="none" v-model="typedText" @keyup.enter="onSearch" ref='searchInput' autofocus >
    </div>
    <button class="c-button c-button--info" type="submit" @click="onSearch" > <font-awesome-icon icon="search"/> Search</button>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { SearchRequest } from '@/models/SearchRequest'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import { latLonConverter } from '@/providers/LatLonConverter'

@Component({})
export default class SearchBar extends Vue {
  @Prop({ required: true }) private page!: string
  @Prop({ required: true }) private searchType!: string
  @Prop({ required: true }) private queryProperties!: string

  private typedText: string = ''
  private resultsSearchText?: string = undefined

  constructor() {
    super()
  }

  private mounted(): void {
    (this.$refs.searchInput as HTMLElement).focus()
    this.setSearchTextFromQuery(this.$route.query)
  }

  private onSearch(): void {
    // Only update on a change
    if (!this.resultsSearchText || this.resultsSearchText !== this.typedText) {
      // Rather than search directly, update the URL, which will indirectly invoke onRouteChanged
      // This will add the search to the browser history
      const searchRequest = this.$store.state.serverRequest.request
      searchRequest.first = 1
      searchRequest.searchType = this.searchType
      searchRequest.searchText = this.typedText
      searchRequest.properties = this.queryProperties
      searchRequest.pageCount = SearchRequest.defaultItemsPerPage

      const latLon = latLonConverter.parse(searchRequest.searchText)
      if (latLon) {
        searchRequest.searchType = 'l'
        searchRequest.latitude = latLon.latitude
        searchRequest.longitude = latLon.longitude
      } else {
        searchRequest.searchType = 's'
        searchRequest.latitude = -1
        searchRequest.longitude = -1
      }

      this.resultsSearchText = this.typedText
      this.$router.push({ path: this.page!, query: searchRouteBuilder.toParameters(searchRequest) })
    }
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any): void {
    (this.$refs.searchInput as HTMLElement).focus()
    this.setSearchTextFromQuery(to.query)
  }

  private setSearchTextFromQuery(query: any): void {
    const searchRequest = searchRouteBuilder.toSearchRequest(query, 's')
    if (searchRequest.searchText.length > 0) {
      this.typedText = this.resultsSearchText = searchRequest.searchText
    }

  }
}

</script>

<style scoped>
.fp-horz-margins {
  padding-left: 1em;
  padding-right: 1em;
}
</style>
