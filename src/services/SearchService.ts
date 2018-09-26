import axios from 'axios'
import { FindAPhotoErrorResponse, SearchResults } from '@/models/SearchResults'
import store from '@/store/store'
import { SearchRequest } from '@/models/SearchRequest'

class SearchService {

  // Goto the 1-based page number
  public gotoPage(pageNumber: number) {
    if (!store.state.serverRequest.request) {
      return
    }
    if (pageNumber < 1 || pageNumber > store.state.serverResponse.totalPages) {
      return
    }

    const searchRequest = store.state.serverRequest.request
    searchRequest.first = 1 + ((pageNumber - 1) * searchRequest.pageCount)
    this.search(searchRequest)
  }

  public search(request: SearchRequest) {
    store.commit('startSearch')
    store.commit('updateRequest', request)
    axios.get(this.buildUrl(request))
      .then((response) => {
        const results = response.data as SearchResults
        store.commit('setServerResults', [results, request ])
      })
      .catch((error) => {
        let message = error.toString()
        if (error.response != null && error.response.data != null) {
          const jsonError = error.response.data as FindAPhotoErrorResponse
          message = jsonError.errorCode + ': ' + jsonError.errorMessage
        }
        store.commit('setServerError', message)
      })
  }

  private buildUrl(request: SearchRequest) {
    switch (request.searchType) {
      case 's':
        let surl = '/api/search?q=' + request.searchText + '&first=' + request.first + '&count='
          + request.pageCount + '&properties='
          + request.properties + '&categories=keywords,tags,placename,date'
        if (request.drilldown !== undefined && request.drilldown.length > 0) {
          surl += '&drilldown=' + request.drilldown
        }
        return surl

      case 'd':
        let durl = '/api/by-day?month=' + request.month + '&day=' + request.day + '&first='
          + request.first + '&count=' + request.pageCount + '&properties='
          + request.properties + '&categories=keywords,tags,placename,year'
        if (request.drilldown !== undefined && request.drilldown.length > 0) {
          durl += '&drilldown=' + request.drilldown
        }
        return durl
    }

    throw new Error('Unhandled searchType: ' + request.searchType)
  }
}

export const searchService = new SearchService()
