<template>
  <div class="wrapper federation-settings">
    <p
      v-if="error"
      role="alert"
      class="form-error"
    >
      {{ error }}
    </p>
    <p
      v-if="notice"
      role="status"
    >
      {{ notice }}
    </p>
    <fieldset
      class="settings-fields"
      :disabled="!ready || busy"
    >
      <section class="settings-card">
        <h2 class="settings-section-title">
          Federation
        </h2>
        <p class="settings-description">
          Pair trusted Oblecto servers to share both local libraries. Each server streams its own media. Authorized peers can access your whole local library.
        </p>
        <label class="checkbox-container">
          <input
            id="setting-federation-enable"
            v-model="config.enable"
            type="checkbox"
          >
          Enable federation
        </label>
        <div class="resize-grid">
          <div
            v-for="field in connectionFields"
            :key="field.key"
            class="form-group"
          >
            <label :for="`setting-federation-${field.key}`">{{ field.label }}</label>
            <input
              :id="`setting-federation-${field.key}`"
              v-model="config[field.key]"
              :type="field.type || 'text'"
              :aria-describedby="`federation-error-${field.key}`"
            >
            <p
              :id="`federation-error-${field.key}`"
              class="form-error"
            >
              {{ fields[`federation.${field.key}`] }}
            </p>
          </div>
        </div>
        <button
          class="btn"
          type="button"
          @click="save"
        >
          Save and apply
        </button>
        <p
          v-if="health.error"
          role="alert"
          class="form-error"
        >
          Saved settings could not be activated: {{ health.error }}
        </p>
        <p>Listeners: {{ health.running ? 'Running' : 'Stopped' }}</p>
      </section>

      <section class="settings-card">
        <h2>Identity and setup</h2>
        <p>Enter this server’s reachable hostname above, then prepare its identity. Existing keys and certificates are preserved. Both servers’ metadata and media ports must be reachable.</p>
        <button
          class="btn"
          type="button"
          @click="setup"
        >
          Prepare identity
        </button>
        <p v-if="localIdentity">
          Server ID: <code>{{ localIdentity.uuid }}</code>
        </p>
        <details v-if="localIdentity">
          <summary>Public identity</summary><pre>{{ localIdentity.publicKey }}</pre>
        </details>
      </section>

      <section
        id="setting-federation-pairing"
        class="settings-card"
      >
        <h2>Pair servers</h2>
        <p>Create an invitation and paste it into the other server. Invitations expire after ten minutes and authorize mutual sharing. Treat an invitation as a temporary password.</p>
        <button
          class="btn"
          type="button"
          :disabled="!health.running"
          @click="createInvitation"
        >
          Create invitation
        </button>
        <div
          v-if="invitation"
          class="form-group"
        >
          <label for="federation-invitation">Invitation — expires {{ formatDate(invitation.expires) }}</label>
          <textarea
            id="federation-invitation"
            :value="invitation.invitation"
            readonly
            rows="4"
          />
          <button
            class="btn"
            type="button"
            @click="revokeInvitation"
          >
            Revoke invitation
          </button>
        </div>
        <div class="form-group">
          <label for="federation-accept">Invitation from another server</label>
          <textarea
            id="federation-accept"
            v-model="incoming"
            rows="4"
            autocomplete="off"
          />
          <button
            class="btn"
            type="button"
            :disabled="!incoming.trim() || !health.running"
            @click="pair"
          >
            Pair and share libraries
          </button>
        </div>
        <div
          v-for="pairing in health.pairings || []"
          :key="pairing.id"
          class="setting-row"
        >
          <p>{{ pairing.uuid }}: {{ pairing.state }}<span v-if="pairing.error"> — {{ pairing.error }}</span></p>
          <button
            v-if="['pending', 'prepared'].includes(pairing.state)"
            class="btn"
            type="button"
            @click="cancelPairing(pairing.id)"
          >
            Cancel pairing
          </button>
        </div>
      </section>

      <section
        id="setting-federation-peers"
        class="settings-card"
      >
        <h2>Peers and synchronization</h2>
        <p v-if="!health.peers?.length">
          No peers configured.
        </p>
        <article
          v-for="peer in health.peers || []"
          :key="peer.id"
          class="peer-card"
        >
          <h3>{{ peer.name }}</h3>
          <p>{{ peer.address }} · {{ peer.state }}</p>
          <p>Last synchronized: {{ formatDate(peer.lastSuccess) }} · Files: {{ peer.count ?? '—' }}</p>
          <p v-if="peer.retryAt">
            Next attempt: {{ formatDate(peer.retryAt) }}
          </p>
          <p
            v-if="peer.error"
            class="form-error"
          >
            {{ peer.error }}
          </p>
          <div class="peer-actions">
            <button
              class="btn"
              type="button"
              @click="action(peer.id, 'test')"
            >
              Test connection
            </button>
            <button
              class="btn"
              type="button"
              :disabled="peer.state === 'syncing' || !peer.enabled"
              @click="action(peer.id, 'sync')"
            >
              Sync now
            </button>
            <button
              class="btn"
              type="button"
              @click="action(peer.id, 'reconnect')"
            >
              Reconnect
            </button>
            <button
              class="btn"
              type="button"
              @click="togglePeer(peer)"
            >
              {{ peer.enabled ? 'Disconnect' : 'Enable' }}
            </button>
            <button
              class="btn"
              type="button"
              @click="editPeer(peer.id)"
            >
              Edit
            </button>
            <button
              class="btn"
              type="button"
              @click="removing = peer.id"
            >
              Remove peer
            </button>
          </div>
          <div
            v-if="removing === peer.id"
            class="form-group"
          >
            <p>Remove this peer and revoke its paired access?</p>
            <label><input
              v-model="purge"
              type="checkbox"
            > Also remove its imported file records. Watch history is retained.</label>
            <button
              class="btn"
              type="button"
              @click="removePeer(peer.id)"
            >
              Confirm removal
            </button>
            <button
              class="btn"
              type="button"
              @click="removing = ''"
            >
              Cancel
            </button>
          </div>
        </article>
        <details :open="editing">
          <summary>Manual peer configuration</summary>
          <p>For existing installations, configure an outbound peer and authorize this server’s public key on the remote server.</p>
          <div class="resize-grid">
            <div
              v-for="field in peerFields"
              :key="field.key"
              class="form-group"
            >
              <label :for="`federation-peer-${field.key}`">{{ field.label }}</label>
              <input
                :id="`federation-peer-${field.key}`"
                v-model="peerDraft[field.key]"
                :type="field.type || 'text'"
                :disabled="field.key === 'id' && editing"
              >
            </div>
          </div>
          <button
            class="btn"
            type="button"
            @click="savePeer"
          >
            Save peer
          </button>
          <button
            v-if="editing"
            class="btn"
            type="button"
            @click="resetPeer"
          >
            Cancel edit
          </button>
          <h3>Authorized incoming clients</h3>
          <div
            v-for="(client, id) in config.clients"
            :key="id"
            class="setting-row"
          >
            <span>{{ id }}</span><button
              class="btn"
              type="button"
              @click="revokeClient(id)"
            >
              Revoke access
            </button>
          </div>
          <label for="federation-client-id">Client server ID</label><input
            id="federation-client-id"
            v-model="clientId"
          >
          <label for="federation-client-key">Public key path on this server</label><input
            id="federation-client-key"
            v-model="clientKey"
          >
          <button
            class="btn"
            type="button"
            @click="addClient"
          >
            Authorize client
          </button>
        </details>
      </section>
    </fieldset>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import oblecto from '@/oblectoClient'

