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
        <Movie v-for="(movie, index) in movies"
                 v-bind:title="movie.movieName"
                 v-bind:movieId="movie.id"
                 v-bind:subtitle="'Released: ' + movie.releaseDate"
                 v-bind:key="movie.id"
        ></Movie>
      </transition-group>
    </div>
  </div>
</template>

<script>
  import Movie from '@/components/itemTypes/Movie'
  import Velocity from 'velocity-animate'

  export default {
    name: 'movie-list',
    components: {Movie: Movie},
    props: {'movies': Array, 'title': String},
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
            {opacity: 1, width: '136px'},
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
