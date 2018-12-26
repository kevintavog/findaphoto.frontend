<template>
  <div>
    <b-collapse class="top-level-filter" :open="false">
      <button class="button is-info" slot="trigger">
        <span class="filter-text">Filter</span>
        <b-icon icon="sliders-h"></b-icon>
      </button>
      <div class="notification filter-notification">
        <div class="columns content">
          <FilterGroup class="column is-narrow" v-if="keywords" :categories="keywordCategories" caption="Keywords" />
          <FilterGroup class="column is-narrow" v-if="tags" :categories="tagCategories" caption="Tags" />
          <FilterGroup class="column is-narrow" v-if="dates" :categories="dateCategories" caption="Dates" :isHierarchical="true" />
          <FilterGroup class="column is-narrow" v-if="locations" :categories="locationCategories" caption="Locations" :isHierarchical="true" />
        </div>
        <button class="button is-info" @click="applyFilter()">
          <span>Apply Filter</span>
          </button>
      </div>
    </b-collapse>

    <div class="is-pulled-left" v-if="hasTags">
      <span class="tag-list" >
        <span class="clear-filters" @click="clearFilters()">
          Clear filters
        </span>
      </span>
      <span class="tag-list" v-if="selectedKeywords.length > 0">
        <b-tag v-for="t in selectedKeywords" :key="t.categoryDetail.value" class="keyword-tag" closable @close="deselectCategory(t)">
          {{t.categoryDetail.value}}
        </b-tag>
      </span>
      <span class="tag-list" v-if="selectedTags.length > 0">
        <b-tag v-for="t in selectedTags" :key="t.categoryDetail.value" class="tag-tag"  closable @close="deselectCategory(t)" >
          {{t.categoryDetail.value}}
        </b-tag>
      </span>
      <span class="tag-list" v-if="selectedLocations.length > 0">
        <b-tag v-for="t in selectedLocations" :key="formatLocationTag(t)" class="location-tag" closable @close="deselectHierarchicalCategory(t)" >
          {{formatLocationTag(t)}}
        </b-tag>
      </span>
      <span class="tag-list" v-if="selectedDates.length > 0">
        <b-tag v-for="t in selectedDates" :key="formatDateTag(t)" class="date-tag" closable @close="deselectHierarchicalCategory(t)" >
          {{formatDateTag(t)}}
        </b-tag>
      </span>

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { SearchCategory, SearchCategoryDetail, SearchResults } from '@/models/SearchResults'
import { SelectedCategory } from '@/models/SelectedCategory'
import { SearchRequest } from '@/models/SearchRequest'
import FilterGroup from '@/components/FilterGroup.vue'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import { latLonConverter } from '@/providers/LatLonConverter'

@Component({
  components: {
    FilterGroup,
  },
})
export default class ResultsFilter extends Vue {
  private keywordCategories: SelectedCategory[] = []
  private tagCategories: SelectedCategory[] = []
  private dateCategories: SelectedCategory[] = []
  private locationCategories: SelectedCategory[] = []

  private selectedKeywords: SelectedCategory[] = []
  private selectedTags: SelectedCategory[] = []
  private selectedDates: SelectedCategory[][] = []
  private selectedLocations: SelectedCategory[][] = []

  private get hasTags(): boolean {
    return this.selectedKeywords.length > 0 ||
      this.selectedTags.length > 0 ||
      this.selectedDates.length > 0 ||
      this.selectedLocations.length > 0
  }


  private mounted() {
    if (this.keywords) {
      this.keywordCategories = this.buildSelections(this.keywords.details)
    }
    if (this.tags) {
      this.tagCategories = this.buildSelections(this.tags.details)
    }
    if (this.dates) {
      this.dateCategories = this.buildSelections(this.dates.details)
    }
    if (this.locations) {
      this.locationCategories = this.buildSelections(this.locations.details)
    }

    this.parseDrilldown()
  }

  private clearFilters() {
    this.selectedKeywords.forEach( (sc) => sc.selected = false )
    this.selectedTags.forEach( (sc) => sc.selected = false )
    this.selectedDates.forEach( (scList) => scList.forEach( (sc) => sc.selected = false) )
    this.selectedLocations.forEach( (scList) => scList.forEach( (sc) => sc.selected = false) )
    this.applyFilter()
  }

