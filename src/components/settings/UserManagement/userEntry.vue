<template>
  <tr>
    <td class="id">{{ user.id }} </td>
    <td>{{ user.name }}</td>
    <td>{{ user.username }}</td>
    <td>{{ user.email }}</td>
    <td>{{ user.group }}</td>
    <td><a href="#" class="action">Change Password</a> <a href="#" class="action">Change Group</a></td>
  </tr>
</template>

<script>
  export default {
    name: 'userEntry',
    props: ['user']
  }
</script>

<style scoped lang="sass">
td
  padding: 5px
  
.id
  text-align: right
</style>
