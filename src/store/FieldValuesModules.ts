import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { FieldValuesIndexResponse, IndexResponse } from '@/models/IndexResponse'
import { FieldNameWithValues, QueryMultipleFields } from '@/models/FieldNameWithValues'
import { searchService } from '@/services/SearchService'
import store from '@/store/store'


@Module
export default class FieldValuesModule extends VuexModule {
    public allFields: string[] = []
    public fieldAndValues: FieldNameWithValues = { name: '', values: undefined }
    public multipleFieldAndValues: FieldValuesIndexResponse = { fields: []}

    private initialized = false

    @Mutation
    public getFieldValues(fieldName: string) {
        this.fieldAndValues.name = ''
        this.fieldAndValues.values = undefined

        searchService.indexFieldValues(
            [fieldName],
            (results?: FieldValuesIndexResponse) => {
                if (results) {
                    let fieldValues: string[] = []
                    for (const f of results!.fields) {
                        if (f.name === fieldName) {
                            fieldValues = f.values.map( (fc) => fc.value )
                        }
                    }
                    const fv = { name: fieldName, values: fieldValues }
                    store.commit('setFieldValues', fv)
                }
            })
    }

    @Mutation
    public getMultipleFieldValues(query: QueryMultipleFields) {
        this.multipleFieldAndValues.fields = []
        searchService.indexFieldValues(
            query.fieldNames,
            (results?: FieldValuesIndexResponse) => {
                if (results) {
                    store.commit('setMultipleFieldValues', results)
                }
            },
            query.request,
            query.maxCount)
    }

    @Mutation
    public initializeFieldValues() {
        if (this.initialized) {
            return
        }

        searchService.indexStats('fields', (results?: IndexResponse) => {
            if (results) {
                this.allFields = results!.fields!
                this.initialized = true
            }
        })
    }

    @Mutation
    private setFieldValues(fv: FieldNameWithValues) {
        this.fieldAndValues = fv
    }

    @Mutation
    private setMultipleFieldValues(fv: FieldValuesIndexResponse) {
        this.multipleFieldAndValues = fv
    }
}