  private deselectCategory(sc: SelectedCategory) {
    sc.selected = false
    this.applyFilter()
  }

  private deselectHierarchicalCategory(scList: SelectedCategory[]) {
    const sc = scList[scList.length - 1]
    sc.selected = false
    this.applyFilter()
  }

  private formatLocationTag(path: SelectedCategory[]): string {
    const asString = path.map( (p) => p.categoryDetail.value)
    return asString.reverse().join(', ')
  }

  private formatDateTag(path: SelectedCategory[]): string {
    const asString = path.map( (p) => p.categoryDetail.value)
    return asString.join('-')
  }

  // Set the selected categories from the drilldown string. There are two formats, basically:
  //  1) keywords/tags: <category name>:val1,val2
  //  2) heirarchecal (dates, locations): <parent name>~<child name>:<parent value>~<child value>
  // These are separated by '_'.
  //      Example: countryName~stateName~cityName:Canada~British Columbia~Vancouver_keywords:soccer,flower
  private parseDrilldown() {
    const searchRequest = this.$store.state.serverRequest.request
    if (!searchRequest.drilldown || searchRequest.drilldown.length < 1) {
      return
    }

    const selected = new Map<string, string[]>()
    for (const keyAndValue of searchRequest.drilldown.split('_')) {
      const tokens = keyAndValue.split(':')
      if (tokens.length !== 2) {
        this.$store.commit('addErrorMessage', `Ignoring unexpected drilldown values: ${keyAndValue}`)
      } else {
        const categoryName = tokens[0]
        for (const value of tokens[1].split(',')) {
          if (!selected.has(categoryName)) {
            selected.set(categoryName, [])
          }
          selected.get(categoryName)!.push(value)
        }
      }
    }

    for (const [key, value] of selected.entries()) {
      const firstToken = key.split('~')[0]
      switch (firstToken) {
        case 'keywords':
          this.selectFlatCategories(this.keywordCategories, value, this.selectedKeywords)
          break
        case 'tags':
          this.selectFlatCategories(this.tagCategories, value, this.selectedTags)
          break
        case 'countryName':
          this.selectHierarchicalCategory(this.locationCategories, value, this.selectedLocations)
          break
        case 'dateYear':
          this.selectHierarchicalCategory(this.dateCategories, value, this.selectedDates)
          break
        default:
          this.$store.commit('addErrorMessage', `Unhandled drilldown key '${firstToken}'`)
          break
      }
    }
  }

  private selectFlatCategories(categories: SelectedCategory[], values: string[], selectionsList: SelectedCategory[]) {
    for (const c of categories) {
      if (values.includes(c.categoryDetail.value)) {
        c.selected = true
        selectionsList.push(c)
      }
    }
  }

  private selectHierarchicalCategory(categories: SelectedCategory[], values: string[],
                                     selectionsList: SelectedCategory[][]) {
    for (const sequence of values) {
      this.selectHierarchicalChildren(categories, sequence.split('~'), selectionsList, [])
    }
  }

  private selectHierarchicalChildren(categories: SelectedCategory[], tokens: string[],
                                     selectionsList: SelectedCategory[][], path: SelectedCategory[]) {
    for (const c of categories) {
      if (tokens[0] === c.categoryDetail.value) {
        c.selected = true
        path.push(c)
        if (tokens.length > 1) {
          this.selectHierarchicalChildren(c.children, tokens.slice(1), selectionsList, path)
        } else {
          selectionsList.push(path)
        }
      }
    }
  }

  private applyFilter() {
    const drilldown = [
      this.generateFlatDrilldown('keywords', this.keywordCategories),
      this.generateFlatDrilldown('tags', this.tagCategories),
      this.generateHierarchicalDrilldown('countryName', this.locationCategories),
      this.generateHierarchicalDrilldown('dateYear', this.dateCategories),
    ].filter( (s) => s.length > 0)
    .join('_')

    const searchRequest = this.$store.state.serverRequest.request
    searchRequest.first = 1
    searchRequest.pageCount = SearchRequest.defaultItemsPerPage
    searchRequest.drilldown = drilldown

    const latLon = latLonConverter.parse(searchRequest.searchText)
    if (latLon) {
      searchRequest.searchType = 'l'
      searchRequest.latitude = latLon.latitude
      searchRequest.longitude = latLon.longitude
    }

    const currentRoute = this.$router.currentRoute
    this.$router.push({ path: currentRoute.path, query: searchRouteBuilder.toParameters(searchRequest) })
  }

