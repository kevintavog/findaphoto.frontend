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

  public searchByText(searchText: string, properties: string, first: number, pageCount: number, drilldown: string) {
    const searchRequest = store.state.serverRequest.request
    searchRequest.searchType = 's'
    searchRequest.properties = properties
    searchRequest.first = first
    searchRequest.pageCount = pageCount
    searchRequest.searchText = searchText
    searchRequest.drilldown = drilldown

    this.search(searchRequest)
  }

  public search(request: SearchRequest) {
    let url = '/api/search?q=' + request.searchText + '&first=' + request.first + '&count='
        + request.pageCount + '&properties='
        + request.properties + '&categories=keywords,tags,placename,date'
    if (request.drilldown !== undefined && request.drilldown.length > 0) {
        url += '&drilldown=' + request.drilldown
    }

    store.commit('startSearch')
    store.commit('updateRequest', request)
    axios.get(url)
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
}

export const searchService = new SearchService()
