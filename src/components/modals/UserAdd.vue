<template>
  <modal
    name="UserAdd"
    height="auto"
    @before-open="beforeOpen"
  >
    <div class="container">
      <div class="heading">
        <h3>Add user</h3>
      </div>
      <div class="body">
        <label for="name">Name:</label>
        <input
          id="name"
          v-model="name"
          type="text"
          :class="{invalid: attempted && name === ''}"
        >
        <label for="username">Username:</label>
        <input
          id="username"
          v-model="username"
          type="text"
          :class="{invalid: attempted && username === ''}"
        >
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="email"
          type="text"
          :class="{invalid: attempted && email === ''}"
        >
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :class="{invalid: attempted && password === ''}"
        >
      </div>
      <div class="footer">
        <button
          class="success"
          @click="addUser"
        >
          Add user
        </button>
      </div>
    </div>
  </modal>
</template>

<script>
  import oblectoClient from '@/oblectoClient'

  export default {
    name: 'UserAdd',
    data () {
      return {
        name: '',
        username: '',
        email: '',
        password: '',
        attempted: false
      }
    },
    methods: {
      beforeOpen (event) {
        this.attempted = false
      },
      async addUser () {
        this.attempted = true
        if (!this.name || !this.username || !this.email || !this.password) {
          this.$notify({
            group: 'system',
            title: 'Missing fields',
            text: 'Please fill out all fields',
            type: 'error'
          })
          return
        }
        try {
          await oblectoClient.userManager.createUser(this.username, this.password, this.name, this.email)

          this.$notify({
            group: 'system',
            title: 'User has been created successfully',
            text: 'You can now login with the username: ' + this.name,
            type: 'success'
          })
        } catch (e) {
          this.$notify({
            group: 'system',
            title: 'User could not be created',
            text: 'Maybe not all fields are filled?',
            type: 'error'
          })
        }
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

  input
    margin-bottom: 12px
    border-radius: 12px
    padding: 12px 14px
    width: 100%
    border: 1px solid transparent
    background-color: rgba(255, 255, 255, 0.12)
    color: var(--color-text)
    transition: border-color 0.2s, background-color 0.2s
    &:focus
      outline: none
      border-color: var(--color-accent-soft)
      background-color: rgba(255, 255, 255, 0.18)
  .invalid
    border-color: var(--color-accent-soft)

  .footer
    background-color: rgba(255, 255, 255, 0.06)

    box-shadow: var(--shadow-soft)
    padding: 10px

    overflow: hidden

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
