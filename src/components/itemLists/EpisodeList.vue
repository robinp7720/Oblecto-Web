<script src="../../store/index.js"></script>
<template>
  <div class="episodes">
    <div class="title" v-if="title">
      <h3 v-html="title"></h3>
    </div>
    <div class="empty" v-if="episodes.length == 0">
      <span class="no-content">
        No episodes here
      </span>
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
                 v-bind:subtitle="'S' + episode.airedSeason + 'E' + episode.airedEpisodeNumber + ' - ' + episode.Series.seriesName"
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
    padding: 5px 0


  .title, .title h3
    padding: 0 20px
    font:
      family: roboto
      size: 20px

  .empty
    height: 259px // This is the height of the episodes scroll container if it is filled

    display: flex
    align-items: center
    justify-content: center

    @media screen and (max-width: 700px)
      height: 209px


    .no-content
      font-size: 2em
      color: rgba(250, 250, 250, 0.5)





</style>
