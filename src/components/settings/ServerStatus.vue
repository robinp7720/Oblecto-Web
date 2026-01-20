<template>
  <div class="server-status">
    <!-- Active Sessions Section -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Active Sessions
        </h2>
        <button
          class="btn"
          @click="refresh"
        >
          <font-awesome-icon icon="sync" /> Refresh
        </button>
      </div>

      <div class="status-grid">
        <div
          v-for="session in sessions"
          :key="session.sessionId"
          class="status-card"
        >
          <div class="card-header">
            <div class="card-title">
              <font-awesome-icon icon="play-circle" />
              <span>{{ getFileName(session.file.path) }}</span>
            </div>
            <span :class="['status-badge', session.state]">{{ session.state }}</span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Session ID:</span>
              <span class="value monospace">{{ session.sessionId.substring(0, 8) }}...</span>
            </div>
            <div class="info-row">
              <span class="label">Output:</span>
              <span class="value">{{ session.output.format }} ({{ session.output.videoCodec }}/{{ session.output.audioCodec }})</span>
            </div>
             <div class="info-row">
              <span class="label">Seek Mode:</span>
              <span class="value">{{ session.seekMode }}</span>
            </div>
            <div class="info-row">
              <span class="label">Destinations:</span>
              <span class="value">{{ session.destinationCount }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="!sessions || sessions.length === 0"
          class="empty-state"
        >
          <font-awesome-icon icon="film" class="empty-icon" />
          <p>No active streaming sessions</p>
        </div>
      </div>
    </div>

    <!-- Connected Clients Section -->
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Connected Clients
        </h2>
      </div>

      <div class="status-grid">
        <div
          v-for="client in clients"
          :key="client.clientId"
          class="status-card"
        >
          <div class="card-header">
            <div class="card-title">
              <font-awesome-icon icon="desktop" />
              <span>{{ client.clientName || 'Unknown Client' }}</span>
            </div>
            <span class="user-badge">
              <font-awesome-icon icon="user" /> {{ client.user.username }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">IP Address:</span>
              <span class="value monospace">{{ formatAddress(client.address) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Connected:</span>
              <span class="value">{{ formatDate(client.connectedAt) }}</span>
            </div>
            
            <div v-if="hasActivity(client)" class="activity-section">
              <div class="divider"></div>
              <div class="activity-title">Now Playing</div>
              <div v-if="client.activity.movie.length > 0" class="activity-item">
                <font-awesome-icon icon="film" /> Movie (ID: {{ client.activity.movie[0].movieId }})
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (client.activity.movie[0].progress * 100) + '%' }"></div>
                </div>
              </div>
               <div v-if="client.activity.series.length > 0" class="activity-item">
                <font-awesome-icon icon="tv" /> Episode
              </div>
            </div>
             <div v-else class="activity-section idle">
               <span class="idle-text">Idle</span>
            </div>
          </div>
        </div>

        <div
          v-if="!clients || clients.length === 0"
          class="empty-state"
        >
          <font-awesome-icon icon="users" class="empty-icon" />
          <p>No clients connected</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faSync from '@fortawesome/fontawesome-free-solid/faSync'
  import faPlayCircle from '@fortawesome/fontawesome-free-solid/faPlayCircle'
  import faDesktop from '@fortawesome/fontawesome-free-solid/faDesktop'
  import faUser from '@fortawesome/fontawesome-free-solid/faUser'
  import faFilm from '@fortawesome/fontawesome-free-solid/faFilm'
  import faTv from '@fortawesome/fontawesome-free-solid/faTv'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'
  import moment from 'moment'

  fontawesome.library.add(faSync, faPlayCircle, faDesktop, faUser, faFilm, faTv)

  export default {
    name: 'ServerStatus',
    components: {
      FontAwesomeIcon
    },
    data () {
      return {
        sessions: [],
        clients: []
      }
    },
    async created () {
      await this.refresh()
    },
    methods: {
      async refresh () {
        try {
          this.sessions = await oblectoClient.status.getSessions()
          this.clients = await oblectoClient.status.getClients()
        } catch (e) {
          console.error('Failed to fetch server status', e)
          this.$notify({
            group: 'system',
            title: 'Error',
            text: 'Failed to fetch server status',
            type: 'error'
          })
        }
      },
      getFileName (path) {
        if (!path) return 'Unknown File'
        return path.split(/[/\\]/).pop()
      },
      formatDate (date) {
        return moment(date).fromNow()
      },
      formatAddress (address) {
        return address.replace(/^::ffff:/, '')
      },
      hasActivity (client) {
        return (client.activity.movie && client.activity.movie.length > 0) || 
               (client.activity.series && client.activity.series.length > 0)
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"

.status-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
  gap: 20px
  margin-top: 15px

.status-card
  background: rgba(255, 255, 255, 0.05)
  border-radius: 8px
  overflow: hidden
  border: 1px solid rgba(255, 255, 255, 0.1)
  transition: transform 0.2s, box-shadow 0.2s

  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)

.card-header
  background: rgba(0, 0, 0, 0.2)
  padding: 12px 15px
  display: flex
  justify-content: space-between
  align-items: center
  border-bottom: 1px solid rgba(255, 255, 255, 0.05)

.card-title
  font-weight: 600
  display: flex
  align-items: center
  gap: 8px
  overflow: hidden
  
  span
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
    max-width: 180px

.card-body
  padding: 15px

.info-row
  display: flex
  justify-content: space-between
  margin-bottom: 8px
  font-size: 0.9em

  .label
    color: #aaa

  .value
    color: #eee
    font-weight: 500
    
    &.monospace
      font-family: monospace
      font-size: 0.9em

.status-badge
  font-size: 0.75em
  padding: 2px 8px
  border-radius: 12px
  text-transform: uppercase
  font-weight: bold
  
  &.streaming, &.playing
    background: rgba(46, 204, 113, 0.2)
    color: #2ecc71
    
  &.idle, &.paused
    background: rgba(241, 196, 15, 0.2)
    color: #f1c40f
    
  &.transcoding
    background: rgba(52, 152, 219, 0.2)
    color: #3498db

.user-badge
  font-size: 0.85em
  color: #ccc
  display: flex
  align-items: center
  gap: 5px

.empty-state
  grid-column: 1 / -1
  padding: 40px
  text-align: center
  color: #666
  background: rgba(0, 0, 0, 0.1)
  border-radius: 8px
  
  .empty-icon
    font-size: 2em
    margin-bottom: 10px
    opacity: 0.5
    
  p
    margin: 0

.activity-section
  margin-top: 10px
  
  &.idle
    text-align: center
    padding-top: 5px
    
    .idle-text
      color: #555
      font-size: 0.85em
      font-style: italic

.divider
  height: 1px
  background: rgba(255, 255, 255, 0.1)
  margin: 10px 0

.activity-title
  font-size: 0.8em
  text-transform: uppercase
  color: #888
  margin-bottom: 8px
  letter-spacing: 0.5px

.activity-item
  font-size: 0.9em
  display: flex
  flex-direction: column
  gap: 5px

.progress-bar
  height: 4px
  background: rgba(255, 255, 255, 0.1)
  border-radius: 2px
  overflow: hidden
  margin-top: 2px
  
  .progress-fill
    height: 100%
    background: #e74c3c
    transition: width 0.3s ease

</style>