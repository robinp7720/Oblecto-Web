<template>
  <div class="wrapper">
    <div class="settings-card">
      <p class="settings-description problem-intro">
        <strong>Unidentified</strong> files could not be matched to a movie or episode, so they are not in your
        library. Renaming them usually helps. <strong>Unreadable</strong> files could not be analysed and may not
        play. Retrying keeps a file listed until it succeeds. Ignore files you never want in the library, such as
        samples.
      </p>

      <div class="problem-toolbar">
        <div
          class="problem-stage-filter"
          role="group"
          aria-label="Filter by problem"
        >
          <button
            v-for="option in stageOptions"
            :key="option.value"
            type="button"
            :class="{ active: stage === option.value }"
            :aria-pressed="stage === option.value"
            @click="setStage(option.value)"
          >
            {{ option.label }} <span class="count">{{ counts[option.value] }}</span>
          </button>
        </div>
        <input
          v-model="query"
          type="search"
          class="problem-search"
          placeholder="Filter by name or folder"
          aria-label="Filter problem files by name or folder"
        >
        <select
          v-model="sort"
          class="problem-sort"
          aria-label="Sort problem files"
        >
          <option value="newest">
            Newest first
          </option>
          <option value="oldest">
            Oldest first
          </option>
          <option value="name">
            Name
          </option>
          <option value="folder">
            Folder
          </option>
        </select>
        <label class="checkbox-container">
          <input
            v-model="includeIgnored"
            type="checkbox"
            @change="refresh"
          >
          <span class="checkmark" />
          Show ignored
        </label>
        <div class="actions-group problem-toolbar-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="loading"
            @click="refresh"
          >
            <font-awesome-icon
              icon="sync"
              :spin="loading"
            /> Refresh
          </button>
          <button
            type="button"
            class="btn"
            :disabled="retryableCount === 0 || retryingAll"
            @click="retryAll"
          >
            <font-awesome-icon icon="redo" /> Retry all ({{ retryableCount }})
          </button>
        </div>
      </div>

      <p
        v-if="!loading && shown.length === 0"
        class="settings-empty"
      >
        {{ emptyMessage }}
      </p>

      <p
        v-if="shown.length && shown.length !== files.length"
        class="problem-count"
        role="status"
      >
        Showing {{ shown.length }} of {{ files.length }}
      </p>

      <div
        v-if="shown.length > 0"
        class="settings-table-scroll"
      >
        <table class="settings-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Problem</th>
              <th>Updated</th>
              <th class="actions">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="file in shown"
              :key="file.id"
              :class="{ 'problem-ignored': file.problemIgnored }"
            >
              <td class="problem-file">
                <div class="problem-file-name">
                  {{ fileName(file) }}
                </div>
                <div class="problem-file-dir">
                  {{ file.directory || file.path }}
                </div>
                <div
                  v-if="linkedTo(file)"
                  class="problem-file-linked"
                >
                  Linked to {{ linkedTo(file) }}
                </div>
              </td>
              <td class="problem-detail">
                <span
                  class="problem-badge"
                  :class="`problem-badge--${file.problemStage || 'unknown'}`"
                >{{ stageLabel(file) }}</span>
                <span
                  v-if="file.problemIgnored"
                  class="problem-badge problem-badge--ignored"
                >Ignored</span>
                <span
                  v-if="file.queued"
                  class="problem-queued"
                >Retry queued…</span>
                <div
                  v-if="file.error"
                  class="error-msg"
                >
                  {{ file.error }}
                </div>
              </td>
              <td
                class="problem-updated"
                :title="absoluteTime(file.updatedAt)"
              >
                {{ relativeTime(file.updatedAt) }}
              </td>
              <td class="actions">
                <button
                  type="button"
                  :title="`Retry ${file.problemStage === 'probe' ? 'analysing' : 'identifying'} this file`"
                  :aria-label="`Retry ${fileName(file)}`"
                  :disabled="file.queued"
                  @click="retryFile(file)"
                >
                  <font-awesome-icon
                    icon="sync"
                    :spin="file.queued"
                  />
                </button>
                <button
                  type="button"
                  :title="file.problemIgnored ? 'Stop ignoring this file' : 'Ignore this file'"
                  :aria-label="`${file.problemIgnored ? 'Stop ignoring' : 'Ignore'} ${fileName(file)}`"
                  @click="toggleIgnored(file)"
                >
                  <font-awesome-icon :icon="file.problemIgnored ? 'undo' : 'ban'" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="settings-card-actions">
        <SaveState :state="status" />
      </div>
    </div>
  </div>
