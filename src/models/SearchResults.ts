export interface SearchResults {
    totalMatches: number
    resultCount: number
    groups: SearchGroup[]
    categories: SearchCategory[]
    previousAvailableByDay: ByDayResult
    nextAvailableByDay: ByDayResult
}

export interface ByDayResult {
    month: number
    day: number
}

export interface SearchGroup {
    name: string
    items: SearchItem[]
    resultIndex: number
}

export interface SearchItem {
    city: string
    createdDate: Date
    id: string
    imageName: string
    keywords: string[]
    latitude: number
    locationName: string
    locationDisplayName: string
    longitude: number
    mediaType: string
    mediaUrl: string
    mimeType: string
    path: string
    slideUrl: string
    thumbUrl: string
    warnings: string[]
    distanceKm: number
}

export interface SearchCategory {
    field: string
    details: SearchCategoryDetail[]
}

export class SearchCategoryDetail {
    public count: number = 0
    public value: string = ''
    public field: string = ''
    public details: SearchCategoryDetail[] = []
}

export interface FieldValue {
    name: string
    values: [FieldAndCount]
}

export interface FieldAndCount {
    value: string
    count: number
}

export interface FindAPhotoErrorResponse {
    errorCode: string
    errorMessage: string
}
