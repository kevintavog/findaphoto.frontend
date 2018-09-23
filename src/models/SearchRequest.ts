
export class SearchRequest {
    public static defaultItemsPerPage: number = 50

    public searchType: string = ''

    public properties: string = ''
    public first: number = 1
    public pageCount: number = SearchRequest.defaultItemsPerPage

    // A text search, the most common search
    public searchText: string = ''

    // A by date search
    public month: number = -1
    public day: number = -1

    // A nearby search
    public latitude: number = -1
    public longitude: number = -1
    public maxKilometers: number = -1

    public drilldown: string = ''
}
