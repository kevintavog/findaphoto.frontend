<template>
  <ul :class="isHierarchical ? 'filter-detail-items-is-child' : 'filter-detail-items-is-parent'" v-if="categories">
    <li class="single-item" v-for="(c, index) in categories" :key="c.categoryDetail.value">
      <font-awesome-icon class="single-item-icon" icon="caret-right" size="2x" v-if="hasChildren(c) && !open[index]" @click="toggleOpen(index)"/>
      <font-awesome-icon class="single-item-icon" icon="caret-down" size="2x" v-if="hasChildren(c) && open[index]" @click="toggleOpen(index)"/>
      <span class="single-item-icon single-item-icon-no-details" v-if="!hasChildren(c) && isHierarchical" > - </span>
      <b-checkbox class="checkbox-item" v-model="c.selected" :native-value="c.categoryDetail.value" v-on:input="selectionChanged(c)">
          {{c.categoryDetail.value}} ({{c.categoryDetail.count}})
      </b-checkbox>

      <FilterDetailItems :categories="c.children" v-if="open[index]" :parentCategory="c" :isHierarchical="isHierarchical" />
    </li>
  </ul>
</template>


<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { SearchCategoryDetail } from '@/models/SearchResults'
import { SelectedCategory } from '@/models/SelectedCategory'


@Component
export default class FilterDetailItems extends Vue {
  @Prop({ required: true }) private categories!: SelectedCategory[]
  @Prop() private parentCategory!: SelectedCategory
  @Prop() private isHierarchical!: boolean


  private open: boolean[] = []

  private hasChildren(category: SelectedCategory): boolean {
    return category.children && category.children.length > 0
  }

  private mounted() {
    for (const c of this.categories) {
      this.open.push(c.selected)
    }
  }

  private selectionChanged(c: SelectedCategory) {
    if (c.selected) {
      this.selectParent(this.parentCategory)
    } else {
      this.deselectChildren(c.children)
    }
  }

  private selectParent(parent?: SelectedCategory) {
      if (parent) {
        parent.selected = true
        this.selectParent(parent.parent)
      }
  }

  private deselectChildren(children: SelectedCategory[]) {
      for (const child of children) {
        child.selected = false
        if (child.children && child.children.length > 0) {
          this.deselectChildren(child.children)
        }
      }
  }

  private toggleOpen(index: number) {
    this.$set(this.open, index, !this.open[index])
  }
}

</script>


<style scoped>

.filter-detail-items-is-child {
  list-style: none;
  margin-left: 1em;
}

.filter-detail-items-is-parent {
  list-style: none;
  margin-left: -0.3em;
}

.single-item-icon {
  margin-left: 0.5em;
  display: inline-block;
  align-items: center;
  cursor: pointer;
  width: 19px;
  min-height: 10px;
}

.single-item-icon-no-details {
  margin-left: 0.65em;
  font-size: 1.5em;
  line-height: 1em;
  text-align: center;
}

.checkbox-item {
  display: inline-block;
  margin-left: 0.5em;
  line-height: 2rem;
}

.checkbox:hover {
  color: lightgray;
}

</style>