</template>

<script>
import oblectoClient from '@/oblectoClient'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faSync from '@fortawesome/fontawesome-free-solid/faSync'
import faRedo from '@fortawesome/fontawesome-free-solid/faRedo'
import faBan from '@fortawesome/fontawesome-free-solid/faBan'
import faUndo from '@fortawesome/fontawesome-free-solid/faUndo'
import fontawesome from '@fortawesome/fontawesome'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'

fontawesome.library.add(faSync, faRedo, faBan, faUndo)

const STAGE_LABELS = {
  identify: 'Unidentified',
  probe: 'Unreadable'
}

const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

const RELATIVE_UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60]
]

export default {
  name: 'ProblematicFiles',
  components: {
    FontAwesomeIcon,
    SaveState
  },
  data () {
    return {
      files: [],
      stage: '',
      query: '',
      sort: 'newest',
      includeIgnored: false,
      loading: false,
      retryingAll: false,
      status: createSaveState(),
      stageOptions: [
        { value: '', label: 'All' },
        { value: 'identify', label: 'Unidentified' },
        { value: 'probe', label: 'Unreadable' }
      ]
    }
  },
  computed: {
    // Every stage is loaded and filtered here, so each filter button can say
    // how many files it holds.
    counts () {
      const counts = { '': this.files.length }
      for (const stage of Object.keys(STAGE_LABELS)) counts[stage] = this.files.filter(file => file.problemStage === stage).length
      return counts
    },
    inStage () {
      return this.files.filter(file => !this.stage || file.problemStage === this.stage)
    },
    shown () {
      const query = this.query.trim().toLocaleLowerCase()
      const time = file => Date.parse(file.updatedAt) || 0
      const order = {
        newest: (a, b) => time(b) - time(a),
        oldest: (a, b) => time(a) - time(b),
        name: (a, b) => this.fileName(a).localeCompare(this.fileName(b)),
        folder: (a, b) => String(a.directory || a.path).localeCompare(String(b.directory || b.path)) || this.fileName(a).localeCompare(this.fileName(b))
      }[this.sort]

      return this.inStage
        .filter(file => !query || `${this.fileName(file)} ${file.directory || file.path || ''}`.toLocaleLowerCase().includes(query))
        .sort(order)
    },
    // Retry all works on the chosen stage on the server, whatever the text
    // filter shows, so it counts the stage.
    retryableCount () {
      return this.inStage.filter(file => !file.problemIgnored && !file.queued).length
    },
    emptyMessage () {
      if (this.query.trim()) return 'No problem files match this filter.'
      if (this.stage) return `No ${STAGE_LABELS[this.stage].toLowerCase()} files.`

      return 'No problem files. Everything in your library directories was identified and analysed.'
    }
  },
  async created () {
    await this.refresh()
  },
  mounted () {
    // Retries run in the server's queue, so their outcome arrives over the
    // socket rather than in the response to the retry request.
    this.socket = this.$socket
    this.socket?.on('indexer', this.onIndexerEvent)
  },
  beforeUnmount () {
    this.socket?.off('indexer', this.onIndexerEvent)
    window.clearTimeout(this.refreshTimer)
  },
  methods: {
    async refresh () {
      this.loading = true

      // An empty `ok` keeps a successful load silent; only failure is news.
      await this.status.run(
        async () => {
          const files = await oblectoClient.files.getProblematic({ includeIgnored: this.includeIgnored })

          this.files = files.map(file => ({ ...file, queued: false }))
        },
        { busy: 'Loading…', ok: '', error: 'Could not load problem files' }
      )

      this.loading = false
    },
    setStage (stage) {
      this.stage = stage
    },
    onIndexerEvent (payload) {
      if (payload?.event !== 'problem') return

      const index = this.files.findIndex(file => file.id === payload.fileId)

      if (index === -1) {
        // A file this list has not seen yet; batch bursts from a rescan.
        if (payload.problematic) this.scheduleRefresh()
        return
      }

      if (!payload.problematic) {
        this.files.splice(index, 1)
        return
      }

      const file = this.files[index]

      file.queued = false
      file.problemStage = payload.problemStage
      file.error = payload.error
      file.updatedAt = new Date().toISOString()
    },
    scheduleRefresh () {
      window.clearTimeout(this.refreshTimer)
      this.refreshTimer = window.setTimeout(() => this.refresh(), 1000)
    },
    async retryFile (file) {
      if (file.queued) return

      file.queued = true

      let removed = false

      const ok = await this.status.run(
        async () => {
          try {
            await oblectoClient.files.retryFile(file.id)
          } catch (e) {
            // 410: the file was renamed or deleted, and the server dropped it
            if (e?.response?.status !== 410) throw e
            removed = true
          }
        },
        { busy: 'Queueing retry…', ok: '', error: 'Could not queue this retry' }
      )

      if (!ok) {
        file.queued = false
        return
      }

      if (removed) {
        this.removeFiles([file.id])
        this.status.succeed(`${this.fileName(file)} no longer exists and was removed. A rescan picks up renamed files.`)
      } else {
        this.status.succeed(`Retry queued for ${this.fileName(file)}`)
      }
    },
    removeFiles (ids) {
      const remove = new Set(ids)

      this.files = this.files.filter(file => !remove.has(file.id))
    },
    async retryAll () {
      this.retryingAll = true

      let result = null

      await this.status.run(
        async () => {
          result = await oblectoClient.files.retryAllProblematic(this.stage || undefined)
        },
        { busy: 'Queueing retries…', ok: '', error: 'Could not queue retries' }
      )

      this.retryingAll = false

      if (!result) return

      this.removeFiles(result.removedIds)

      // Files outside every library directory cannot be retried and stay as they are.
      const skippedIds = new Set(result.skippedIds)

      for (const file of this.files) {
        if (!file.problemIgnored && !skippedIds.has(file.id)) file.queued = true
      }

      const parts = [`Queued ${result.queued} ${result.queued === 1 ? 'retry' : 'retries'}.`]

      if (result.removedIds.length > 0) {
        parts.push(`Removed ${result.removedIds.length} that no longer ${result.removedIds.length === 1 ? 'exists' : 'exist'}.`)
      }

      if (result.skippedIds.length > 0) {
        parts.push(`${result.skippedIds.length} could not be retried because they are outside every library directory.`)
      }

      this.status.succeed(parts.join(' '))
    },
    async toggleIgnored (file) {
      const problemIgnored = !file.problemIgnored

      const ok = await this.status.run(
        () => oblectoClient.files.setProblemIgnored(file.id, problemIgnored),
        {
          busy: problemIgnored ? 'Ignoring…' : 'Restoring…',
          ok: problemIgnored ? `Ignoring ${this.fileName(file)}` : `No longer ignoring ${this.fileName(file)}`,
          error: 'Could not update this file'
        }
      )

      if (!ok) return

      if (problemIgnored && !this.includeIgnored) {
        this.files = this.files.filter(f => f.id !== file.id)
      } else {
        file.problemIgnored = problemIgnored
      }
    },
    fileName (file) {
      return file.path ? file.path.split('/').pop() : file.name
    },
    stageLabel (file) {
      return STAGE_LABELS[file.problemStage] || 'Problem'
    },
    linkedTo (file) {
      const movie = file.Movies?.[0]

      if (movie) return movie.movieName

      const episode = file.Episodes?.[0]

      if (!episode) return ''

      const season = String(episode.airedSeason ?? '').padStart(2, '0')
      const number = String(episode.airedEpisodeNumber ?? '').padStart(2, '0')
      const series = episode.Series?.seriesName

      return `${series ? series + ' ' : ''}S${season}E${number}`
    },
    relativeTime (value) {
      if (!value) return ''

      const seconds = (new Date(value).getTime() - Date.now()) / 1000

      for (const [unit, size] of RELATIVE_UNITS) {
        if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit)
      }

      return 'just now'
    },
    absoluteTime (value) {
      return value ? new Date(value).toLocaleString() : ''
    }
  }
}
</script>

