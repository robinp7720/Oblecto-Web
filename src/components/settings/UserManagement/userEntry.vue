<template>
  <tr>
    <td class="id">
      {{ user.id }}
    </td>
    <td>{{ user.name }}</td>
    <td>{{ user.username }}</td>
    <td>{{ user.email }}</td>
    <td>{{ user.group }}</td>
    <td>
      <a
        class="action"
        @click="changePassword"
      >Change Password</a> <a
        href="#"
        class="action"
      >Change Group</a>
    </td>
  </tr>
</template>

<script>
  export default {
    name: 'UserEntry',
    props: ['user'],
    methods: {
      changePassword () {
        this.$modal.show('PasswordChange', this.user)
      }
    }
  }
</script>

<style scoped lang="sass">
  @use "sass:color"
  tr:nth-child(even)
    background-color: color.adjust(#696060, $lightness: -2%)

  td
    padding: 10px

  .id
    text-align: right
</style>
