<template>
  <div class="statistics-page">
    <header class="statistics-heading">
      <p class="eyebrow">
        {{ admin ? 'Server overview' : 'Your viewing' }}
      </p><h1 v-if="!admin">
        Statistics
      </h1>
      <p class="muted">
        {{ admin ? 'Explore viewing activity across your server, or filter by viewer.' : 'Your viewing activity, at a glance. Explore watch time, favorite titles and playback history.' }}
      </p>
    </header>
    <p class="time-note">
      Dates and daily totals use UTC.
    </p>
    <form
      class="statistics-filters"
      @submit.prevent="refresh"
    >
      <label>Period<select
        v-model="preset"
        @change="applyPreset"
      ><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="custom">Custom</option></select></label>
      <label>From<input
        v-model="from"
        type="date"
        required
        @change="preset = 'custom'"
      ></label>
      <label>Through<input
        v-model="through"
        type="date"
        required
        @change="preset = 'custom'"
      ></label>
      <label v-if="admin">Viewer<select
        v-model="userId"
        aria-label="Viewer"
      ><option value="">All viewers</option><option
        v-for="user in userOptions"
        :key="user.userId"
        :value="user.userId"
      >{{ user.username || `User ${user.userId}` }}</option></select></label>
      <button
        type="submit"
        :disabled="busy"
      >
        {{ busy ? 'Loading…' : 'Apply' }}
      </button>
    </form>
    <p
      v-if="error"
      class="notice notice-error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-if="summary?.collection?.degraded"
      class="notice"
      role="status"
    >
      Some activity could not be recorded. Statistics may be incomplete.
    </p>
    <p
      v-if="busy && !summary"
      class="notice"
      role="status"
    >
      Loading your statistics…
    </p>
    <template v-if="summary">
      <div class="statistics-cards">
        <article class="primary-metric">
          <span>Watch time</span><strong>{{ duration(summary.totals.watchSeconds) }}</strong><small>Active viewing in this period</small>
        </article>
        <article><span>Plays</span><strong>{{ number(summary.totals.plays) }}</strong><small>Playback sessions started</small></article>
        <article><span>Completions</span><strong>{{ number(summary.totals.completions) }}</strong><small>At least 90% watched</small></article>
        <article><span>Repeat plays</span><strong>{{ number(summary.totals.repeatPlays) }}</strong><small>Returning to a title</small></article>
      </div>
      <details class="measurement-notes">
        <summary>About these numbers</summary>
        <p class="muted">
          Tracking since {{ dateTime(summary.trackingStartedAt) }}. Earlier viewing cannot be reconstructed.
        </p>
        <p class="muted">
          {{ duration(summary.totals.estimatedSeconds) }} estimated from older or Jellyfin clients. Completions require 90% distinct coverage within one session.
        </p>
      </details>
      <StatisticsChart
        title="Daily watch time"
        :points="dailyPoints"
        unit="minutes"
      />
      <div class="statistics-columns">
        <section>
          <h2>Viewing by media</h2><p
            v-if="!summary.kinds.length"
            class="empty-state"
          >
            No viewing recorded in this period.
          </p><div
            v-else
            class="table-scroll"
          >
            <table>
              <thead><tr><th>Media</th><th>Watch time</th><th>Plays</th></tr></thead><tbody>
                <tr
                  v-for="kind in summary.kinds"
                  :key="kind.itemType"
                >
                  <th>{{ mediaLabel(kind.itemType) }}</th><td>{{ duration(kind.watchSeconds) }}</td><td>{{ kind.plays }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2>Playback methods</h2><div class="table-scroll">
            <table>
              <thead><tr><th>Method</th><th>Watch time</th></tr></thead><tbody>
                <tr
                  v-for="method in methods"
                  :key="method"
                >
                  <th scope="row">
                    {{ methodLabels[method] }}<div
                      class="method-track"
                      aria-hidden="true"
                    >
                      <span :style="{ width: `${methodShare(method)}%` }" />
                    </div>
                  </th><td>{{ duration(summary.totals[`${method}Seconds`]) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section>
        <h2>Most watched titles</h2><p
          v-if="!summary.titles.length"
          class="empty-state"
        >
          No viewing recorded in this period.
        </p><div
          v-else
          class="table-scroll"
        >
          <table>
            <thead><tr><th>Title</th><th>Watch time</th><th>Plays</th><th>Completions</th></tr></thead><tbody>
              <tr
                v-for="title in summary.titles"
                :key="`${title.itemType}:${title.itemId}`"
              >
                <th scope="row">
                  {{ title.title }}<small class="cell-detail">{{ mediaLabel(title.itemType) }}</small>
                </th><td>{{ duration(title.watchSeconds) }}</td><td>{{ title.plays }}</td><td>{{ title.completions }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section v-if="admin && summary.users.length">
        <h2>Viewers</h2><div class="table-scroll">
          <table>
            <thead><tr><th>Viewer</th><th>Watch time</th><th>Plays</th></tr></thead><tbody>
              <tr
                v-for="user in summary.users"
                :key="user.userId"
              >
                <th>{{ user.username || `User ${user.userId}` }}</th><td>{{ duration(user.watchSeconds) }}</td><td>{{ user.plays }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>Viewing history</h2><p class="muted">
          Sessions started in the selected period; durations are whole-session totals. Prepared sessions may have no watch time.
        </p><p
          v-if="!history.length"
          class="empty-state"
        >
          No sessions in this period.
        </p><div
          v-else
          class="table-scroll"
        >
          <table>
            <thead>
              <tr>
                <th>Started (UTC)</th><th>Title</th><th v-if="admin">
                  Viewer
                </th><th>Client</th><th>Watch time</th><th>Result</th><th>Measurement</th>
              </tr>
            </thead><tbody>
              <tr
                v-for="session in history"
                :key="session.id"
              >
                <td>{{ dateTime(session.startedAt) }}</td><th>{{ session.title }}</th><td v-if="admin">
                  {{ userName(session.userId) }}
                </td><td>{{ session.client }}</td><td>{{ duration(session.watchSeconds) }}</td><td>
                  <span
                    class="result-badge"
                    :class="{ 'is-complete': session.completedAt && !session.failure, 'is-failure': session.failure }"
                  >{{ session.failure || (session.completedAt ? 'Completed' : session.endReason || 'Active') }}</span>
                </td><td>{{ session.quality }}</td>
              </tr>
            </tbody>
          </table>
        </div><button
          v-if="nextCursor"
          type="button"
          :disabled="busy"
          @click="loadMore"
        >
          Load more history
        </button>
      </section>
    </template>
    <section v-if="library">
      <h2>Current library</h2><div class="statistics-cards">
        <article
          v-for="key in ['movies', 'series', 'episodes', 'files']"
          :key="key"
        >
          <span>{{ key }}</span><strong>{{ number(library[key]) }}</strong>
        </article>
      </div><p>{{ bytes(library.localBytes) }} in known local files · {{ library.remoteFiles }} remote files · {{ library.missingSize }} files without size metadata · {{ library.problematicFiles }} problematic files</p>
    </section>
    <section v-if="health">
      <h2>Server playback health</h2><p class="muted">
        All viewers. Sampled every 15 seconds; gaps indicate no measurements. Allocated sessions include paused or prepared streams.
      </p><div class="statistics-cards">
        <article><span>Failed starts</span><strong>{{ health.failures.failedAttempts || 0 }}</strong></article><article><span>Sessions with failures</span><strong>{{ health.failures.failedSessions || 0 }}</strong></article><article><span>Buffering reports</span><strong>{{ health.failures.bufferingKnownSessions ? health.failures.bufferingReports || 0 : 'Unavailable' }}</strong></article>
      </div><label class="health-selector">Measurement<select v-model="healthMetric"><option
        v-for="(label, key) in healthLabels"
        :key="key"
        :value="key"
      >{{ label }}</option></select></label><StatisticsChart
        :title="`${healthLabels[healthMetric]} — average`"
        :points="healthPoints('means')"
        :unit="healthMetric === 'cacheBytes' ? 'MiB' : 'count'"
        :interval="health.resolution === 'hour' ? 3600000 : 60000"
      /><StatisticsChart
        :title="`${healthLabels[healthMetric]} — peak`"
        :points="healthPoints('peaks')"
        :unit="healthMetric === 'cacheBytes' ? 'MiB' : 'count'"
        :interval="health.resolution === 'hour' ? 3600000 : 60000"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import oblectoClient from '@/oblectoClient'
import StatisticsChart from '@/components/statistics/StatisticsChart.vue'
const props = defineProps({ admin: { type: Boolean, default: false } })
const auth = useAuthStore()
const preset = ref('30')
const from = ref('')
const through = ref('')
const userId = ref('')
const userOptions = ref([])
const summary = ref(null)
const library = ref(null)
const health = ref(null)
const history = ref([])
const nextCursor = ref(null)
const busy = ref(false)
const error = ref('')
const healthMetric = ref('viewers')
const healthLabels = { viewers: 'Active viewers', sessions: 'Allocated sessions', direct: 'Direct sessions', remux: 'Remux sessions', transcode: 'Transcode sessions', encoders: 'Encoder jobs', queue: 'Encoder queue', cacheBytes: 'Cache usage' }
const methods = ['direct', 'remux', 'transcode', 'unknown']
const methodLabels = { direct: 'Direct play', remux: 'Remux', transcode: 'Transcode', unknown: 'Unknown' }
const mediaLabel = value => ({ movie: 'Movies', episode: 'Episodes' }[value] || value)
const number = value => Number(value || 0).toLocaleString()
const methodShare = method => summary.value?.totals.watchSeconds ? Math.min(100, Number(summary.value.totals[`${method}Seconds`] || 0) / summary.value.totals.watchSeconds * 100) : 0
let generation = 0
let timer
let applied = null
const isoDay = value => new Date(value).toISOString().slice(0, 10)
function applyPreset () {
  if (preset.value === 'custom') return
  through.value = isoDay(Date.now())
  from.value = isoDay(Date.parse(through.value) - (Number(preset.value) - 1) * 86400000)
}
applyPreset()
const duration = value => `${(Number(value || 0) / 3600).toLocaleString(undefined, { maximumFractionDigits: 2 })} h`
const bytes = value => `${(Number(value || 0) / 1024 ** 3).toLocaleString(undefined, { maximumFractionDigits: 2 })} GiB`
const dateTime = value => value ? new Date(value).toISOString().replace('T', ' ').slice(0, 19) : 'not yet available'
const userName = id => userOptions.value.find(user => Number(user.userId) === id)?.username || `User ${id}`
const dailyPoints = computed(() => {
  if (!summary.value) return []
  const points = []
  const days = new Map(summary.value.daily.map(row => [row.day, row]))
  for (let time = Date.parse(summary.value.period.from); time < Date.parse(summary.value.period.to); time += 86400000) {
    const label = isoDay(time)
    points.push({ time, label, value: Number(days.get(label)?.watchSeconds || 0) / 60 })
  }
  return points
})
function healthPoints (kind) {
  return health.value.buckets.map(bucket => ({ time: Date.parse(bucket.at), label: dateTime(bucket.at), value: bucket[kind][healthMetric.value] / (healthMetric.value === 'cacheBytes' ? 1024 ** 2 : 1) }))
}
function clear () {
  generation++
  summary.value = library.value = health.value = null
  history.value = userOptions.value = []
  nextCursor.value = null
  applied = null
  busy.value = false
}
async function refresh (event) {
  if (!auth.authenticated || (props.admin && !auth.can('statistics.view'))) { clear(); return }
  if (busy.value) return
  const polling = event === 'poll'
  if (polling && !applied) return
  if (!polling && (!from.value || !through.value || from.value > through.value)) { error.value = 'Choose a valid date range.'; return }
  const params = polling ? applied : { from: from.value, to: isoDay(Date.parse(through.value) + 86400000), ...(props.admin && userId.value ? { userId: userId.value } : {}) }
  const current = ++generation
  const token = oblectoClient.accessToken
  busy.value = true
  error.value = ''
  try {
    const scope = props.admin ? 'server' : 'me'
    const [data, sessions, inventory, operations] = await Promise.all([
      oblectoClient.statistics.summary(scope, params),
      oblectoClient.statistics.history(scope, params),
      props.admin ? oblectoClient.statistics.library() : null,
      props.admin ? oblectoClient.statistics.health(params) : null
    ])
    if (current !== generation || token !== oblectoClient.accessToken) return
    summary.value = data
    if (data.users.length) userOptions.value = data.users
    // Keep loaded history pages stable during automatic refresh.
    if (!polling || !nextCursor.value && history.value.length <= 50) {
      history.value = sessions.items
      nextCursor.value = sessions.nextCursor
    }
    library.value = inventory
    health.value = operations
    applied = params
  } catch (failure) {
    if (current === generation) {
      if (failure.response?.status === 403) clear()
      error.value = failure.response?.data?.message || 'Could not load statistics. Try again.'
    }
  } finally { if (current === generation) busy.value = false }
}
async function loadMore () {
  if (busy.value || !nextCursor.value || !applied) return
  const current = generation
  busy.value = true
  try {
    const result = await oblectoClient.statistics.history(props.admin ? 'server' : 'me', { ...applied, cursor: nextCursor.value })
    if (current !== generation) return
    history.value.push(...result.items)
    nextCursor.value = result.nextCursor
  } catch { if (current === generation) error.value = 'Could not load more history.' }
  finally { if (current === generation) busy.value = false }
}
watch(() => auth.authenticated, value => { if (!value) clear() })
watch(() => auth.can('statistics.view'), value => { if (props.admin && !value) clear() })
onMounted(() => { refresh(); timer = setInterval(() => { if (!document.hidden) refresh('poll') }, 30000) })
onBeforeUnmount(() => { clearInterval(timer); clear() })
</script>

<style scoped lang="sass">
.statistics-page
  display: grid
  grid-template-columns: minmax(0, 1fr)
  gap: 24px
  max-width: 1300px
  margin: 0 auto
  min-width: 0
  > *
    min-width: 0
  h1, h2, p
    margin-top: 0
  h1
    margin-bottom: 12px
    font-family: var(--font-display)
    font-size: clamp(2rem, 4vw, 2.8rem)
  h2
    font-family: var(--font-display)
    font-size: 1.15rem
    margin-bottom: 20px
  label
    display: flex
    flex-direction: column
    gap: 8px
    font-size: .85rem
    color: var(--color-text-muted)
    min-width: 0
  input, select, button
    min-height: 44px
    min-width: 0
    box-sizing: border-box
    font: inherit
    padding: 10px 12px
    color: var(--color-text)
    background: var(--color-surface-strong)
    border: 1px solid var(--color-border-control, #555)
    border-radius: 8px
    &:focus-visible
      outline: 2px solid var(--color-brand-turquoise)
      outline-offset: 3px
  button
    cursor: pointer
    font-weight: 600
    &:disabled
      opacity: .55
      cursor: wait
  td, th
    padding: 16px 12px
    border-bottom: 1px solid var(--color-border)
    text-align: left
    font-size: .9rem
  thead th
    color: var(--color-text-muted)
    font-size: .75rem
    font-weight: 500
    white-space: nowrap
  tbody th
    font-weight: 500
    min-width: 140px
  td
    font-variant-numeric: tabular-nums
  tbody tr:last-child > *
    border-bottom: 0
  tbody tr:hover
    background: var(--color-surface-hover)
  table
    width: 100%
    border-collapse: collapse
  .muted
    color: var(--color-text-muted)
    line-height: 1.6
    font-size: .9rem
  > section, .statistics-columns > section
    padding: 24px
    border: 1px solid var(--color-border)
    border-radius: 16px
    background: var(--color-surface)
  .eyebrow
    color: var(--color-brand-turquoise)
    text-transform: uppercase
    letter-spacing: .14em
    font-size: .7rem
    font-weight: 600
    margin-bottom: 12px
.statistics-heading .muted
  margin-bottom: 0
.time-note
  color: var(--color-text-faint)
  font-size: .75rem
  margin: -12px 0 0
.statistics-filters
  display: flex
  align-items: end
  flex-wrap: wrap
  padding: 20px
  border: 1px solid var(--color-border)
  border-radius: 12px
  background: var(--color-surface)
  gap: 16px
  label
    flex: 1 1 150px
  button
    background: var(--color-brand-turquoise)
    color: #102323
    border-color: transparent
    padding-inline: 24px
.statistics-cards
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))
  gap: 16px
  article
    padding: 22px
    background: var(--color-surface)
    border: 1px solid var(--color-border)
    border-radius: 12px
  .primary-metric
    background: linear-gradient(125deg, rgba(104, 224, 220, .12), var(--color-surface))
    border-color: var(--color-brand-turquoise)
    strong
      color: var(--color-brand-turquoise)
  span, small
    display: block
    color: var(--color-text-muted)
    font-size: .8rem
  span
    text-transform: capitalize
  small
    margin-top: 10px
    line-height: 1.5
  strong
    display: block
    font-size: clamp(1.5rem, 3vw, 2.2rem)
    font-weight: 600
    font-variant-numeric: tabular-nums
    margin-top: 12px
    overflow-wrap: anywhere
.statistics-columns
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr))
  gap: 24px
.table-scroll
  overflow: auto
.measurement-notes
  font-size: .8rem
  color: var(--color-text-muted)
  summary
    cursor: pointer
    width: fit-content
  p
    margin: 12px 0 0
.notice, .empty-state
  padding: 20px
  border-radius: 10px
  background: var(--color-surface-strong)
  color: var(--color-text-muted)
  line-height: 1.6
  margin-bottom: 0
.notice-error
  border-left: 3px solid var(--color-brand-coral)
.cell-detail
  display: block
  color: var(--color-text-faint)
  font-size: .75rem
  margin-top: 6px
.method-track
  height: 4px
  max-width: 200px
  margin-top: 10px
  background: var(--color-surface-strong)
  border-radius: 4px
  overflow: hidden
  span
    display: block
    height: 100%
    background: var(--color-brand-turquoise)
.result-badge
  display: inline-block
  padding: 5px 9px
  border-radius: 6px
  background: var(--color-surface-strong)
  font-size: .75rem
  &.is-complete
    color: var(--color-brand-turquoise)
  &.is-failure
    color: var(--color-brand-coral)
.health-selector
  max-width: 300px
  margin: 24px 0
@media (max-width: 600px)
  .statistics-page
    gap: 18px
    > section, .statistics-columns > section
      padding: 16px
  .statistics-filters
    padding: 16px
    gap: 12px
    label
      flex-basis: calc(50% - 12px)
    button
      width: 100%
  .statistics-cards
    grid-template-columns: repeat(2, minmax(0, 1fr))
    gap: 10px
    article
      padding: 16px
</style>
