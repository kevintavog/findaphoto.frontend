<template>
  <div v-if="categories">
    <span class="filter-caption"> {{caption}} </span>
    <FilterDetailItems :categories="categories" :isHierarchical="isHierarchical" />
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { SearchCategory } from '@/models/SearchResults'
import { SelectedCategory } from '@/models/SelectedCategory'
import FilterDetailItems from '@/components/FilterDetailItems.vue'

@Component({
  components: {
    FilterDetailItems,
  },
})
export default class FilterGroup extends Vue {
  @Prop({ required: true }) private categories!: SelectedCategory[]
  @Prop({ required: true }) private caption!: string
  @Prop() private isHierarchical!: boolean

  private checkboxGroup: string[] = []
  private open = false

  private toggleOpen() {
    this.open = !this.open
  }
}

</script>


<style scoped>

.filter-caption {
  font-weight: 600;
  font-size: larger;
}

</style>
