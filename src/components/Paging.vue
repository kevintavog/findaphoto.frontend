<template>
  <div class="paging o-container o-container--medium" v-if="serverResponse.results && totalPages > 0">
    <nav class="c-pagination">

      <button class="c-pagination__control enabled_color" @click="firstPage()" v-if="currentPage > 1" > <font-awesome-icon icon="fast-backward"/> </button>
      <button class="c-pagination__control enabled_color" @click="gotoPage(currentPage - 1)" v-if="currentPage > 1" > <font-awesome-icon icon="caret-left"/> </button>
      <button class="c-pagination__control" disabled="true" v-if="currentPage <= 1" > <font-awesome-icon icon="fast-backward"/> </button>
      <button class="c-pagination__control" disabled="true" v-if="currentPage <= 1" > <font-awesome-icon icon="caret-left"/> </button>

      <div class="c-pagination__pages">
        <button class="c-pagination__control enabled_color" v-if="currentPage > 3" @click="gotoPage(currentPage - 3)" >{{currentPage - 3}}</button>
        <button class="c-pagination__control enabled_color" v-if="currentPage > 2" @click="gotoPage(currentPage - 2)" >{{currentPage - 2}}</button>
        <button class="c-pagination__control enabled_color" v-if="currentPage > 1" @click="gotoPage(currentPage - 1)" >{{currentPage - 1}}</button>
        <button class="c-pagination__control enabled_color" aria-current="page">{{currentPage}} </button>
        <button class="c-pagination__control enabled_color" v-if="currentPage < totalPages" @click="gotoPage(currentPage + 1)" >{{currentPage + 1}}</button>
        <button class="c-pagination__control enabled_color" v-if="currentPage < totalPages - 1" @click="gotoPage(currentPage + 2)" >{{currentPage + 2}}</button>
        <button class="c-pagination__control enabled_color" v-if="currentPage < totalPages - 2" @click="gotoPage(currentPage + 3)" >{{currentPage + 3}}</button>
      </div>

      <button class="c-pagination__control enabled_color" @click="gotoPage(currentPage + 1)" v-if="currentPage < totalPages" > <font-awesome-icon icon="caret-right"/> </button>
      <button class="c-pagination__control enabled_color" @click="lastPage()" v-if="currentPage < totalPages" > <font-awesome-icon icon="fast-forward"/> </button>
      <button class="c-pagination__control" disabled="true" v-if="currentPage >= totalPages" > <font-awesome-icon icon="caret-right"/> </button>
      <button class="c-pagination__control" disabled="true" v-if="currentPage >= totalPages" > <font-awesome-icon icon="fast-forward"/> </button>
    </nav>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { SearchResults } from '@/models/SearchResults'
import ServerResponseModule from '@/store/ServerResponseModule'
import { searchService } from '@/services/SearchService'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'


@Component
export default class Paging extends Vue {
  get currentPage(): number {
    return this.serverResponse.currentPage
  }
  get totalPages(): number {
    return this.serverResponse.totalPages
  }


  private firstPage() {
    if (this.currentPage > 0) {
      this.gotoPage(1)
    }
  }

  private lastPage() {
    if (this.currentPage < this.totalPages) {
      this.gotoPage(this.totalPages)
    }
  }

  private gotoPage(pageNumber: number) {
    const searchRequest = this.$store.state.serverRequest.request
    searchRequest.first = 1 + ((pageNumber - 1) * searchRequest.pageCount)

    let page = 'search'
    switch (searchRequest.searchType) {
      case 's':
        page = 'search'
        break
      case 'd':
        page = 'byday'
        break
      default:
        throw new Error('Unhandled searchType: ' + searchRequest.searchType)
    }

    this.$router.push({ path: page, query: searchRouteBuilder.toParameters(searchRequest) })
  }

  private get serverResponse(): ServerResponseModule {
    return this.$store.state.serverResponse
  }

}
</script>

<style scoped>
.enabled_color {
  color: white;
}
</style>
