import { SearchRequest } from '@/models/SearchRequest'
import store from '@/store/store'

export class SearchRouteBuilder {

    public toSearchRequest(properties: any, defaultSearchType?: string) {
        return this.toSearchRequestFromProperties(properties as { [k: string]: string }, defaultSearchType)
    }

    public toSearchRequestFromProperties(properties: { [k: string]: string }, defaultSearchType?: string) {
        const searchRequest = new SearchRequest()
        searchRequest.searchType = defaultSearchType !== undefined ? defaultSearchType : 's'
        searchRequest.first = 1
        searchRequest.pageCount = store.state.serverRequest.request.pageCount
        searchRequest.properties = store.state.serverRequest.request.properties

        if ('t' in properties) {
            searchRequest.searchType = properties.t
        }

        if ('q' in properties) {
            searchRequest.searchText = properties.q
        }

        if ('p' in properties) {
            searchRequest.first = 1 + (searchRequest.pageCount * (Number(properties.p) - 1))
        }

        if (searchRequest.searchType === 'd') {
            // Bydate search defaults to today
            const today = new Date()
            searchRequest.month = today.getMonth() + 1
            searchRequest.day = today.getDate()
            if ('m' in properties) {
                searchRequest.month = +properties.m
            }
            if ('d' in properties) {
                searchRequest.day = +properties.d
            }
        } else if (searchRequest.searchType === 'l') {
            if ('lat' in properties && 'lon' in properties) {
                searchRequest.latitude = +properties.lat
                searchRequest.longitude = +properties.lon
            }
            if ('maxKm' in properties) {
                searchRequest.maxKilometers = +properties.maxKm
            }
            if (searchRequest.maxKilometers <= 0) {
                searchRequest.maxKilometers = 6
            }
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
                properties.maxKm = searchRequest.maxKilometers.toString()
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
