<template>
  <div class="file-list-container">
    <ul
      v-if="files.length > 0"
      class="file-list"
    >
      <li
        v-for="FileIterator in files"
        :key="FileIterator.id"
        class="file-list-item"
      >
        <span class="file-name">{{ FileIterator.name }}</span><span class="badge">{{ FileIterator.extension }}</span>
        <div class="file-item-right">
          <button
            type="button"
            class="copy"
            :aria-label="`Copy stream URL for ${FileIterator.name}`"
            @click="copyUrl(FileIterator.id)"
          >
            <FontAwesomeIcon :icon="iconCopy" />
          </button>
        </div>
      </li>
    </ul>

    <div
      v-if="files.length === 0"
      class="error"
    >
      <span class="msg">No playable files are linked to this title yet.</span>
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
  props: { files: { type: Array, default: () => [] } },
  computed: {
    iconCopy: () => faCopy
  },
  methods: {
    getUrl: async function (fileId) {
      let session = await oblectoClient.sessions.create(fileId, { quality: 'original' })

      return oblectoClient.sessions.mediaUrl(session.mediaUrl)
    },
    copyUrl: async function (fileId) {
      this.$modal.show('CopyText', { title: 'Copy URL', text: await this.getUrl(fileId) })
    }
  }
}
</script>

<style scoped lang="sass">
.file-list
  list-style: none
  width: 100%
.file-list-item
  display: flex
  align-items: center
  gap: 12px
  padding: 16px 0
  border-bottom: 1px solid var(--color-border)
.file-name
  flex: 1
  min-width: 0
  overflow-wrap: anywhere
  font-size: 0.875rem
.badge
  color: var(--color-brand-turquoise)
  font-size: 0.7rem
  text-transform: uppercase
  border: 1px solid var(--color-border)
  border-radius: 3px
  padding: 4px 6px
.copy
  display: grid
  place-items: center
  width: 40px
  height: 40px
  border: 1px solid var(--color-border)
  border-radius: 4px
  color: var(--color-text)
  background: var(--color-surface)
  cursor: pointer
  &:hover
    color: var(--color-brand-turquoise)
.error
  color: var(--color-text-muted)
  line-height: 1.6
</style>
