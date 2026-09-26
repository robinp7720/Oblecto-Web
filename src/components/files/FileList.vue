<template>
  <div class="file-list-container">
    <ul
      v-if="files.length > 0"
      class="file-list"
    >
      <li
        v-for="file in files"
        :key="file.id"
        class="file-list-item"
      >
        <span class="file-name">
          {{ file.name }}
          <small v-if="summary(file)">{{ summary(file) }}</small>
        </span><span class="badge">{{ file.extension }}</span>
        <div class="file-item-right">
          <!-- With several versions, Play picks the first; this picks this one. -->
          <button
            v-if="files.length > 1"
            type="button"
            class="play-version"
            :aria-label="`Play this version: ${summary(file) || file.name}`"
            @click="$emit('play', file)"
          >
            Play this version
          </button>
          <button
            type="button"
            class="copy"
            :class="{ 'copy--done': states[file.id] === 'copied', 'copy--failed': states[file.id] === 'failed' }"
            :disabled="states[file.id] === 'working'"
            :aria-label="`Copy stream URL for ${file.name}`"
            @click="copyUrl(file.id)"
          >
            <FontAwesomeIcon :icon="states[file.id] === 'copied' ? 'check' : iconCopy" />
          </button>
        </div>
      </li>
    </ul>

    <!-- One live region for the list: the button itself shows a tick, and this
         carries the same news to a screen reader. -->
    <p
      class="copy-status"
      role="status"
      aria-live="polite"
    >
      {{ status }}
    </p>

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
import { describeError } from '@/composables/useSaveState'
import { fileSummary } from '@/utils/media'

const RESET_AFTER = 2500

/**
 * navigator.clipboard only exists in a secure context, and plenty of Oblecto
 * servers are reached over plain http on a LAN. Fall back to the old
 * selection-based copy there rather than telling those users it failed.
 */
async function writeToClipboard (text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text)
  }

  const field = document.createElement('textarea')

  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)

  try {
    field.select()
    if (!document.execCommand('copy')) throw new Error('Copying is not available in this browser')
  } finally {
    field.remove()
  }
}

export default {
  name: 'FileList',
  components: { FontAwesomeIcon },
  props: { files: { type: Array, default: () => [] } },
  emits: ['play'],
  data () {
    return {
      // fileId -> working | copied | failed
      states: {},
      status: ''
    }
  },
  computed: {
    iconCopy: () => faCopy
  },
  beforeUnmount () {
    window.clearTimeout(this.timer)
  },
  methods: {
    summary: fileSummary,
    async getUrl (fileId) {
      const session = await oblectoClient.sessions.create(fileId, { quality: 'original' })

      return oblectoClient.sessions.mediaUrl(session.mediaUrl)
    },
    // The old flow opened a modal holding a read-only input and called
    // document.execCommand('copy'). The clipboard API does the same job without
    // a window in the way, and works where execCommand no longer does.
    async copyUrl (fileId) {
      window.clearTimeout(this.timer)
      this.states = { ...this.states, [fileId]: 'working' }
      this.status = 'Preparing stream URL…'

      try {
        const url = await this.getUrl(fileId)

        await writeToClipboard(url)

        this.states = { ...this.states, [fileId]: 'copied' }
        this.status = 'Stream URL copied to the clipboard.'
      } catch (e) {
        this.states = { ...this.states, [fileId]: 'failed' }
        this.status = describeError(e, 'Could not copy the stream URL')
        console.error('Failed to copy stream URL', e)
      }

      this.timer = window.setTimeout(() => {
        const next = { ...this.states }
        delete next[fileId]
        this.states = next
        this.status = ''
      }, RESET_AFTER)
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
  display: grid
  gap: 4px
  flex: 1
  min-width: 0
  overflow-wrap: anywhere
  font-size: 0.875rem
  small
    color: var(--color-text-muted)
    font-size: 0.8rem
.file-item-right
  display: flex
  align-items: center
  gap: 8px
.play-version
  min-height: 40px
  padding: 8px 14px
  border: 1px solid var(--color-border-strong)
  border-radius: var(--radius-sm)
  background: var(--color-surface)
  color: var(--color-text)
  font-weight: 700
  cursor: pointer
  &:hover
    border-color: var(--color-brand-turquoise)
.badge
  color: var(--color-brand-turquoise)
  font-size: 0.7rem
  text-transform: uppercase
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  padding: 4px 6px
.copy
  display: grid
  place-items: center
  width: 40px
  height: 40px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  color: var(--color-text)
  background: var(--color-surface)
  cursor: pointer
  transition: color 0.2s, border-color 0.2s
  &:hover
    color: var(--color-brand-turquoise)
  &:disabled
    opacity: 0.6
    cursor: progress
.copy--done
  color: var(--color-success)
  border-color: var(--color-success-border)
.copy--failed
  color: var(--color-danger)
  border-color: var(--color-danger-border)
.copy-status
  min-height: 1.3em
  margin: 10px 0 0
  color: var(--color-text-muted)
  font-size: 0.8rem
.error
  color: var(--color-text-muted)
  line-height: 1.6
</style>
