<template>
  <div class="info">
    <h2 v-if="loading">
       Loading...
    </h2>

    <div v-else-if="indexResponse" class="info" >
      <h3>
        ElasticSearch version {{indexResponse.dependencyInfo.elasticSearch.version}} is 
          {{indexResponse.dependencyInfo.elasticSearch.indexStatus}} for 
          '{{indexResponse.dependencyInfo.elasticSearch.index}}'
      </h3>


      <h3 v-if="indexResponse.imageCount + indexResponse.videoCount > 0">
        <font-awesome-icon class="info-icon" icon="image"/> {{indexResponse.imageCount}} photos
        <br>
        <font-awesome-icon class="info-icon" icon="film"/> {{indexResponse.videoCount}} videos
        <br>
        <font-awesome-icon class="info-icon" icon="file"/> {{totalItemCount}} items
        <br>
        <div v-if="indexResponse.duplicateCount > 0">
          <font-awesome-icon class="info-icon" icon="clone"/> {{indexResponse.duplicateCount}} duplicate items were ignored
        </div>
        <div v-else>
          <font-awesome-icon class="info-icon" icon="clone"/> There are NO duplicate items
        </div>
        <br>

        <div style="clear:both;" class="c-alert c-alert--warning" v-if="indexResponse.warningCount > 0" >
          <router-link class="underline has-text-warning" :to="{ path: '/search', query: { q: 'warnings:*' } }" >
            <b-icon icon="info" />
            There are {{indexResponse.warningCount}} warning(s)
          </router-link>
        </div>
      </h3>


      <div style="clear:both;" v-if="indexResponse.paths">
        <br>
        <h3> <font-awesome-icon class="info-icon" icon="folder"/> Indexed paths: </h3>

        <div v-for="pl in indexResponse.paths" :key="pl.path" class="path">
          <div v-if="pl.lastIndexed">
            {{pl.path}} -- last indexed: {{displayer.dateToLocaleDateAndTime(pl.lastIndexed)}}
          </div>
          <div v-else>
            {{pl.path}} -- has never been indexed
          </div>
        </div>

        <div class="path" v-if="indexResponse.paths.length == 0 && indexResponse.totalItemCount > 0">
          No paths have completed indexing
        </div>
        <div class="path" v-if="indexResponse.paths.length == 0 && indexResponse.totalItemCount == 0">
          No paths have been added.
        </div>
      </div>

    </div>

    <div v-if="fields.length > 0" class="fields-info">
      <br>
      <h3> 
        <font-awesome-icon class="info-icon" icon="map-signs"/> 
        Fields that can be used when searching: 
      </h3>
      <div class="field" v-for="f in fields" :key="f" @click="getValuesForField(f)">
        {{f}}
      </div>
    </div>

    <div v-if="fieldAndValues.name.length > 0" class="field-values-container"  >
      <div v-if="fieldAndValues.values">
        <h3> 
          <font-awesome-icon class="info-icon" icon="list"/>
          Top values for the field '{{fieldAndValues.name}}'
        </h3>
        <div class="field-value-info" v-for="v in fieldAndValues.values" :key="v">
          {{v}}
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { IndexResponse } from '@/models/IndexResponse'
import { searchService } from '@/services/SearchService'
import { dataDisplayer } from '@/providers/DataDisplayerProvider'
import { FieldNameWithValues } from '@/models/FieldNameWithValues'

@Component({
  metaInfo() {
    return {
      title: 'Info',
    }
  },
})
export default class Info extends Vue {
  private indexResponse?: IndexResponse
  private loading = true
  private displayer = dataDisplayer


  private get totalItemCount(): number {
    return +this.indexResponse!.videoCount! + +this.indexResponse!.imageCount!
  }

  private get fields(): string[] {
    return this.$store.state.fieldValues.allFields
  }

  private get fieldAndValues() {
    return this.$store.state.fieldValues.fieldAndValues
  }

  private mounted(): void {
    this.$store.commit('initializeFieldValues')
    searchService.indexStats(
      'dependencyInfo,duplicateCount,imageCount,paths,versionNumber,videoCount,warningCount',
      (results?: IndexResponse, message?: string) => {
        this.indexResponse = results
        if (message) {
          this.$store.commit('setServerError', message)
        }
        this.loading = false
      })
  }

  private getValuesForField(fieldName: string) {
    this.$store.commit('getFieldValues', fieldName)
  }
}

</script>


<style scoped>
.info {
  text-align: left;
  margin-left: 1em;
  margin-right: 1em;
}

.path {
  background: #484848;
  margin-bottom: 10px;
  margin-right: 10px;
  padding: 10px 10px 10px 10px;
}

.info-icon {
  width: 2em;
}

.fields-info {
  text-align: left;
  margin-left: 1em;
  margin-right: 1em;
}

.field {
  background: #484848;
  float: left;
  margin-bottom: 10px;
  margin-right: 10px;
  padding: 10px 10px 10px 10px;
  cursor: pointer;
  text-decoration: underline;
}

.field-value-info {
  background: #484848;
  float: left;
  margin-bottom: 10px;
  margin-right: 10px;
  padding: 10px 10px 10px 10px;
}

.field-values-container {
  clear: both;
  background: #686868;
  padding: 10px 10px 10px 10px;
  -webkit-flex-wrap: wrap;
  display: flex;
  flex-wrap: wrap;
}

.underline {
  text-decoration: underline;
}

</style>
