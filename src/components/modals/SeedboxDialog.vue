<template>
  <modal
    name="SeedboxDialog"
    height="auto"
    :scrollable="true"
    @before-open="beforeOpen"
  >
    <div class="container">
      <div class="heading">
        <h3>{{ isNew ? 'Add Seedbox' : 'Edit Seedbox' }}</h3>
      </div>
      <div class="body">
        <div class="resize-grid">
          <div class="form-group">
            <label>Name</label>
            <input
              v-model="seedboxForm.name"
              type="text"
              placeholder="My Seedbox"
            >
          </div>
          <div class="form-group">
            <label>Storage Driver</label>
            <select v-model="seedboxForm.storageDriver">
              <option value="ssh">
                SSH
              </option>
              <option value="ftp">
                FTP
              </option>
              <option value="ftps">
                FTPS
              </option>
            </select>
          </div>
        </div>

        <div class="resize-grid">
          <div class="form-group">
            <label>Host</label>
            <input
              v-model="seedboxForm.storageDriverOptions.host"
              type="text"
              placeholder="seedbox.example.com"
            >
          </div>
          <div class="form-group">
            <label>Username</label>
            <input
              v-model="seedboxForm.storageDriverOptions.username"
              type="text"
              placeholder="seeduser"
            >
          </div>
        </div>

        <div class="resize-grid">
          <div class="form-group">
            <label>Password</label>
            <input
              v-model="seedboxForm.storageDriverOptions.password"
              type="password"
              placeholder="••••••••"
            >
          </div>
          <div class="form-group">
            <label>Secure Connection</label>
            <label class="checkbox-container">
              Use Secure Connection
              <input
                v-model="seedboxForm.storageDriverOptions.secure"
                type="checkbox"
              >
              <span class="checkmark" />
            </label>
          </div>
        </div>

        <div class="resize-grid">
          <div class="form-group">
            <label>Movie Directory</label>
            <input
              v-model="seedboxForm.mediaImport.movieDirectory"
              type="text"
              placeholder="/downloads/finished/movie"
            >
          </div>
          <div class="form-group">
            <label>Series Directory</label>
            <input
              v-model="seedboxForm.mediaImport.seriesDirectory"
              type="text"
              placeholder="/downloads/finished/tv"
            >
          </div>
        </div>

        <div class="resize-grid">
          <div class="form-group">
            <label class="checkbox-container">
              Automatic Import
              <input
                v-model="seedboxForm.automaticImport"
                type="checkbox"
              >
              <span class="checkmark" />
            </label>
            <p class="description">
              Automatically import media found in the seedbox directories.
            </p>
          </div>
          <div class="form-group">
            <label class="checkbox-container">
              Delete On Import
              <input
                v-model="seedboxForm.deleteOnImport"
                type="checkbox"
              >
              <span class="checkmark" />
            </label>
            <p class="description">
              Remove files from the seedbox after import completes.
            </p>
          </div>
        </div>

        <div class="setting-row">
          <label class="checkbox-container">
            Enabled
            <input
              v-model="seedboxForm.enabled"
              type="checkbox"
            >
            <span class="checkmark" />
          </label>
        </div>
      </div>
      <div class="footer">
        <button
          class="success"
          @click="save"
        >
          {{ isNew ? 'Add Seedbox' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </modal>
</template>

<script>
  export default {
    name: 'SeedboxDialog',
    data () {
      return {
        seedboxForm: this.getEmptySeedbox(),
        isNew: true,
        callback: null
      }
    },
    methods: {
      getEmptySeedbox () {
        return {
          name: '',
          storageDriver: 'ssh',
          storageDriverOptions: {
            host: '',
            username: '',
            password: '',
            secure: true
          },
          mediaImport: {
            movieDirectory: '',
            seriesDirectory: ''
          },
          automaticImport: true,
          deleteOnImport: false,
          enabled: true
        }
      },
      beforeOpen (event) {
        if (!event || !event.params) {
          this.seedboxForm = this.getEmptySeedbox()
          this.isNew = true
          this.callback = null
          return
        }

        this.callback = event.params.callback
        this.isNew = !event.params.seedbox

        if (event.params.seedbox) {
          const seedbox = event.params.seedbox
          const empty = this.getEmptySeedbox()
          
          this.seedboxForm = {
            ...empty,
            ...seedbox,
            storageDriver: seedbox.storageDriver || 'ssh',
            storageDriverOptions: {
              ...empty.storageDriverOptions,
              ...(seedbox.storageDriverOptions || {})
            },
            mediaImport: {
              ...empty.mediaImport,
              ...(seedbox.mediaImport || {})
            }
          }
        } else {
          this.seedboxForm = this.getEmptySeedbox()
        }
      },
      save () {
        if (!this.seedboxForm.name || !this.seedboxForm.storageDriverOptions.host) {
          this.$notify({ type: 'error', title: 'Missing info', text: 'Name and host are required.' })
          return
        }

        if (this.callback) {
          this.callback({ ...this.seedboxForm })
        }
        this.$modal.hide('SeedboxDialog')
      }
    }
  }
</script>

<style scoped lang="sass">
.body
  padding: 10px

h3
  width: 100%
  color: var(--color-text)
  margin: 0
  margin-bottom: 10px
  padding: 20px
  background-color: rgba(255, 255, 255, 0.06)
  box-shadow: var(--shadow-soft)

label
  display: block
  margin: 5px
  margin-left: 0
  font-size: 0.9em
  color: var(--color-text-muted)

input, select
  margin-bottom: 12px
  border-radius: 12px
  padding: 12px 14px
  width: 100%
  border: 1px solid transparent
  background-color: rgba(255, 255, 255, 0.12)
  color: var(--color-text)
  font-family: var(--font-body)
  transition: border-color 0.2s, background-color 0.2s
  
  &:focus
    outline: none
    border-color: var(--color-accent-soft)
    background-color: rgba(255, 255, 255, 0.18)

.resize-grid
  display: flex
  gap: 20px
  
  .form-group
    flex: 1

.description
  color: var(--color-text-muted)
  font-size: 0.85em
  margin-top: 2px
  margin-left: 30px
  margin-bottom: 12px
  line-height: 1.4

.checkbox-container
  display: block
  position: relative
  padding-left: 30px
  margin-bottom: 5px
  cursor: pointer
  font-size: 1em
  user-select: none
  color: var(--color-text)

  input
    position: absolute
    opacity: 0
    cursor: pointer
    height: 0
    width: 0

  .checkmark
    position: absolute
    top: 2px
    left: 0
    height: 18px
    width: 18px
    background-color: rgba(255, 255, 255, 0.08)
    border: 1px solid var(--color-border)
    border-radius: 6px

  &:hover input ~ .checkmark
    background-color: rgba(255, 255, 255, 0.16)

  input:checked ~ .checkmark
    background-color: var(--color-accent)
    border-color: var(--color-accent)

  input:checked ~ .checkmark:after
    display: block

  .checkmark:after
    content: ""
    position: absolute
    display: none
    left: 6px
    top: 2px
    width: 3px
    height: 8px
    border: solid white
    border-width: 0 2px 2px 0
    transform: rotate(45deg)

.footer
  background-color: rgba(255, 255, 255, 0.06)
  box-shadow: var(--shadow-soft)
  padding: 15px 20px
  overflow: hidden
  margin-top: 10px

  button
    float: right
    background: linear-gradient(120deg, var(--color-accent), var(--color-accent-strong))
    border: none
    color: #1b1616
    padding: 10px 22px
    border-radius: 999px
    font-weight: 700
    letter-spacing: 0.04em
    cursor: pointer
    box-shadow: 0 12px 20px rgba(12, 10, 12, 0.35)
    transition: transform 0.2s, box-shadow 0.2s
    &:hover
      transform: translateY(-1px)
      box-shadow: 0 16px 26px rgba(12, 10, 12, 0.45)
</style>