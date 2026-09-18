<template>
  <div class="UserManager">
    <div class="settings-card">
      <div class="settings-header-row">
        <h2 class="settings-title-plain">
          Users
        </h2>
        <button
          type="button"
          class="btn"
          @click="showAdd = true"
        >
          <font-awesome-icon icon="plus" /> Add user
        </button>
      </div>

      <div class="settings-table-scroll">
        <table class="settings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Group</th>
              <th
                class="flag-heading"
                title="Shown on the profile picker when signing in from the local network"
              >
                On sign-in screen
              </th>
              <th
                class="flag-heading"
                title="Needs “Password-less sign-in on the local network” under Sign-in"
              >
                No password on local network
              </th>
              <th width="170">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td
                colspan="7"
                class="settings-table-center"
              >
                No users found.
              </td>
            </tr>
            <user-entry
              v-for="user in users"
              :key="user.id"
              :user="user"
              :groups="groups"
              @edit="editTarget = user"
              @set-password="passwordTarget = user"
              @delete="deleteUser"
              @update="updateUser"
              @upload-avatar="uploadAvatar"
              @remove-avatar="removeAvatar"
            />
          </tbody>
        </table>
      </div>

      <div class="settings-card-actions">
        <SaveState :state="status" />
      </div>
    </div>

    <UserAdd
      v-model:open="showAdd"
      @created="refresh"
    />
    <UserEdit
      :open="Boolean(editTarget)"
      :user="editTarget"
      @update:open="value => { if (!value) editTarget = null }"
      @saved="replaceUser"
    />
    <PasswordChange
      :open="Boolean(passwordTarget)"
      :user="passwordTarget"
      @update:open="value => { if (!value) passwordTarget = null }"
    />
  </div>
</template>

<script>
  import userEntry from '@/components/settings/UserManagement/userEntry'
  import UserAdd from '@/components/modals/UserAdd'
  import PasswordChange from '@/components/modals/PasswordChange'
  import UserEdit from '@/components/modals/UserEdit.vue'
  import SaveState from '@/components/system/SaveState.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'
  import { useAuthStore } from '@/stores/auth'

  fontawesome.library.add(faPlus)

  export default {
    name: 'UserManager',
    components: {
      userEntry,
      UserAdd,
      PasswordChange,
      UserEdit,
      SaveState,
      FontAwesomeIcon
    },
    data () {
      return {
        users: [],
        groups: [],
        showAdd: false,
        // The user whose details are being edited; null closes the dialog.
        editTarget: null,
        // The user whose password is being set; null closes the dialog.
        passwordTarget: null,
        status: createSaveState()
      }
    },
    created () {
      this.refresh()
    },
    methods: {
      async refresh () {
        // An empty `ok` keeps a successful load silent; only the failure is news.
        await this.status.run(
          async () => {
            const [users, groups] = await Promise.all([
              oblectoClient.userManager.getUsers(),
              // Older servers have no groups; the picker then only offers "No group".
              oblectoClient.groups.getGroups().catch(() => [])
            ])
            this.users = Array.isArray(users) ? users : []
            this.groups = Array.isArray(groups) ? groups : []
          },
          { busy: 'Loading users…', ok: '', error: 'Could not load users' }
        )
      },
      async deleteUser (user) {
        const confirmed = await confirm({
          title: `Delete ${user.username}?`,
          message: 'The account is removed immediately and can no longer sign in. Anything recorded against it, including watch progress, goes with it.',
          confirmLabel: 'Delete user',
          destructive: true
        })

        if (!confirmed) return

        const ok = await this.status.run(
          () => oblectoClient.userManager.deleteUser(user.id),
          { busy: 'Deleting…', ok: `Deleted ${user.username}`, error: `Could not delete ${user.username}` }
        )

        if (ok) this.users = this.users.filter(entry => entry.id !== user.id)
      },
      replaceUser (updated) {
        this.users = this.users.map(entry => entry.id === updated.id ? { ...entry, ...updated } : entry)
      },
      async updateUser (user, changes) {
        // Shown at once; put back if the server refuses.
        this.replaceUser({ ...user, ...changes })

        const ok = await this.status.run(
          async () => this.replaceUser(await oblectoClient.userManager.updateUser(user.id, changes)),
          { busy: 'Saving…', ok: `Saved ${user.username}`, error: `Could not update ${user.username}` }
        )

        if (!ok) this.replaceUser(user)

        // Moving yourself to another group changes what you may see.
        if (ok && 'groupId' in changes && user.id === useAuthStore().me?.id) await useAuthStore().loadMe(true)
      },
      async uploadAvatar (user, file) {
        await this.status.run(
          async () => this.replaceUser(await oblectoClient.userManager.uploadAvatar(user.id, file)),
          { busy: 'Uploading picture…', ok: `Updated the picture of ${user.username}`, error: `Could not use this picture for ${user.username}` }
        )
      },
      async removeAvatar (user) {
        await this.status.run(
          async () => this.replaceUser(await oblectoClient.userManager.removeAvatar(user.id)),
          { busy: 'Removing picture…', ok: `Removed the picture of ${user.username}`, error: `Could not remove the picture of ${user.username}` }
        )
      }
    }
  }
</script>

<style scoped lang="sass">
.flag-heading
  max-width: 120px
  text-align: center
  white-space: normal
</style>