  private generateFlatDrilldown(name: string, categories: SelectedCategory[]): string {
    const selected: string[] = []
    for (const c of categories) {
      if (c.selected) {
        selected.push(c.categoryDetail.value)
      }
    }
    if (selected.length > 0) {
      return `${name}:${selected.join(',')}`
    }
    return ''
  }

  private generateHierarchicalDrilldown(name: string, categories: SelectedCategory[]): string {

    // countryName~stateName=Germany~Berlin
    const selectedMap = this.generateHierarchicalChildren(name, categories)

    const selected: string[] = []
    for (const [key, list] of selectedMap.entries()) {
      selected.push(`${key}:${list.join(',')}`)
    }

    if (selected.length > 0) {
      return `${selected.join('_')}`
    }
    return ''
  }

  private generateHierarchicalChildren(name: string, categories: SelectedCategory[]): Map<string, string[]> {
    const selected = new Map<string, string[]>()
    for (const c of categories) {
      if (c.selected) {
        const selectedChildren = this.generateHierarchicalChildren(c.categoryDetail.field, c.children)
        if (selectedChildren.size > 0) {
          // Children return something like ['stateName': 'Berlin'] and it's turned into
          // 'countryName~stateName': 'Germany~Berlin'
          for (const [key, value] of selectedChildren.entries()) {
            const list = value.map( (s) => `${c.categoryDetail.value}~${s}`)
            selected.set(`${name}~${key}`, list)
          }
        } else {
          let values: string[] = []
          if (selected.has(name)) {
            values = selected.get(name)!
          }
          values.push(c.categoryDetail.value)
          selected.set(name, values)
        }
      }
    }
    return selected
  }

  private buildSelections(details: SearchCategoryDetail[], parent?: SelectedCategory): SelectedCategory[] {
    const selected: SelectedCategory[] = []
    for (const scd of details) {
      const item = new SelectedCategory(scd, parent)
      if (scd.details) {
        item.children = this.buildSelections(scd.details, item)
      }
      selected.push(item)
    }
    return selected
  }

  private get results(): SearchResults {
    return this.$store.state.serverResponse.results
  }

  private get keywords(): SearchCategory | undefined {
    return this.categoryByField('keywords')
  }

  private get tags(): SearchCategory | undefined {
    return this.categoryByField('tags')
  }

  private get locations(): SearchCategory | undefined {
    return this.categoryByField('countryName')
  }

  private get dates(): SearchCategory | undefined {
    return this.categoryByField('dateYear')
  }

  private categoryByField(field: string): SearchCategory | undefined {
    if (this.results.categories) {
      for (const c of this.results.categories) {
        if (c.field === field) {
          return c
        }
      }
    }
    return undefined
  }

}

</script>

<style scoped>

.top-level-filter {
  padding-left: 1em;
  padding-bottom: 1em;
  float: left;
  text-align: left;
  width: 99%;
}

.filter-text {
  margin-right: 10px;
}

.filter-notification {
  background-color: #484848;
}

.clear-filters {
  margin-left: 1em;
  color: rgb(90, 103, 216);
  font-size: 0.9em;
  cursor: pointer;
}

.tag-list {
  margin-right: 1em;
}

.keyword-tag {
  background-color: rgb(101, 165, 42);
  color: black;
  margin-right: 0.4em;
}

.tag-tag {
  background-color: rgb(44, 187, 180);
  color: black;
  margin-right: 0.4em;
}

.location-tag {
  background-color: rgb(42, 146, 187);
  color: black;
  margin-right: 0.4em;
}

.date-tag {
  background-color: rgb(164, 190, 68);
  color: black;
  margin-right: 0.4em;
}


</style>
