<template>
    <div class="loading-container">
      <div class="loader"></div>
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
      width: 0px
      height: 0px
      margin-top: 0px
      margin-left: 0px
    to
      width: 128px
      height: 128px
      margin-top: -64px
      margin-left: -64px




  .loader
    width: 128px
    height: 128px
    background-color: transparent
    border: solid rgba(0,0,0,0.2) 10px
    border-bottom: solid #F15A24 10px
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

    background: #696060 /* Old browsers */
    background: -moz-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* FF3.6-15 */
    background: -webkit-linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(to bottom, #696060 0%, #55535b 36%, #28343b 100%) /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    background-position: top
    background-attachment: fixed
    background-repeat: round
    -webkit-background-size: cover
    background-size: cover
</style>
