<template>
  <div class="file-list-container">
    <ul class="file-list" v-if="files.length > 0">
      <li
        v-for="(FileIterator, index) in files"
        :key="FileIterator.id"
        class="file-list-item"
      >
        {{ FileIterator.name }} <span class="badge">{{ FileIterator.extension }}</span>
        <div class="file-item-right">
          <span class="copy" v-on:click="copyUrl(FileIterator.id)"><FontAwesomeIcon :icon="iconCopy"/></span>
        </div>
      </li>
    </ul>

    <div class="error" v-if="files.length === 0">
      <span class="msg">No files linked</span>
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faCopy from '@fortawesome/fontawesome-free-solid/faCopy'

export default {
  name: 'FileList',
  components: { FontAwesomeIcon },
  props: [ 'files' ],
  computed: {
    iconCopy: () => faCopy
  },
  methods: {
    getUrl: async function (fileId) {
      let token = (await this.axios.get(`/session/create/${fileId}?noremux=true`)).data.sessionId

      return `${this.axios.defaults.baseURL}/session/stream/${token}`
    },
    copyUrl: async function (fileId) {
      this.$modal.show('CopyText', { title: 'Copy URL', text: await this.getUrl(fileId) })
    }
  }
}
</script>

<style scoped lang="sass">
.file-list-container
  padding: 0 10px

.file-list
  background: #696060
  box-shadow: 0 0 2px 2px rgba(darken(#696060, 20), 0.75)

  border-spacing: 0

  list-style: none

  width: 100%

  border-radius: 3px
  overflow: hidden

.file-list-item
  padding: 10px 30px

.file-list-item:nth-child(even)
  background-color: darken(#696060, 2)

.file-item-right
  float: right
</style>
