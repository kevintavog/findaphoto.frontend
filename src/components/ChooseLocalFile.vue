<template>
  <div class="card choose-local-file" >
    <div class="card-content">
      <b-field>
        <b-upload v-model="file" drag-drop >
          <section class="section">
            <div class="content has-text-centered">
              <p>
               <b-icon icon="upload" size="is-large" />
              </p>
              <p>Drop a local track file here or click to upload.
              </p>
            </div>
          </section>
        </b-upload>
      </b-field>
    </div>
    <span class="file-name local-file-name" v-if="file">
      {{ file.name }}
    </span>
    <span class="file-name local-file-name" v-if="!file">
      ( no file selected )
    </span>
    <div class="choose-footer">
      <div class="button left-button is-pulled-left " type="button" @click="$parent.close()">
        Cancel
      </div>
      <div v-if="file" class="button right-button is-pulled-right" type="button" @click="onAddFile(); $parent.close()" >
        Add
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'

@Component
export default class ChooseLocalFile extends Vue {

  private file: File | null = null

  private onAddFile(): void {
    if (this.file) {
      this.$emit('fileadded', this.file)
    }
  }
}

</script>


<style scoped>

.local-file-name {
  margin: auto;
}

.choose-footer {
  padding: 1em 0em 3em 0em;
}

.left-button {
  margin-left: 1.5em;
}

.right-button {
  margin-right: 1.5em;
}

</style>
