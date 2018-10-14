import {Module, VuexModule, Mutation, Action} from 'vuex-module-decorators'
import { SearchResults } from '@/models/SearchResults'
import { SearchRequest } from '@/models/SearchRequest'
import store from '@/store/store'

@Module
export default class ServerResponseModule extends VuexModule {
    public isSearching: boolean = false
    public results?: SearchResults
    public totalPages: number = 0
    public currentPage: number = 0


    @Mutation
    public startSearch() {
        this.isSearching = true
    }

    @Mutation
    public setServerError(message: string) {
        store.commit('addErrorMessage', message)

        this.results = undefined
        this.totalPages = 0
        this.currentPage = 0
        this.isSearching = false
    }

    @Mutation
    public clearResults() {
        store.commit('clearErrorMessages')
        this.results = undefined
    }

    @Mutation
    public setServerResults(data: [SearchResults, SearchRequest]) {
        store.commit('clearErrorMessages')
        this.results = data[0]

        this.totalPages = Math.ceil(data[0].totalMatches / data[1].pageCount)
        this.currentPage = Math.round(1 + (data[1].first / data[1].pageCount))
        this.isSearching = false
    }
}
