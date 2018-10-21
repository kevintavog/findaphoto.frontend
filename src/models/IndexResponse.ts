export interface ElasticSearchIndexResponse {
    httpStatusCode: number,
    index: string,
    indexStatus: string,
    version: string,
}

export interface DependencyInfoIndexResponse {
    elasticSearch: ElasticSearchIndexResponse
}

export interface PathAndDateIndexResponse {
    path: string,
    lastIndexed?: Date,
}

export interface IndexResponse {
    dependencyInfo?: DependencyInfoIndexResponse,
    duplicateCount?: number,
    fields?: string[],
    paths?: PathAndDateIndexResponse[],
    imageCount?: number,
    versionNumber?: string,
    videoCount?: number,
    warningCount?: number,
}

export interface FieldAndCountIndexResponse {
    value: string
    count: number
}

export interface FieldNameAndValuesIndexResponse {
    name: string
    values: [FieldAndCountIndexResponse]
}

export interface FieldValuesIndexResponse {
    fields: FieldNameAndValuesIndexResponse[]
}

export interface SourceNameValueIndexResponse {
    name: string
    value: string
}

export interface MediaIndexResponse {
    sourceValues: SourceNameValueIndexResponse[]
}
