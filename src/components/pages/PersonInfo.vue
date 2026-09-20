<template>
  <div class="detail-page person-page">
    <div
      v-if="loading"
      class="detail-state"
      role="status"
    >
      Loading person…
    </div>
    <div
      v-else-if="error"
      class="detail-state"
      role="alert"
    >
      <h1>Person unavailable</h1><p>{{ error }}</p><button
        class="detail-button"
        @click="load"
      >
        Try again
      </button>
    </div>
    <template v-else-if="person">
      <section class="person-hero">
        <img
          v-if="!imageFailed"
          :key="portrait"
          class="person-backdrop"
          :class="{ loaded: backdropLoaded }"
          :src="portrait"
          alt=""
          @load="backdropLoaded = true"
        >
        <div class="person-shade" />
        <RouterLink
          :to="{ name: 'Search' }"
          class="back-link"
        >
          ‹ Search
        </RouterLink>
        <div class="person-layout">
          <div class="person-portrait">
            <img
              v-if="!imageFailed"
              :src="portrait"
              :alt="`${person.name} portrait`"
              @error="imageFailed = true"
            >
            <span v-else>{{ initials }}</span>
          </div>
          <div class="person-headline motion-stagger">
            <span class="eyebrow">PERSON · YOUR OBLECTO LIBRARY</span>
            <h1>{{ person.name }}</h1>
            <p
              v-if="facts"
              class="person-facts"
            >
              {{ facts }}
            </p>
          </div>
          <div class="person-bio">
            <p
              class="biography"
              :class="{ clamped: longBiography && !bioExpanded }"
            >
              {{ person.biography || 'No biography is available yet.' }}
            </p>
            <button
              v-if="longBiography"
              class="bio-toggle"
              :aria-expanded="bioExpanded"
              @click="bioExpanded = !bioExpanded"
            >
              {{ bioExpanded ? 'Show less' : 'Read more' }}
            </button>
          </div>
        </div>
      </section>

      <div class="person-content">
        <CreditGrid
          title="Movies"
          type="movie"
          :credits="person.credits.movies"
          :person="person"
        />
        <CreditGrid
          title="TV Shows"
          type="series"
          :credits="person.credits.series"
          :person="person"
        />
        <CreditGrid
          title="Guest appearances"
          type="episode"
          :credits="guestEpisodes"
          :person="person"
        />
        <p
          v-if="!hasCredits"
          class="detail-notice"
        >
          No titles featuring this person are currently in your library.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import oblectoClient from '@/oblectoClient'
import CreditGrid from '@/components/details/CreditGrid.vue'
import { describeError } from '@/composables/useSaveState'
import '@/assets/sass/details.sass'

// Biographies run from a sentence to several paragraphs; past this many
// characters one is collapsed so the credits stay in reach.
const BIO_CLAMP_CHARS = 420

const route = useRoute()
const store = useStore()
const person = ref(null)
const loading = ref(false)
const error = ref('')
const imageFailed = ref(false)
const backdropLoaded = ref(false)
const bioExpanded = ref(false)
const portrait = computed(() => `${store.state.host}/person/${person.value?.id}/profile?size=large`)
const initials = computed(() => (person.value?.name || '').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase())
const longBiography = computed(() => (person.value?.biography || '').length > BIO_CLAMP_CHARS)

// Dates arrive as plain YYYY-MM-DD; parsed by hand so they stay on the day
// they name rather than shifting with the viewer's timezone.
function parseDate (value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''))
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null
}
function formatDate (date) {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}
function yearsBetween (from, to) {
  const years = to.getFullYear() - from.getFullYear()
  const months = to.getMonth() - from.getMonth()
  return months < 0 || (months === 0 && to.getDate() < from.getDate()) ? years - 1 : years
}

const lifespan = computed(() => {
  const born = parseDate(person.value?.birthday)
  const died = parseDate(person.value?.deathday)

  if (born && died) return `${formatDate(born)} – ${formatDate(died)} (aged ${yearsBetween(born, died)})`
  if (born) return `Born ${formatDate(born)} (aged ${yearsBetween(born, new Date())})`
  if (died) return `Died ${formatDate(died)}`
  return null
})
const facts = computed(() => [person.value?.knownForDepartment, lifespan.value, person.value?.placeOfBirth].filter(Boolean).join(' · '))
const regularSeriesIds = computed(() => new Set((person.value?.credits.series || []).map(entry => entry.item.id)))
const guestEpisodes = computed(() => (person.value?.credits.episodes || []).filter(entry => !regularSeriesIds.value.has(entry.item.SeriesId)))
const hasCredits = computed(() => Boolean(person.value?.credits.movies?.length || person.value?.credits.series?.length || guestEpisodes.value.length))

