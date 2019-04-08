<template>
  <div class="episodes">
    <div class="title" v-if="title">
      <h3 v-html="title"></h3>
    </div>
      <transition-group
        name="staggered-fade"
        tag="ul"
        class="scroller"
        v-bind:css="true"
        v-on:before-enter="beforeEnter"
        v-on:enter="enter"
        v-on:leave="leave"
      >
        <Episode v-for="(episode, index) in episodes"
                 v-bind:subtitle="'S' + episode.airedSeason + 'E' + episode.airedEpisodeNumber + ' - ' + episode.tvshow.seriesName"
                 v-bind:key="episode.id"
                 v-bind:episode="episode"
        ></Episode>
      </transition-group>
    </div>
</template>

<script>
  import Episode from '@/components/itemTypes/Episode'
  import Velocity from 'velocity-animate'

  export default {
    name: 'EpisodeList',
    components: { Episode: Episode },
    props: { 'episodes': Array, 'title': String },
    methods: {
      beforeEnter: function (el) {
        el.style.opacity = 0
        el.style.width = 0
      },
      enter: function (el, done) {
        var delay = el.dataset.index * 150
        setTimeout(function () {
          Velocity(
            el,
            { opacity: 1, width: '357px' },
            { complete: done }
          )
        }, delay)
      },
      leave: function (el, done) {
        var delay = el.dataset.index * 150
        setTimeout(function () {
          Velocity(
            el,
            { opacity: 0, width: 0 },
            { complete: done }
          )
        }, delay)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .episodes
    position: relative

  .staggered-fade-move
    transition: transform 1s

  .scroller
    overflow: hidden
    overflow-x: visible
    white-space: nowrap
    padding: 0
    padding-top: 5px


  .title, .title h3
    padding: 0 20px
    font:
      family: roboto
      size: 20px


</style>