<style scoped lang="sass">
.problem-intro
  margin-top: 0

.problem-toolbar
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 12px 20px
  margin-bottom: 16px

  .checkbox-container
    margin-bottom: 0

.problem-toolbar-actions
  margin-left: auto

.problem-search
  flex: 1 1 220px
  min-width: 0

.problem-stage-filter .count
  margin-left: 4px
  opacity: 0.7
  font-variant-numeric: tabular-nums

.problem-count
  margin: 0 0 10px
  color: var(--color-text-muted)
  font-size: 0.85rem

.problem-stage-filter
  display: inline-flex
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  overflow: hidden

  button
    padding: 6px 14px
    border: 0
    background: transparent
    color: var(--color-text-muted)
    font-family: var(--font-body)
    font-size: 13px
    cursor: pointer

    & + button
      border-left: 1px solid var(--color-border)

    &:hover
      background: var(--color-surface-hover)
      color: var(--color-text)

    &.active
      background: var(--color-accent)
      color: #1b1616
      font-weight: 700

    &:focus-visible
      outline: 2px solid white
      outline-offset: -2px

.problem-file
  min-width: 200px
  max-width: 340px
  overflow-wrap: anywhere

.problem-file-name
  color: var(--color-text)

.problem-file-dir,
.problem-file-linked
  color: var(--color-text-faint)
  font-size: 0.85em

