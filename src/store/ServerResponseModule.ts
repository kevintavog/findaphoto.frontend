import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators'
import { SearchResults } from '@/models/SearchResults'
import { SearchRequest } from '@/models/SearchRequest'

@Module
export default class ServerResponseModule extends VuexModule {
    public isSearching: boolean = false
    public errorMessage?: string
    public results?: SearchResults
    public totalPages: number = 0
    public currentPage: number = 0

    get hasError() {
        return this.errorMessage !== undefined
    }

    @Mutation
    public startSearch() {
        this.isSearching = true
    }

    @Mutation
    public setServerError(message: string) {
        this.errorMessage = message
        this.results = undefined
        this.isSearching = false
    }

    @Mutation
    public setServerResults(data: [SearchResults, SearchRequest]) {
        this.errorMessage = undefined
        this.results = data[0]
        this.isSearching = false

        this.totalPages = Math.ceil(data[0].totalMatches / data[1].pageCount)
        this.currentPage = Math.round(1 + (data[1].first / data[1].pageCount))
    }
}
