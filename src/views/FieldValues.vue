<template>
   <div class="field-values">
    <SearchBar page="field-values" :search-type="searchType" :query-properties="queryProperties" />

    <div class="field-values-container">
      <h1>Field values {{currentSearch}}
      </h1>
      There are {{searchResults.totalMatches}} matching items.

      <div v-for="nv in namesAndValues" :key="nv.fieldName">
        <h3 v-if="nv.showValues" class="field-panel" @click="toggleShowValues(nv)" >
          <div> 
            {{nv.readableName + '  (' + nv.values.length + ')'}}
            <font-awesome-icon icon="caret-down"/>
          </div>
          <div v-for="v in nv.values" :key="v.value" class="field-value-info" >
            {{v.value}} ({{v.count}})
          </div>
        </h3>

        <h3 v-else class="field-panel" @click="toggleShowValues(nv)" >
          <div> 
            {{nv.readableName + '  (' + nv.values.length + ')'}}
            <font-awesome-icon icon="caret-right"/>
          </div>
        </h3>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import SearchBar from '@/components/SearchBar.vue'
import { searchService } from '@/services/SearchService'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import { FieldNameAndValuesIndexResponse } from '@/models/IndexResponse'

interface ValueAndCount {
  value: string,
  count: number,
}

interface NamesAndValues {
  fieldName: string,
  readableName: string,
  showValues: boolean,
  values: ValueAndCount[]
}

@Component({
  components: {
    SearchBar,
  },
  metaInfo() {
    return {
      title: 'Field values',
    }
  },
})
export default class FieldValues extends Vue {
  private maxFieldValueCount = 600
  private searchType = 's'
  private queryProperties: string = 'id'
  private currentSearch = ''
  private namesAndValues: NamesAndValues[] = []
  private fieldNames = ['aperture', 'cameramake', 'cameramodel', 'cityname', 'countryname', 'displayname',
    'durationseconds', 'exposuretimestring', 'focallengthmm', 'hierarchicalname',
    'iso', 'keywords', 'lensmodel', 'placename', 'sitename', 'statename', 'tags']

  private static readableFieldNamesMap = {
    'aperture': 'Aperture',
    'cameramake': 'Camera Make',
    'cameramodel': 'Camera Model',
    'cityname': 'City',
    'countryname': 'Country',
    'displayname': 'Display name',
    'durationseconds': 'Duration seconds',
    'exposuretimestring': 'Exposure time',
    'focallengthmm': 'Focal length',
    'hierarchicalname': 'Hierarchical name',
    'iso': 'ISO',
    'keywords': 'Keywords',
    'lensmodel': 'Lens model',
    'placename': 'Place name',
    'sitename': 'Site name',
    'statename': 'State name',
    'tags': 'Tags',
  }


  private invokeSearchService(query: any): void {
    const searchRequest = searchRouteBuilder.toSearchRequest(query, this.searchType)
    searchRequest.first = 1
    searchRequest.pageCount = 1
    this.currentSearch = ' ' + searchRouteBuilder.toReadableString(searchRequest)
    searchService.search(searchRequest)
    this.$store.commit('getMultipleFieldValues', {
      fieldNames: this.fieldNames,
      request: searchRequest,
      maxCount: this.maxFieldValueCount,
    })
  }

  private toggleShowValues(namesAndValues: NamesAndValues) {
    namesAndValues.showValues = !namesAndValues.showValues
  }

  private mounted() {
    this.invokeSearchService(this.$route.query)
  }

  private get searchResults() {
    return this.$store.state.serverResponse.results
  }

  private get results() {
    return this.$store.state.fieldValues.multipleFieldAndValues
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any) {
    this.invokeSearchService(to.query)
  }

  @Watch('results')
  private onResultsChanged(to: any, from: any) {
    const updated: NamesAndValues[] = []
    if (to.fields) {
      for (const f of to.fields) {
        const field = f as FieldNameAndValuesIndexResponse
        const vAndc: ValueAndCount[] = []
        for (const v of field.values) {
          vAndc.push({ value: v.value, count: v.count })
        }
        updated.push({
          fieldName: field.name,
          readableName: this.getReadableFieldName(field.name),
          showValues: false,
          values: vAndc
        })
      }
    }
    this.namesAndValues = updated
  }

  private getReadableFieldName(fieldName: string): string {
    for (let [key, value] of Object.entries(FieldValues.readableFieldNamesMap)) {
      if (key === fieldName) {
        return value
      }
    }
    return fieldName
  }
}

</script>


<style scoped>
.field-values {
  margin-top: 1em;
  text-align: left;
}

.field-values-container {
  margin-left: 1em;
}

.field-panel {
  clear: both;
  margin-left: 1em;
  margin-bottom: 0.2em;
  cursor: pointer;
}

.field-value-info {
  background: #484848;
  float: left;
  margin-bottom: 10px;
  margin-right: 10px;
  padding: 10px 10px 10px 10px;
  cursor: auto;
}
</style>
