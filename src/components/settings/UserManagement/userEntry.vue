<template>
  <tr>
    <td>{{ user.id }}</td>
    <td>{{ user.name }}</td>
    <td>{{ user.username }}</td>
    <td>{{ user.email }}</td>
    <td>{{ user.group }}</td>
    <td class="actions">
      <a
        class="edit"
        @click="editUser"
      >
        <font-awesome-icon icon="edit" />
      </a>
      <a
        class="delete"
        @click="deleteUser"
      >
        <font-awesome-icon icon="trash" />
      </a>
    </td>
  </tr>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faTrash from '@fortawesome/fontawesome-free-solid/faTrash'
  import faEdit from '@fortawesome/fontawesome-free-solid/faEdit'
  import fontawesome from '@fortawesome/fontawesome'
  import oblectoClient from '@/oblectoClient'

  fontawesome.library.add(faTrash, faEdit)

  export default {
    name: 'userEntry',
    components: {
      FontAwesomeIcon
    },
    props: {
      user: {
        type: Object,
        required: true
      }
    },
    methods: {
      async deleteUser () {
        if (confirm(`Are you sure you want to delete user ${this.user.username}?`)) {
          await oblectoClient.userManager.deleteUser(this.user.id)
          // Ideally emit event to parent to refresh list
          this.$parent.created() 
        }
      },
      editUser () {
        // Placeholder for edit functionality
        // this.$modal.show('UserEdit', { user: this.user })
      }
    }
  }
</script>

<style scoped lang="sass">
@use "@/assets/sass/settings.sass"
</style>
