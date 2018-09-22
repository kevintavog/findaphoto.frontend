import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { SearchRequest } from '@/models/SearchRequest'

@Module
export default class ServerRequestModule extends VuexModule {
    public static defaultItemsPerPage: number = 50

    public request: SearchRequest = new SearchRequest()

    @Mutation
    public updateRequest(searchRequest: SearchRequest) {
        this.request = searchRequest
    }
}
