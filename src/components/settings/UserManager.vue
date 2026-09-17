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
              <th width="120">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td
                colspan="5"
                class="settings-table-center"
              >
                No users found.
              </td>
            </tr>
            <user-entry
              v-for="user in users"
              :key="user.id"
              :user="user"
              @set-password="passwordTarget = user"
              @delete="deleteUser"
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
  import SaveState from '@/components/system/SaveState.vue'
  import { createSaveState } from '@/composables/useSaveState'
  import { confirm } from '@/composables/useConfirm'
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faPlus)

  export default {
    name: 'UserManager',
    components: {
      userEntry,
      UserAdd,
      PasswordChange,
      SaveState,
      FontAwesomeIcon
    },
    data () {
      return {
        users: [],
        showAdd: false,
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
            const users = await oblectoClient.userManager.getUsers()
            this.users = Array.isArray(users) ? users : []
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
      }
    }
  }
</script>
