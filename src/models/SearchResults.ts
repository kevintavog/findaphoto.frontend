export interface SearchResults {
    totalMatches: number
    resultCount: number
    groups: SearchGroup[]
    categories: SearchCategory[]
    previousAvailableByDay?: ByDayResult
    nextAvailableByDay?: ByDayResult
}

export interface ByDayResult {
    month: number
    day: number
}

export interface SearchGroup {
    name: string
    items: SearchItem[]
    resultIndex: number
    locations: GroupCountryLocation[]
}

export interface SearchItem {
    city: string
    createdDate: Date
    height: number,
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
    tags: string[]
    width: number,
}

export interface GroupCountryLocation {
    country: string
    count: number
    states: GroupStateLocation[]
}

export interface GroupStateLocation {
    state: string
    count: number
    cities: GroupCityLocation[]
}

export interface GroupCityLocation {
    city: string
    count: number
    sites: GroupSiteLocation[]
}

export interface GroupSiteLocation {
    site: string
    count: number
}

export const emptySearchItem: SearchItem = {
    city: '',
    createdDate: new Date(),
    height: 0,
    id: '',
    imageName: '',
    keywords: [],
    latitude: 0,
    locationName: '',
    locationDisplayName: '',
    longitude: 0,
    mediaType: '',
    mediaUrl: '',
    mimeType: '',
    path: '',
    slideUrl: '',
    thumbUrl: '',
    warnings: [],
    distanceKm: 0,
    tags: [],
    width: 0,
} as SearchItem


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
