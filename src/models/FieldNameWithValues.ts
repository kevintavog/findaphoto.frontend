export interface FieldNameWithValues {
    name: string
    values?: string[]
}

export interface QueryMultipleFields {
    fieldNames: string[]
    searchText?: string
    maxCount?: number
}
