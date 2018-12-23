import { SearchCategoryDetail } from '@/models/SearchResults'

export class SelectedCategory {
    public parent?: SelectedCategory
    public categoryDetail: SearchCategoryDetail = new SearchCategoryDetail()
    public selected: boolean = false
    public children: SelectedCategory[] = []

    constructor(categoryDetail: SearchCategoryDetail, parent?: SelectedCategory) {
        this.parent = parent
        this.categoryDetail = categoryDetail
    }
}
