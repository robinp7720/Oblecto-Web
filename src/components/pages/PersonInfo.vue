<template>
  <div class="person-page">
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
          <div>
            <span class="eyebrow">PERSON · YOUR OBLECTO LIBRARY</span>
            <h1>{{ person.name }}</h1>
            <p
              v-if="facts"
              class="person-facts"
            >
              {{ facts }}
            </p>
            <p class="biography">
              {{ person.biography || 'No biography is available yet.' }}
            </p>
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

const route = useRoute()
const store = useStore()
const person = ref(null)
const loading = ref(false)
const error = ref('')
const imageFailed = ref(false)
const portrait = computed(() => `${store.state.host}/person/${person.value?.id}/profile?size=large`)
const initials = computed(() => (person.value?.name || '').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase())
const facts = computed(() => [person.value?.knownForDepartment, person.value?.birthday, person.value?.placeOfBirth].filter(Boolean).join(' · '))
const regularSeriesIds = computed(() => new Set((person.value?.credits.series || []).map(entry => entry.item.id)))
const guestEpisodes = computed(() => (person.value?.credits.episodes || []).filter(entry => !regularSeriesIds.value.has(entry.item.SeriesId)))
const hasCredits = computed(() => Boolean(person.value?.credits.movies?.length || person.value?.credits.series?.length || guestEpisodes.value.length))

async function load () {
  loading.value = true
  error.value = ''
  imageFailed.value = false
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
  padding: 28px var(--page-gutter) 56px
  background: linear-gradient(135deg, var(--color-bg-1), var(--color-surface))
.person-layout
  display: grid
  grid-template-columns: minmax(180px, 280px) minmax(0, 760px)
  align-items: center
  gap: 48px
.person-portrait
  display: grid
  place-items: center
  aspect-ratio: 2 / 3
  border-radius: 8px
  overflow: hidden
  background: var(--color-brand-blue)
  font-size: 3rem
  font-weight: 700
  img
    width: 100%
    height: 100%
    object-fit: cover
h1
  margin: 16px 0
  font-size: clamp(2.5rem, 6vw, 5rem)
.person-facts
  color: var(--color-text-muted)
.biography
  max-width: 70ch
  line-height: 1.75
.person-content
  padding: 36px var(--page-gutter) 80px
  display: grid
  gap: 42px
@media (max-width: 680px)
  .person-layout
    grid-template-columns: 110px minmax(0, 1fr)
    gap: 22px
  .biography
    grid-column: 1 / -1
</style>
