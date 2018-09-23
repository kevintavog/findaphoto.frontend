import { SearchRequest } from '@/models/SearchRequest'
import store from '@/store/store'

export class SearchRouteBuilder {

    public toSearchRequest(properties: any) {
        return this.toSearchRequestFromProperties(properties as { [k: string]: string })
    }

    public toSearchRequestFromProperties(properties: { [k: string]: string }) {
        const searchRequest = new SearchRequest()
        searchRequest.searchType = 's'
        searchRequest.first = 1
        searchRequest.pageCount = store.state.serverRequest.request.pageCount
        searchRequest.properties = store.state.serverRequest.request.properties

        if ('q' in properties) {
            searchRequest.searchText = properties.q
        }

        if ('p' in properties) {
            searchRequest.first = 1 + (searchRequest.pageCount * (Number(properties.p) - 1))
        }

        return searchRequest
    }

    public toParameters(searchRequest: SearchRequest) {
        const properties: { [k: string]: string } = {}
        if (searchRequest == null) {
            return properties
        }

        properties.t = searchRequest.searchType
        if (searchRequest.first > 1) {
            properties.p = Math.floor(1 + (searchRequest.first / searchRequest.pageCount)).toString()
        }
        switch (searchRequest.searchType) {
            case 's':
                properties.q = searchRequest.searchText
                break
            case 'd':
                properties.m = searchRequest.month.toString()
                properties.d = searchRequest.day.toString()
                break
            case 'l':
                properties.lat = searchRequest.latitude.toString()
                properties.lon = searchRequest.longitude.toString()
                break
            default:
                throw new Error('Unknown search type: ' + searchRequest.searchType)
        }

        if (searchRequest.drilldown && searchRequest.drilldown.length > 0) {
            properties.drilldown = searchRequest.drilldown
        }

        return properties
    }

}

export const searchRouteBuilder = new SearchRouteBuilder()
