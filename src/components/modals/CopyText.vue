<template>
  <modal name="CopyText" @before-open="beforeOpen" height="auto">
    <div class="container">
      <div class="heading">
      <h3>{{ title }}</h3>
      </div>
      <div class="body">
        <input type="text" id="name" v-bind:value="text" ref="inputTextField">
      </div>
      <div class="footer">
        <button class="success" v-on:click="copy">Copy</button>
      </div>
    </div>
  </modal>
</template>

<script>
  export default {
    name: 'CopyText',
    data () {
      return {
        title: '',
        text: ''
      }
    },
    methods: {
      beforeOpen (event) {
        this.title = event.params.title
        this.text = event.params.text
      },
      copy () {
        this.$refs.inputTextField.focus()
        this.$refs.inputTextField.select()
        document.execCommand('copy')
      }
    }
  }
</script>

<style scoped lang="sass">

  .body
    padding: 10px

  h3
    width: 100%
    color: white
    margin: 0
    margin-bottom: 10px
    padding: 20px

    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(darken(#696060, 20), 0.75)

  label
    display: block
    margin: 5px
    margin-left: 0

  input
    margin-bottom: 10px
    border-radius: 0
    padding: 10px
    width: 100%
    border: 2px #a8cca1 solid
  .invalid
    border-color: #ff9f78

  .footer
    background-color: rgba(0,0,0,0.3)

    box-shadow: 0 0 5px 2px rgba(darken(#696060, 20), 0.75)
    padding: 10px

    overflow: hidden

    button
      float: right

      background-color: rgba(0,0,0,0.5)
      border: rgba(0,0,0,0.8) 1px solid
      color: rgba(255,255,255,0.5)

      padding: 10px
      -webkit-border-radius: 3px
      -moz-border-radius: 3px
      border-radius: 3px
      cursor: pointer


</style>
