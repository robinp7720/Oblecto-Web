<template>
  <div class="file-list-container">
    <ul
      v-if="files.length > 0"
      class="file-list"
    >
      <li
        v-for="(FileIterator, index) in files"
        :key="FileIterator.id"
        class="file-list-item"
      >
        {{ FileIterator.name }} <span class="badge">{{ FileIterator.extension }}</span>
        <div class="file-item-right">
          <span
            class="copy"
            @click="copyUrl(FileIterator.id)"
          ><FontAwesomeIcon :icon="iconCopy" /></span>
        </div>
      </li>
    </ul>

    <div
      v-if="files.length === 0"
      class="error"
    >
      <span class="msg">No files linked</span>
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faCopy from '@fortawesome/fontawesome-free-solid/faCopy'
import oblectoClient from '@/oblectoClient'

export default {
  name: 'FileList',
  components: { FontAwesomeIcon },
  props: [ 'files' ],
  computed: {
    iconCopy: () => faCopy
  },
  methods: {
    getUrl: async function (fileId) {
      let session = await oblectoClient.sessions.create(fileId, { noremux: true })

      return oblectoClient.sessions.getStreamUrl(session.sessionId)
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
  background: var(--color-surface-card)
  border: 1px solid var(--color-border)
  box-shadow: var(--shadow-soft)

  border-spacing: 0

  list-style: none

  width: 100%

  border-radius: 14px
  overflow: hidden

.file-list-item
  padding: 10px 30px
  color: var(--color-text)

.file-list-item:nth-child(even)
  background-color: rgba(255, 255, 255, 0.04)

.file-item-right
  float: right
  color: var(--color-text-faint)
</style>
