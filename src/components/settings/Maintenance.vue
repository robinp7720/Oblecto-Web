<template>
  <div class="maintenance">
    <div class="settings-card">
      <h3>Library indexing</h3>
      <div class="actions-group">
        <button
          class="btn"
          :disabled="isActive('scan', 'all')"
          @click="index('all')"
        >
          <font-awesome-icon icon="sync" /> Scan all libraries
        </button>
        <button
          class="btn"
          :disabled="isActive('scan', 'series')"
          @click="index('series')"
        >
          <font-awesome-icon icon="tv" /> Scan TV shows
        </button>
        <button
          class="btn"
          :disabled="isActive('scan', 'movies')"
          @click="index('movies')"
        >
          <font-awesome-icon icon="film" /> Scan movies
        </button>
      </div>
    </div>

    <div class="settings-card">
      <h3>Library cleanup</h3>
      <p class="settings-description">
        Remove database entries with missing files or links. Media files on disk are not deleted.
      </p>
      <div class="actions-group">
        <button
          class="btn btn-destructive"
          :disabled="isActive('clean', 'files')"
          @click="clean('files')"
        >
          <font-awesome-icon icon="broom" /> Clean up files database
        </button>
        <button
          class="btn btn-destructive"
          :disabled="isActive('clean', 'episodes')"
          @click="clean('episodes')"
        >
          <font-awesome-icon icon="broom" /> Cleanup episodes without linked files
        </button>
        <button
          class="btn btn-destructive"
          :disabled="isActive('clean', 'movies')"
          @click="clean('movies')"
        >
          <font-awesome-icon icon="broom" /> Cleanup movies without linked files
        </button>
        <button
          class="btn btn-destructive"
          :disabled="isActive('clean', 'series')"
          @click="clean('series')"
        >
          <font-awesome-icon icon="broom" /> Remove Series without episodes
        </button>
      </div>
    </div>

    <div class="settings-card">
      <h3>Artwork</h3>
      <div class="actions-group">
        <button
          class="btn"
          :disabled="isActive('update_artwork', 'series')"
          @click="DownloadTVShowArt"
        >
          <font-awesome-icon icon="image" /> Download artwork for TV shows and Episodes
        </button>
        <button
          class="btn"
          :disabled="isActive('update_artwork', 'movies')"
          @click="DownloadMovieArt"
        >
          <font-awesome-icon icon="image" /> Download artwork for Movies
        </button>
      </div>
    </div>

    <div class="settings-card">
      <h3>Metadata updates</h3>
      <div class="actions-group">
        <button
          class="btn"
          :disabled="isActive('update_metadata', 'episodes')"
          @click="update('episodes')"
        >
          <font-awesome-icon icon="sync" /> Update episode entries
        </button>
        <button
          class="btn"
          :disabled="isActive('update_metadata', 'movies')"
          @click="update('movies')"
        >
          <font-awesome-icon icon="sync" /> Update movie entries
        </button>
        <button
          class="btn"
          :disabled="isActive('update_metadata', 'series')"
          @click="update('series')"
        >
          <font-awesome-icon icon="sync" /> Update series entries
        </button>
        <button
          class="btn"
          :disabled="isActive('update_metadata', 'files')"
          @click="update('files')"
        >
          <font-awesome-icon icon="sync" /> Update file entries
        </button>
      </div>
    </div>

    <MaintenanceJobs
      :jobs="jobs"
      :error="jobsError"
      :loading="jobsLoading"
    />

    <!-- One status line for the page: whichever job was last asked for, the
         answer appears in the same place, pinned in view. -->
    <div
      class="status-bar"
      :class="{ idle: status.status === 'idle' }"
    >
      <SaveState :state="status" />
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faSync from '@fortawesome/fontawesome-free-solid/faSync'
  import faTv from '@fortawesome/fontawesome-free-solid/faTv'
  import faFilm from '@fortawesome/fontawesome-free-solid/faFilm'
  import faBroom from '@fortawesome/fontawesome-free-solid/faBroom'
  import faImage from '@fortawesome/fontawesome-free-solid/faImage'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'
  import SaveState from '@/components/system/SaveState.vue'
  import { useMaintenanceJobs } from '@/composables/useMaintenanceJobs'
  import MaintenanceJobs from './MaintenanceJobs.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'

  fontawesome.library.add(faSync, faTv, faFilm, faBroom, faImage)

  // Cleanups delete database rows, and watch progress on a removed title is
  // not reattached if the file later comes back, so each asks first.
  const CLEANUPS = {
    files: {
      title: 'Clean up the files database?',
      message: 'File entries whose file is gone from disk, or that no title uses, are removed. Nothing on disk is deleted.'
    },
    episodes: {
      title: 'Remove episodes without files?',
      message: 'Episodes with no file left are removed from the library, along with their watch progress. Nothing on disk is deleted.'
    },
    movies: {
      title: 'Remove movies without files?',
      message: 'Movies with no file left are removed from the library, along with their watch progress. Nothing on disk is deleted.'
    },
    series: {
      title: 'Remove shows without episodes?',
      message: 'TV shows with no episodes left are removed from the library. Nothing on disk is deleted.'
    }
  }

  const LABELS = {
    all: 'Full',
    series: 'Series',
    movies: 'Movie',
    episodes: 'Episode',
    files: 'File'
  }

  export default {
    name: 'Maintenance',
    components: {
      FontAwesomeIcon,
      SaveState,
      MaintenanceJobs
    },
    setup () { return useMaintenanceJobs() },
    data () {
      return {
        submitting: {},
        status: createSaveState()
      }
    },
    methods: {
      // These jobs run on the server and report progress over the socket; all
      // the page can honestly say is that the request was accepted.
      isActive (action, target) {
        return this.submitting[action + ':' + target] || this.jobs.some(job => job.action === action && (job.target === target || job.target === 'all') && !job.finishedAt)
      },
      async triggerMaintenance (action, target, label) {
        if (this.isActive(action, target)) return
        this.submitting[action + ':' + target] = true
        await this.status.run(
          async () => {
            const result = await oblectoClient.system.triggerMaintenance(action, target)
            if (result.job) this.jobs = [result.job, ...this.jobs.filter(job => job.id !== result.job.id)]
          },
          {
            busy: 'Starting…',
            ok: `${label} accepted. Follow its progress below.`,
            error: `Could not start ${label.toLowerCase()}`
          }
        )
        this.submitting[action + ':' + target] = false
        this.refreshJobs()
      },
      async DownloadTVShowArt () {
        await this.triggerMaintenance('update_artwork', 'series', 'TV artwork download')
      },

      async DownloadMovieArt () {
        await this.triggerMaintenance('update_artwork', 'movies', 'Movie artwork download')
      },
      async index (type) {
        await this.triggerMaintenance('scan', type, `${LABELS[type]} scan`)
      },
      async clean (type) {
        if (this.isActive('clean', type)) return
        if (!await confirm({ ...CLEANUPS[type], confirmLabel: 'Run cleanup', destructive: true })) return
        await this.triggerMaintenance('clean', type, `${LABELS[type]} cleanup`)
      },
      async update (type) {
        await this.triggerMaintenance('update_metadata', type, `${LABELS[type]} metadata update`)
      }
    }
  }
</script>