const config = ref({ enable: false, servers: {}, clients: {} })
const health = ref({ peers: [], pairings: [] })
const ready = ref(false)
const busy = ref(false)
const error = ref('')
const notice = ref('')
const fields = ref({})
const localIdentity = ref(null)
const invitation = ref(null)
const incoming = ref('')
const removing = ref('')
const purge = ref(false)
const editing = ref(false)
const clientId = ref('')
const clientKey = ref('')
const emptyPeer = () => ({ id: '', name: '', address: '', ca: '', dataPort: 9131, mediaPort: 9132, enabled: true })
const peerDraft = ref(emptyPeer())
let timer
let disposed = false
const connectionFields = [
  { key: 'address', label: 'Reachable hostname or IP address' },
  { key: 'dataPort', label: 'Data port', type: 'number' },
  { key: 'mediaPort', label: 'Media port', type: 'number' },
  { key: 'key', label: 'Private key path' },
  { key: 'cert', label: 'TLS certificate path' },
  { key: 'syncIntervalMs', label: 'Sync interval (milliseconds)', type: 'number' }
]
const peerFields = [
  { key: 'id', label: 'Peer identifier (immutable)' }, { key: 'name', label: 'Display name' },
  { key: 'address', label: 'Hostname or IP address' }, { key: 'ca', label: 'Trusted certificate path' },
  { key: 'dataPort', label: 'Data port', type: 'number' }, { key: 'mediaPort', label: 'Media port', type: 'number' }
]
const formatDate = value => value ? new Date(value).toLocaleString() : 'Never'
async function refresh() { if (!disposed) health.value = await oblecto.federation.status() }
async function load() { config.value = await oblecto.settings.getSection('federation'); await refresh() }
async function run(work, success = '') {
  busy.value = true; error.value = ''; fields.value = {}; notice.value = ''
  try { await work(); await refresh(); notice.value = success }
  catch (err) {
    fields.value = err.response?.data?.fields || {}
    error.value = [err.response?.data?.error || err.response?.data?.message || err.message, ...Object.values(fields.value)].join(' ')
  } finally { busy.value = false }
}
const save = () => run(async () => {
  const next = { ...config.value }
  for (const key of ['dataPort', 'mediaPort', 'syncIntervalMs']) next[key] = Number(next[key])
  config.value = await oblecto.settings.updateSection('federation', next)
}, 'Settings saved and applied.')
const setup = () => run(async () => {
  const next = { ...config.value }; for (const key of ['dataPort', 'mediaPort', 'syncIntervalMs']) next[key] = Number(next[key])
  await oblecto.settings.updateSection('federation', next)
  localIdentity.value = await oblecto.federation.setup(config.value.address); await load() }, 'Identity is ready. Enable federation to pair servers.')
