<template>
  <div class="loading-container">
    <div class="loader" />
  </div>
</template>

<script>
    export default {
      name: 'LoadingPage'
    }
</script>

<style scoped lang="sass">
  @keyframes rotating
    from
      -transform: rotate(0deg)
    to
      transform: rotate(360deg)

  @-webkit-keyframes scale-width
    from
      width: 0
      height: 0
      margin-top: 0
      margin-left: 0
    to
      width: 128px
      height: 128px
      margin-top: -64px
      margin-left: -64px




  .loader
    width: 128px
    height: 128px
    background-color: transparent
    border: solid rgba(255,255,255,0.08) 10px
    border-bottom: solid #d9813c 10px
    border-radius: 100%
    position: fixed
    top: 50%
    left: 50%
    margin-top: -64px
    margin-left: -64px
    animation: scale-width 0.5s linear, rotating 2s linear infinite

  .loading-container
    position: fixed
    top: 0
    left: 0

    width: 100%
    height: 100%

    z-index: 100

    background: radial-gradient(900px 500px at 10% 0%, rgba(217, 129, 60, 0.2), transparent 55%), linear-gradient(180deg, #6e605f 0%, #4b4850 42%, #1d262f 100%)
    background-position: top
    background-attachment: fixed
    background-repeat: round
    -webkit-background-size: cover
    background-size: cover
</style>
