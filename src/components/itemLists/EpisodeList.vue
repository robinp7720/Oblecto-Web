<template>
  <div class="episodes">
    <div class="title" v-if="title">
      <h3>{{ title }}</h3>
    </div>
    <div class="episode-scroller">
      <transition-group
        name="staggered-fade"
        tag="ul"
        class="show-scroller"
        v-bind:css="true"
        v-on:before-enter="beforeEnter"
        v-on:enter="enter"
        v-on:leave="leave"
      >
        <Episode v-for="(episode, index) in episodes"
                 v-bind:title="episode.episodeName"
                 v-bind:episodeId="episode.tvdbid"
                 v-bind:downloaded="episode.downloaded"
                 v-bind:downloading="false"
                 v-bind:subtitle="'S' + episode.airedSeason + 'E' + episode.airedEpisodeNumber + ' - ' + episode.tvshow.seriesName"
                 v-bind:key="episode.id"
        ></Episode>
      </transition-group>
    </div>
  </div>
</template>

<script>
  import Episode from '@/components/itemTypes/Episode'
  import Velocity from 'velocity-animate'

  export default {
    name: 'episodes-list',
    components: {Episode: Episode},
    props: {'episodes': Array, 'title': String},
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
            {opacity: 1, width: '357px'},
            {complete: done}
          )
        }, delay)
      },
      leave: function (el, done) {
        var delay = el.dataset.index * 150
        setTimeout(function () {
          Velocity(
            el,
            {opacity: 0, width: 0},
            {complete: done}
          )
        }, delay)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .staggered-fade-move
    transition: transform 1s

  .episode-scroller
    overflow: hidden
    overflow-x: visible
    white-space: nowrap
    padding: 0

  .episode-scroller::-webkit-scrollbar
    display: none

  .title, .title h3
    padding: 0 20px
    font:
      family: roboto
      size: 20px


</style>