const createInvitation = () => run(async () => { invitation.value = await oblecto.federation.invitation() })
const revokeInvitation = () => run(async () => { await oblecto.federation.revokeInvitation(invitation.value.id); invitation.value = null })
const pair = () => run(async () => { await oblecto.federation.pair(incoming.value.trim()); incoming.value = '' }, 'Pairing started. Its progress appears below.')
const cancelPairing = id => run(() => oblecto.federation.cancelPairing(id))
const action = (id, operation) => run(() => oblecto.federation.action(id, operation), operation === 'test' ? 'Connection verified.' : 'Request accepted.')
const togglePeer = peer => run(async () => { await oblecto.federation.savePeer(peer.id, { ...config.value.servers[peer.id], enabled: !peer.enabled }); await load() })
const removePeer = id => run(async () => { await oblecto.federation.removePeer(id, purge.value); removing.value = ''; purge.value = false; await load() })
function editPeer(id) { peerDraft.value = { id, ...config.value.servers[id] }; editing.value = true }
function resetPeer() { peerDraft.value = emptyPeer(); editing.value = false }
const savePeer = () => run(async () => {
  const { id, ...peer } = peerDraft.value
  peer.dataPort = Number(peer.dataPort); peer.mediaPort = Number(peer.mediaPort)
  await oblecto.federation.savePeer(id, peer); resetPeer(); await load()
})
const addClient = () => run(async () => {
  config.value = await oblecto.settings.updateSection('federation', { clients: { ...config.value.clients, [clientId.value]: { key: clientKey.value } } })
  clientId.value = ''; clientKey.value = ''
})
const revokeClient = id => run(async () => {
  const clients = { ...config.value.clients }; delete clients[id]
  config.value = await oblecto.settings.updateSection('federation', { clients })
})
onMounted(async () => {
  await run(async () => { await load(); ready.value = true; localIdentity.value = await oblecto.federation.identity().catch(() => null) })
  const poll = async () => { try { if (!busy.value) { await refresh(); const latest = await oblecto.settings.getSection('federation'); config.value.servers = latest.servers; config.value.clients = latest.clients } } catch { /* Keep last status until the next refresh. */ } finally { if (!disposed) timer = setTimeout(poll, 5000) } }
  if (!disposed) timer = setTimeout(poll, 5000)
})
onBeforeUnmount(() => { disposed = true; clearTimeout(timer); invitation.value = null; incoming.value = '' })
</script>

<style scoped>
.peer-card { border-top: 1px solid var(--border-color, #555); padding: 1rem 0; }
.peer-actions { display: flex; flex-wrap: wrap; gap: .5rem; }
textarea, pre { width: 100%; max-width: 100%; overflow-wrap: anywhere; white-space: pre-wrap; box-sizing: border-box; }
input { max-width: 100%; }
</style>
