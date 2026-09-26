<template>
  <tr>
    <td>
      <span class="user-identity">
        <UserAvatar
          :user="user"
          :size="36"
        />
        {{ user.name }}
      </span>
    </td>
    <td>{{ user.username }}</td>
    <td>{{ user.email }}</td>
    <td>
      <select
        class="group-select"
        :value="user.groupId ?? ''"
        :aria-label="`Group of ${user.username}`"
        @change="$emit('update', user, { groupId: $event.target.value === '' ? null : Number($event.target.value) })"
      >
        <option value="">
          No group
        </option>
        <option
          v-for="group in groups"
          :key="group.id"
          :value="group.id"
        >
          {{ group.name }}
        </option>
      </select>
    </td>
    <td class="flag">
      <label class="checkbox-container table-checkbox">
        <input
          type="checkbox"
          :checked="user.publicProfile"
          :aria-label="`Show ${user.username} on the sign-in screen`"
          @change="$emit('update', user, { publicProfile: $event.target.checked })"
        >
        <span class="checkmark" />
      </label>
    </td>
    <td class="flag">
      <label class="checkbox-container table-checkbox">
        <input
          type="checkbox"
          :checked="user.passwordlessLocal"
          :aria-label="`Let ${user.username} sign in without a password on the local network`"
          @change="$emit('update', user, { passwordlessLocal: $event.target.checked })"
        >
        <span class="checkmark" />
      </label>
    </td>
    <td class="actions">
      <button
        type="button"
        :title="`Upload a profile picture for ${user.username}`"
        :aria-label="`Upload a profile picture for ${user.username}`"
        @click="$refs.avatarFile.click()"
      >
        <font-awesome-icon icon="camera" />
      </button>
      <input
        ref="avatarFile"
        type="file"
        accept="image/*"
        hidden
        @change="pickAvatar"
      >
      <button
        v-if="user.avatar"
        type="button"
        :title="`Remove the profile picture of ${user.username}`"
        :aria-label="`Remove the profile picture of ${user.username}`"
        @click="$emit('remove-avatar', user)"
      >
        <font-awesome-icon icon="times-circle" />
      </button>
      <button
        type="button"
        :title="`Edit the details of ${user.username}`"
        :aria-label="`Edit the details of ${user.username}`"
        @click="$emit('edit', user)"
      >
        <font-awesome-icon icon="edit" />
      </button>
      <button
        type="button"
        :title="`Set a new password for ${user.username}`"
        :aria-label="`Set a new password for ${user.username}`"
        @click="$emit('set-password', user)"
      >
        <font-awesome-icon icon="key" />
      </button>
      <!-- Deleting your own account signs you out mid-page; another admin can. -->
      <button
        v-if="!isSelf"
        type="button"
        :title="`Delete ${user.username}`"
        :aria-label="`Delete ${user.username}`"
        @click="$emit('delete', user)"
      >
        <font-awesome-icon icon="trash" />
      </button>
    </td>
  </tr>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import faKey from '@fortawesome/fontawesome-free-solid/faKey'
  import faEdit from '@fortawesome/fontawesome-free-solid/faEdit'
  import faCamera from '@fortawesome/fontawesome-free-solid/faCamera'
  import faTimesCircle from '@fortawesome/fontawesome-free-solid/faTimesCircle'
  import fontawesome from '@fortawesome/fontawesome'
  import UserAvatar from '@/components/system/UserAvatar.vue'

  fontawesome.library.add(faTrash, faKey, faEdit, faCamera, faTimesCircle)

  // A row reports what was clicked; UserManager owns the list, the requests and
  // the place where their outcome is shown.
  export default {
    name: 'UserEntry',
    components: {
      FontAwesomeIcon,
      UserAvatar
    },
    props: {
      user: {
        type: Object,
        required: true
      },
      // Every group, for the group picker
      groups: {
        type: Array,
        default: () => []
      },
      // The signed-in admin's own row
      isSelf: {
        type: Boolean,
        default: false
      }
    },
    emits: ['edit', 'set-password', 'delete', 'update', 'upload-avatar', 'remove-avatar'],
    methods: {
      pickAvatar (event) {
        const [file] = event.target.files

        // Cleared so picking the same file again still fires a change.
        event.target.value = ''

        if (file) this.$emit('upload-avatar', this.user, file)
      }
    }
  }
</script>

<style scoped lang="sass">
.user-identity
  display: inline-flex
  align-items: center
  gap: 10px

.flag
  text-align: center

.group-select
  padding: 6px 8px
  border: 1px solid var(--color-border)
  border-radius: var(--radius-sm)
  background-color: rgba(255, 255, 255, 0.07)
  color: var(--color-text)
  font: inherit

.table-checkbox
  display: inline-block
  width: 20px
  min-height: 20px
  margin: 0
  padding: 0

  input, .checkmark
    top: 0
</style>
