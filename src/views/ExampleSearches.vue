<template>
   <div class="example-searches">
    <section class="hero is-primary has-background-grey-darker">
      <div class="hero-body">
        <div class="container">
          <h1 class="title"> Example searches </h1>
        </div>
      </div>
    </section>

    <section class="section " >
      <div class="tile searchHintsContainerTile">

      <article v-for="sh in searchHints" :key="sh.description+sh.query" class="tile is-3 has-text-left searchHint " >
        <router-link :to="{ path: '/search', query: { q: sh.query }}" >
          <div class="searchHintDescription">{{sh.description}}:</div>
          <p>
          <div class="has-text-weight-semibold searchHintQuery ">{{sh.query}}</div>
        </router-link>
      </article>

      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { SearchHint } from '@/models/SearchHint'


@Component({
  metaInfo() {
    return {
      title: 'Example searches',
    }
  },
})
export default class ExampleSearches extends Vue {
  private searchHints: SearchHint[] = [
    new SearchHint('Everything with a keyword of "trip"', 'keywords:trip'),
    new SearchHint('Everything since a date, October 4, 2016', 'date:>=20161004'),
    new SearchHint('Everything from 2016, January-December', 'date:2016*'),
    new SearchHint('Everything from 2015 and 2016, using a range', 'date:[2015* TO date:2016*]'),
    new SearchHint('The placename is more than 10 meters from the location', 'cachedlocationdistancemeters:>10'),
    new SearchHint('Everything from outside of Washington state', 'statename:* AND NOT statename:Washington'),
    new SearchHint('Keyword values with a space', 'keywords:"mount rainier"'),
    new SearchHint('Search by path (2016\\2016-09-15 London) 🤢', 'path.value:1?2016?2016-09-15?London?*'),
    new SearchHint('All trips from 2015 and 2016', 'keywords:trip AND date:[2015* TO date:2016*]'),
    new SearchHint('Items with warnings', 'warnings:*'),
  ]
}

</script>


<style scoped>
a {
  text-decoration: none;
}

.searchHint {
  background: #484848;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  margin-right: 10px;
  padding: 10px 10px 10px 10px;
}

.searchHintsContainerTile {
  flex-wrap: wrap;
}

.searchHintDescription {
  margin-right: 10px;
  float: left;
}
.searchHintQuery {
  text-decoration: underline;
  float: left;
  color: hsl(48, 100%, 67%);
}
</style>
