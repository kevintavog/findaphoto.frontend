import { Module, VuexModule, Mutation, MutationAction } from 'vuex-module-decorators'
import { FieldValuesIndexResponse, IndexResponse } from '@/models/IndexResponse'
import { FieldNameWithValues } from '@/models/FieldNameWithValues'
import { searchService } from '@/services/SearchService'
import store from '@/store/store'


@Module
export default class FieldValuesModule extends VuexModule {
    public allFields: string[] = []
    public fieldAndValues?: FieldNameWithValues

    private initialized = false

    @Mutation
    public getFieldValues(fieldName: string) {
        this.fieldAndValues = undefined

        searchService.indexFieldValues(
            [fieldName],
            (results?: FieldValuesIndexResponse) => {
                if (results) {
                    let fieldValues: string[] = []
                    for (const fv of results!.fields) {
                        if (fv.name === fieldName) {
                            fieldValues = fv.values.map( (fc) => fc.value )
                        }
                    }
                    const fv = { name: fieldName, values: fieldValues }
                    store.commit('setFieldValues', fv)
                }
            })
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
}
