import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators'
import { SearchResults } from '@/models/SearchResults'
import { SearchRequest } from '@/models/SearchRequest'
import store from '@/store/store'

@Module
export default class ServerResponseModule extends VuexModule {
    private static emptyResults: SearchResults = {
        totalMatches: 0,
        resultCount: 0,
        groups: [],
        categories: [],
        previousAvailableByDay: undefined,
        nextAvailableByDay: undefined,
    }

    public isSearching: boolean = false
    public hasResults = false
    public results: SearchResults = ServerResponseModule.emptyResults
    public totalPages: number = 0
    public currentPage: number = 0



    @Mutation
    public startSearch() {
        this.isSearching = true
    }

    @Mutation
    public setServerError(message: string) {
        store.commit('addErrorMessage', message)

        this.results = ServerResponseModule.emptyResults
        this.hasResults = false
        this.totalPages = 0
        this.currentPage = 0
        this.isSearching = false
    }

    @Mutation
    public clearResults() {
        store.commit('clearErrorMessages')
        this.results = ServerResponseModule.emptyResults
        this.hasResults = false
    }

    @Mutation
    public setServerResults(data: [SearchResults, SearchRequest]) {
        store.commit('clearErrorMessages')
        this.results = data[0]
        this.hasResults = true

        this.totalPages = Math.ceil(data[0].totalMatches / data[1].pageCount)
        this.currentPage = Math.round(1 + (data[1].first / data[1].pageCount))
        this.isSearching = false
    }
}
