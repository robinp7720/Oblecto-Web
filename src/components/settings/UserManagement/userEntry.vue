<template>
  <tr>
    <td>{{ user.name }}</td>
    <td>{{ user.username }}</td>
    <td>{{ user.email }}</td>
    <td>{{ user.group }}</td>
    <td class="actions">
      <button
        type="button"
        :title="`Set a new password for ${user.username}`"
        :aria-label="`Set a new password for ${user.username}`"
        @click="$emit('set-password', user)"
      >
        <font-awesome-icon icon="edit" />
      </button>
      <button
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
  import faEdit from '@fortawesome/fontawesome-free-solid/faEdit'
  import fontawesome from '@fortawesome/fontawesome'

  fontawesome.library.add(faTrash, faEdit)

  // A row reports what was clicked; UserManager owns the list, the requests and
  // the place where their outcome is shown.
  export default {
    name: 'UserEntry',
    components: {
      FontAwesomeIcon
    },
    props: {
      user: {
        type: Object,
        required: true
      }
    },
    emits: ['set-password', 'delete']
  }
</script>
