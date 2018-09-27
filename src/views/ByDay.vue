<template>
  <div class="byday">
    <div class="day-and-month">{{dayAndMonth}}</div>
    <div style="clear:both;"></div>
    <button v-if="previousDayText.length > 0" class="previous-day c-button c-button--success" @click="onPreviousDay">
      <font-awesome-icon icon="arrow-left"/>
      {{previousDayText}}
    </button>
    <button v-if="nextDayText.length > 0" class="next-day c-button c-button--success" @click="onNextDay">
      {{nextDayText}}
      <font-awesome-icon icon="arrow-right"/>
    </button>
    <div style="clear:both;"></div>
    <SearchResultsList :day-in-group-name="true" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { searchService } from '@/services/SearchService'
import { searchRouteBuilder } from '@/providers/SearchRouteBuilder'
import SearchResultsList from '@/components/SearchResultsList.vue'
import { ByDayResult, SearchResults } from '@/models/SearchResults'

@Component({
  components: {
    SearchResultsList,
  },
})
export default class ByDay extends Vue {
  private static monthNames: string[] = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December' ]
  private searchType = 'd'
  private queryProperties: string = 'id,city,keywords,imageName,createdDate,latitude,longitude' +
    ',thumbUrl,slideUrl,warnings'
  private activeDate?: Date
  private previousDayText: string = ''
  private nextDayText: string = ''
  private dayAndMonth: string = ''

  private invokeSearchService(query: any): void {
    const searchRequest = searchRouteBuilder.toSearchRequest(query, this.searchType)
    searchRequest.properties = this.queryProperties
    searchService.search(searchRequest)
  }

  private navigateToDate(byDay: ByDayResult): void {
    const searchRequest = this.$store.state.serverRequest.request
    searchRequest.month = byDay.month
    searchRequest.day = byDay.day
    searchRequest.first = 1
    this.$router.push({ path: 'byday', query: searchRouteBuilder.toParameters(searchRequest)})
  }

  private mounted() {
    this.invokeSearchService(this.$route.query)
  }

  private onPreviousDay() {
    this.navigateToDate(this.results.previousAvailableByDay)
  }

  private onNextDay() {    
    this.navigateToDate(this.results.nextAvailableByDay)
  }

  private get results(): SearchResults {
    return this.$store.state.serverResponse.results
  }

  private byDayString(date?: Date): string {
    if (!date) {
      return ''
    }
    return ByDay.monthNames[date.getMonth()] + '  ' + date.getDate()
  }

  private byDayStringFromByDayResult(byDay?: ByDayResult): string {
    if (!byDay) {
      return ''
    }
    return ByDay.monthNames[byDay.month - 1] + '  ' + byDay.day
  }

  @Watch('results')
  private onResultsChanged(to: any, from: any) {
    this.activeDate = new Date(
      2016,
      this.$store.state.serverRequest.request.month - 1,
      this.$store.state.serverRequest.request.day, 0, 0, 0, 0)
    this.dayAndMonth = 'Pictures from ' + this.byDayString(this.activeDate)
    this.previousDayText = this.byDayStringFromByDayResult(this.results.previousAvailableByDay)
    this.nextDayText = this.byDayStringFromByDayResult(this.results.nextAvailableByDay)
  }

  @Watch('$route')
  private onRouteChanged(to: any, from: any) {
    this.invokeSearchService(to.query)
  }
}

</script>

<style scoped>
.day-and-month {
  font-size: 2em;
  margin-left: 10px;
  margin-top: 0;
  padding-top: 0;
  color: #FFF;
  float:left;
}
.previous-day {
  margin-left: 10px;
  float:left;
}

.next-day {
  margin-right: 10px;
  float:right;
}

</style>
