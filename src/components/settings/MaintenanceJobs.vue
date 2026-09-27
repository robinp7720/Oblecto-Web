<template>
  <section
    class="settings-card"
    aria-label="Maintenance jobs"
  >
    <h2 class="settings-section-title">
      Maintenance jobs
    </h2>
    <p class="settings-description">
      History is kept until the server restarts.
    </p>
    <p
      v-if="error"
      role="status"
    >
      {{ error }}
    </p>
    <p
      v-else-if="loading"
      role="status"
    >
      Loading jobs…
    </p>
    <p v-else-if="!jobs.length">
      No maintenance jobs in this server session.
    </p>
    <!-- One announcement when a job starts or ends, rather than every line
         re-announcing its progress on each two-second poll. -->
    <p
      class="sr-only"
      role="status"
    >
      {{ summary }}
    </p>
    <ul class="maintenance-jobs">
      <li
        v-for="job in jobs"
        :key="job.id"
      >
        <strong>{{ actionLabels[job.action] || job.action }} · {{ targetLabels[job.target] || job.target }}</strong>
        <p>
          {{ job.state }}<span v-if="job.discovering"> · Discovering work…</span><span v-if="job.total"> · {{ job.completed }} completed, {{ job.failed }} failed / {{ job.total }} tasks discovered</span>
        </p>
        <time :datetime="job.createdAt">{{ new Date(job.createdAt).toLocaleString() }}</time>
        <p
          v-if="job.error"
          class="form-error"
        >
          {{ job.error }} <RouterLink :to="{ name: 'ProblematicFiles' }">
            Review problem files
          </RouterLink>
        </p>
      </li>
    </ul>
  </section>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ jobs: { type: Array, required: true }, error: { type: String, default: '' }, loading: Boolean })
const actionLabels = { scan: 'Library scan', clean: 'Library cleanup', update_metadata: 'Metadata update', update_artwork: 'Artwork download' }
const targetLabels = { all: 'All libraries', series: 'TV shows', tvshows: 'TV shows', episodes: 'Episodes', movies: 'Movies', files: 'Files' }
const summary = computed(() => {
  const running = props.jobs.filter(job => !job.finishedAt).length
  return running ? `${running} maintenance ${running === 1 ? 'job' : 'jobs'} running` : props.jobs.length ? 'No maintenance jobs running' : ''
})
</script>
