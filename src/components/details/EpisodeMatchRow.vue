<template>
  <details class="match-row">
    <summary>
      <span class="episode-name"><span>{{ title }}</span><small>{{ row.reason }}</small></span>
      <span><small class="mobile-label">Library</small>{{ localLabel }}</span>
      <span><small class="mobile-label">TMDB</small>{{ catalogLabel }}</span>
      <span
        class="match-status"
        :class="row.status"
      >{{ statusLabel }}</span>
    </summary>
    <div class="match-inspection">
      <p>{{ row.reason }}. Season and episode numbers are displayed in each source’s order.</p>
      <dl>
        <div><dt>Library TMDB ID</dt><dd>{{ row.local?.tmdbid || 'Not set' }}</dd></div>
        <div><dt>Catalogue TMDB ID</dt><dd>{{ row.catalog?.tmdbid || 'No match' }}</dd></div>
        <div><dt>Library files</dt><dd>{{ row.local?.Files?.length || 0 }}</dd></div>
        <div><dt>TMDB air date</dt><dd>{{ row.catalog?.airDate || 'Unannounced' }}</dd></div>
      </dl>
      <RouterLink
        v-if="row.local"
        :to="{ name: 'EpisodeInfo', params: { episodeId: row.local.id } }"
      >
        Open library episode →
      </RouterLink>
    </div>
  </details>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ row: { type: Object, required: true }, hideTitles: Boolean })
const localLabel = computed(() => props.row.local ? `S${props.row.local.airedSeason ?? '?'} E${props.row.local.airedEpisodeNumber ?? '?'}` : '—')
const catalogLabel = computed(() => props.row.catalog ? `S${props.row.catalog.season} E${props.row.catalog.number}` : '—')
const title = computed(() => props.hideTitles ? `Episode ${props.row.local?.airedEpisodeNumber ?? props.row.catalog?.number ?? '—'}` : props.row.local?.episodeName || props.row.catalog?.name || 'Untitled episode')
const statusLabel = computed(() => ({ matched: 'Matched by ID', absent: 'Not in library', review: 'Needs review', upcoming: 'Upcoming', unscheduled: 'Unannounced' })[props.row.status])
</script>
<style scoped lang="sass">
.match-row
  border-bottom: 1px solid var(--color-border)
  summary
    display: grid
    grid-template-columns: minmax(0, 1fr) 85px 85px 125px
    align-items: center
    gap: 16px
    padding: 18px 12px
    cursor: pointer
    list-style: none
    font-size: .85rem
    &::-webkit-details-marker
      display: none
    &:hover
      background: var(--color-surface)
    &:focus-visible
      outline: 2px solid var(--color-accent)
      outline-offset: -2px
  .episode-name
    font-weight: 600
    overflow-wrap: anywhere
    small
      display: block
      margin-top: 6px
      color: var(--color-text-muted)
      font-size: .75rem
      font-weight: 400
.match-status
  font-size: .75rem
  color: var(--color-text-muted)
  &.matched
    color: var(--color-brand-turquoise)
  &::after
    content: ' +'
[open] > summary .match-status::after
  content: ' −'
.mobile-label
  display: none
.match-inspection
  padding: 0 12px 20px
  color: var(--color-text-muted)
  font-size: .8rem
  line-height: 1.6
  dl
    display: flex
    gap: 16px 32px
    flex-wrap: wrap
  dd
    margin: 4px 0 0
    color: var(--color-text)
  a
    display: inline-block
    padding: 8px 0
    color: var(--color-brand-turquoise)
@media (max-width: 650px)
  .match-row summary
    grid-template-columns: 1fr 1fr
    gap: 12px
    .episode-name
      grid-column: 1 / -1
    .match-status
      grid-column: 1 / -1
  .mobile-label
    display: inline
    margin-right: 10px
    color: var(--color-text-muted)
</style>
