import { SearchResults } from '@/models/SearchResults'

export default class ServerResponse {
    public errorMessage?: string
    public results?: SearchResults
}
