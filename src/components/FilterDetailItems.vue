<template>
  <ul :class="className" v-if="categories">
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
import Vue from 'vue'
import { SelectedCategory } from '@/models/SelectedCategory'

// That stinks - apparently, using 'vue-property-descriptor' for recursive components in production doesn't work.
// This is the same class, but using TypeScript directly.
export default Vue.extend({
    name: 'FilterDetailItems',
    props: {
      categories: Array as () => SelectedCategory[],
      parentCategory: Object as () => SelectedCategory,
      isHierarchical: Boolean,
    },
    data() {
        return {
            open: [] as boolean[],
        }
    },
    mounted() {
      for (const c of this.categories) {
        this.open.push(c.selected)
      }
    },
    methods: {
        hasChildren(category: SelectedCategory): boolean {
          return category.children && category.children.length > 0
        },
        toggleOpen(index: number) {
          this.$set(this.open, index, !this.open[index])
        },
        selectionChanged(c: SelectedCategory) {
          if (c.selected) {
            this.selectParent(this.parentCategory)
          } else {
            this.deselectChildren(c.children)
          }
        },

        selectParent(parent?: SelectedCategory) {
            if (parent) {
              parent.selected = true
              this.selectParent(parent.parent)
            }
        },

        deselectChildren(children: SelectedCategory[]) {
            for (const child of children) {
              child.selected = false
              if (child.children && child.children.length > 0) {
                this.deselectChildren(child.children)
              }
            }
        },

    },
    computed: {
        className(): string {
          if (this.isHierarchical) {
            return this.parentCategory ? 'filter-detail-items-is-child' : 'filter-detail-items-is-parent'
          }
          return 'filter-detail-items-is-flat'
        },
    },
})

/*
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { SearchCategoryDetail } from '@/models/SearchResults'
import { SelectedCategory } from '@/models/SelectedCategory'

@Component({
  name: 'FilterDetailItems',
})
export default class FilterDetailItems extends Vue {
  @Prop({ required: true }) private categories!: SelectedCategory[]
  @Prop() private parentCategory!: SelectedCategory
  @Prop() private isHierarchical!: boolean

  private open: boolean[] = []

  private get className(): string {
    if (this.isHierarchical) {
      return this.parentCategory ? 'filter-detail-items-is-child' : 'filter-detail-items-is-parent'
    }
    return 'filter-detail-items-is-flat'
  }

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
    console.log(`toggle ${index}, currently: ${this.open[index]}`)
    this.$set(this.open, index, !this.open[index])
  }
}
*/
</script>


<style scoped>

.filter-detail-items-is-child {
  list-style: none;
  margin-left: 1em;
}

.filter-detail-items-is-parent {
  list-style: none;
  margin-left: 0.3em;
}

.filter-detail-items-is-flat {
  list-style: none;
  margin-left: 0.0em;
}


.single-item-icon {
  display: inline-block;
  align-items: center;
  cursor: pointer;
  width: 19px;
  min-height: 10px;
}

.single-item-icon-no-details {
  font-size: 1.5em;
  line-height: 1em;
  text-align: center;
}

.checkbox-item {
  margin-left: 0.5em;
  line-height: 2rem;
}

.checkbox:hover {
  color: lightgray;
}

</style>
