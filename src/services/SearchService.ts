import axios from 'axios'
import { FindAPhotoErrorResponse, SearchResults } from '@/models/SearchResults'
import { FieldValuesIndexResponse, IndexResponse } from '@/models/IndexResponse'
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

  public searchCallback(request: SearchRequest, callback: (response?: SearchResults, errorMessage?: string) => void) {
    axios.get(this.buildUrl(request))
      .then((response) => {
        const results = response.data as SearchResults
        callback(results, undefined)
      })
      .catch((error) => {
        callback(undefined, this.getErrorMessage(error))
      })
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
        store.commit('setServerError', this.getErrorMessage(error))
      })
  }

  public indexStats(properties: string, callback: (response?: IndexResponse) => void) {
    axios.get('/api/index?properties=' + properties)
      .then((response) => {
        callback(response.data as IndexResponse)
      })
      .catch((error) => {
        store.commit('setServerError', this.getErrorMessage(error))
        callback(undefined)
      })
  }

  public indexFieldValues(
      fieldNames: string[],
      callback: (response?: FieldValuesIndexResponse) => void,
      query?: string,
      maxCount?: number) {

    let url = '/api/index/fieldvalues?fields=' + fieldNames.join(',')
    if (maxCount) {
      url += '&max=' + maxCount
    }
    if (query && query.length > 0) {
      url += '&q=' + query;
    }

    axios.get(url)
      .then((response) => {
        callback(response.data as FieldValuesIndexResponse)
      })
      .catch((error) => {
        store.commit('setServerError', this.getErrorMessage(error))
        callback(undefined)
      })
  }

  private getErrorMessage(error: any) {
    let message = error.toString()
    if (error.response != null && error.response.data != null) {
      const jsonError = error.response.data as FindAPhotoErrorResponse
      message = jsonError.errorCode + ': ' + jsonError.errorMessage
    }
    return message
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

      case 'l':
        let lurl = '/api/nearby?lat=' + request.latitude + '&lon=' + request.longitude + '&first='
          + request.first + '&count=' + request.pageCount + '&properties='
          + request.properties + '&categories=keywords,tags,date'
        if (request.maxKilometers > 0) {
          lurl += '&maxKilometers=' + request.maxKilometers
        }
        if (request.drilldown !== undefined && request.drilldown.length > 0) {
          lurl += '&drilldown=' + request.drilldown
        }
        return lurl
    }

    throw new Error('Unhandled searchType: ' + request.searchType)
  }
}

export const searchService = new SearchService()
