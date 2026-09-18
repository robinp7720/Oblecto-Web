<template>
  <div>
    <section class="settings-card">
      <h2 class="settings-section-title">
        Library setup
      </h2>
      <p
        v-if="libraries.error"
        role="status"
      >
        {{ libraries.error }} <button
          class="btn"
          @click="loadLibraries"
        >
          Retry libraries
        </button>
      </p>
      <p v-else-if="libraries.loading">
        Loading libraries…
      </p>
      <template v-else>
        <p>{{ libraries.movies }} movie {{ libraries.movies === 1 ? 'folder' : 'folders' }} · {{ libraries.tvshows }} TV show {{ libraries.tvshows === 1 ? 'folder' : 'folders' }}</p>
        <p v-if="!libraries.movies && !libraries.tvshows">
          Add a library folder to start building your collection.
        </p>
      </template>
      <RouterLink :to="{ name: 'SettingsLibraries' }">
        Manage libraries
      </RouterLink>
    </section>
    <section class="settings-card">
      <h2 class="settings-section-title">
        Needs attention
      </h2>
      <p
        v-if="problems.error"
        role="status"
      >
        {{ problems.error }} <button
          class="btn"
          @click="loadProblems"
        >
          Retry problem files
        </button>
      </p>
      <p v-else-if="problems.loading">
        Checking problem files…
      </p>
      <p v-else>
        {{ problems.count ? `${problems.count} files could not be identified or read.` : 'No problem files need attention.' }}
      </p>
      <RouterLink :to="{ name: 'ProblematicFiles' }">
        Review problem files
      </RouterLink>
    </section>
    <MaintenanceJobs
      :jobs="jobs"
      :error="jobsError"
      :loading="jobsLoading"
    />
    <RouterLink :to="{ name: 'SettingsMaintenance' }">
      Run maintenance
    </RouterLink>
  </div>
</template>
<script setup>
import { reactive, onMounted } from 'vue'
import oblectoClient from '@/oblectoClient'
import { useMaintenanceJobs } from '@/composables/useMaintenanceJobs'
import MaintenanceJobs from './MaintenanceJobs.vue'
const { jobs, jobsError, jobsLoading } = useMaintenanceJobs()
const libraries = reactive({ loading: true, error: '', movies: 0, tvshows: 0 })
const problems = reactive({ loading: true, error: '', count: 0 })
async function loadLibraries () {
  libraries.loading = true
  try {
    const config = await oblectoClient.settings.getAll()
    libraries.movies = config.movies?.directories?.length || 0
    libraries.tvshows = config.tvshows?.directories?.length || 0
    libraries.error = ''
  } catch { libraries.error = 'Could not load library setup.' }
  finally { libraries.loading = false }
}
async function loadProblems () {
  problems.loading = true
  try { problems.count = (await oblectoClient.files.getProblematic()).length; problems.error = '' }
  catch { problems.error = 'Could not check problem files.' }
  finally { problems.loading = false }
}
onMounted(() => { loadLibraries(); loadProblems() })
</script>