.problem-file-linked
  color: var(--color-text-muted)

.problem-detail
  min-width: 220px

.problem-badge
  display: inline-block
  margin: 0 6px 6px 0
  padding: 2px 8px
  border-radius: var(--radius-sm)
  font-size: 12px
  font-weight: 700

  &--identify
    background: rgba(104, 224, 220, 0.16)
    color: var(--color-brand-turquoise)

  &--probe
    background: rgba(255, 115, 77, 0.18)
    color: var(--color-brand-coral)

  &--unknown,
  &--ignored
    background: rgba(255, 255, 255, 0.1)
    color: var(--color-text-muted)

.problem-queued
  color: var(--color-text-muted)
  font-size: 0.85em

.problem-updated
  color: var(--color-text-muted)
  white-space: nowrap

.problem-ignored
  .problem-file-name,
  .error-msg
    opacity: 0.6

.error-msg
  color: var(--color-danger)
  font-size: 0.9em
  white-space: pre-wrap
  max-height: 100px
  overflow-y: auto
  background: rgba(255, 255, 255, 0.08)
  padding: 5px
  border-radius: var(--radius-sm)


// On a phone the four columns do not fit, and a sideways-scrolling table hides
// the actions. Each row becomes a card instead: file, problem, then time and
// actions on one line.
@media screen and (max-width: 600px)
  .settings-table
    thead
      display: none

    tr
      display: grid
      grid-template-columns: 1fr auto
      padding: 12px 0

    td
      border-bottom: 0
      padding: 4px 12px

    .problem-file,
    .problem-detail
      grid-column: 1 / -1
      max-width: none
      min-width: 0

    .problem-updated
      align-self: center

  .problem-toolbar-actions
    margin-left: 0
</style>
