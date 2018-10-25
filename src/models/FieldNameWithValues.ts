import { SearchRequest } from '@/models/SearchRequest'

export interface FieldNameWithValues {
    name: string
    values?: string[]
}

export interface QueryMultipleFields {
    fieldNames: string[]
    request?: SearchRequest
    maxCount?: number
}