async function load () {
  loading.value = true
  error.value = ''
  imageFailed.value = false
  backdropLoaded.value = false
  bioExpanded.value = false
  try {
    person.value = await oblectoClient.people.getInfo(route.params.personId)
  } catch (reason) {
    error.value = describeError(reason, 'Could not load this person')
  } finally {
    loading.value = false
  }
}
watch(() => route.params.personId, load, { immediate: true })
</script>

<style scoped lang="sass">
.person-hero
  position: relative
  isolation: isolate
  overflow: hidden
  padding: 28px var(--page-gutter) 56px
  background: var(--color-bg-1)
// The profile photo doubles as the backdrop, blurred well past recognition, so
// the hero picks up the person's colours the way title pages pick up fanart.
.person-backdrop, .person-shade
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  z-index: -1
.person-backdrop
  object-fit: cover
  object-position: center 20%
  filter: blur(60px) saturate(1.4)
  transform: scale(1.2)
  opacity: 0
  transition: opacity var(--motion-slow) var(--ease-out)
  &.loaded
    opacity: 0.4
.person-shade
  background: linear-gradient(0deg, var(--color-bg-1), transparent 70%), linear-gradient(90deg, rgba(20, 20, 20, 0.94), rgba(20, 20, 20, 0.72) 55%, rgba(20, 20, 20, 0.35))
.back-link
  display: inline-block
  color: var(--color-text-muted)
  font-size: 0.875rem
  padding: 8px 0
  margin-bottom: 40px
  &:hover
    color: var(--color-brand-turquoise)
.person-layout
  display: grid
  grid-template-columns: clamp(160px, 18vw, 240px) minmax(0, 1fr)
  // The portrait spans both rows, so it is usually the taller side. The slack
  // it leaves goes to the second row alone, keeping the biography tucked under
  // the name instead of both rows drifting apart.
  grid-template-rows: auto 1fr
  grid-template-areas: "portrait headline" "portrait bio"
  column-gap: 48px
  row-gap: 26px
.person-portrait
  grid-area: portrait
  align-self: start
  display: grid
  place-items: center
  aspect-ratio: 2 / 3
  border-radius: 6px
  overflow: hidden
  background: var(--color-brand-blue)
  box-shadow: var(--shadow-strong)
  font-size: 3rem
  font-weight: 700
  img
    width: 100%
    height: 100%
    object-fit: cover
.person-headline
  grid-area: headline
  min-width: 0
.eyebrow
  display: block
  color: var(--color-brand-turquoise)
  font-size: 0.7rem
  font-weight: 700
  letter-spacing: 0.2em
h1
  margin: 18px 0
  font-size: clamp(2.5rem, 5vw, 5.5rem)
  line-height: 1.05
  letter-spacing: -0.045em
  overflow-wrap: anywhere
.person-facts
  margin: 0
  color: var(--color-text-muted)
  font-size: 0.95rem
  line-height: 1.6
.person-bio
  grid-area: bio
  align-self: start
  min-width: 0
.biography
  margin: 0
  max-width: 70ch
  line-height: 1.75
  color: #ddd
  &.clamped
    display: -webkit-box
    -webkit-line-clamp: 6
    -webkit-box-orient: vertical
    overflow: hidden
.bio-toggle
  margin-top: 10px
  padding: 0
  border: 0
  background: none
  color: var(--color-brand-turquoise)
  font-size: 0.875rem
  font-weight: 700
  cursor: pointer
  &:hover
    text-decoration: underline
.person-content
  padding: 36px var(--page-gutter) 80px
  display: grid
  gap: 42px
@media (max-width: 680px)
  .person-hero
    padding-bottom: 36px
  .person-layout
    grid-template-columns: 110px minmax(0, 1fr)
    grid-template-rows: auto auto
    grid-template-areas: "portrait headline" "bio bio"
    column-gap: 20px
    row-gap: 20px
  .back-link
    margin-bottom: 28px
  h1
    margin: 10px 0
</style>
