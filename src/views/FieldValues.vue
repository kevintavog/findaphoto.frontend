<template>
   <div class="field-values">
    <SearchBar page="field-values" :search-type="searchType" :query-properties="queryProperties" />

    <section class="hero is-primary has-background-grey-darker field-values-container">
      <h1 class="title">Field values {{currentSearch}}
      </h1>
      <h2 class="subtitle"> There are {{searchResults.totalMatches}} matching items.
      </h2>

      <b-collapse class="card field-value-item" v-for="nv in namesAndValues" :key="nv.fieldName" :open="false" >
        <div slot="trigger" slot-scope="props" class="card-header" >
          <span class="card-header-title field-value-title">
            {{nv.readableName}} 
            <b-tag class="is-rounded is-medium field-unique-count">{{nv.values.length}} </b-tag>
          </span>
          <a class="card-header-icon">
            <b-icon :icon="props.open ? 'caret-down' : 'caret-up'" />
          </a>
        </div>

        <div class="card-content">
          <b-taglist class="field-value-list">
            <b-tag v-for="v in nv.values" :key="v.value" class="is-medium field-value-info" >
              {{v.value}} 
              <b-tag class="is-rounded is-medium field-value-count"> {{v.count}} </b-tag>
            </b-tag>
          </b-taglist>
        </div>

      </b-collapse>

    </section>

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
  private static readableFieldNamesMap = {
    aperture: 'Aperture',
    cameramake: 'Camera Make',
    cameramodel: 'Camera Model',
    cityname: 'City',
    countryname: 'Country',
    displayname: 'Display name',
    durationseconds: 'Duration seconds',
    exposureprogram: 'Exposure program',
    exposuretimestring: 'Exposure time',
    fnumber: 'F number',
    focallengthmm: 'Focal length',
    hierarchicalname: 'Hierarchical name',
    iso: 'ISO',
    keywords: 'Keywords',
    lensinfo: 'Lens info',
    lensmodel: 'Lens model',
    placename: 'Place name',
    sitename: 'Site name',
    statename: 'State name',
    tags: 'Tags',
  }
  private maxFieldValueCount = 600
  private searchType = 's'
  private queryProperties: string = 'id'
  private currentSearch = ''
  private namesAndValues: NamesAndValues[] = []
  private fieldNames = ['aperture', 'cameramake', 'cameramodel', 'cityname', 'countryname', 'displayname',
    'durationseconds', 'exposureprogram', 'exposuretimestring', 'fnumber', 'focallengthmm', 'hierarchicalname',
    'iso', 'keywords', 'lensinfo', 'lensmodel', 'placename', 'sitename', 'statename', 'tags']


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
          values: vAndc,
        })
      }
    }
    this.namesAndValues = updated
  }

  private getReadableFieldName(fieldName: string): string {
    for (const [key, value] of Object.entries(FieldValues.readableFieldNamesMap)) {
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
  margin-top: 1em;
  padding-left: 0.5em;
  padding-top: 0.5em;
}

.field-panel {
  clear: both;
  margin-left: 1em;
  margin-bottom: 0.2em;
  cursor: pointer;
}

.field-unique-count {
  margin-left: 0.5em;
  background-color: #585858;
  color: white;
}

.field-value-title {
  color: white;
}

.field-value-item {
  justify-content: inherit;
  background-color: #404040;
  color: white;
  padding-left: 0.3em;
}

.field-value-info {
  background: hsl(207, 77%, 45%);
  color: white;
  padding-top: 1.6em;
  padding-bottom: 1.2em;
}

.field-value-count {
  background: #000058;
  color: white;
  margin-left: 10px;
}
</style>
