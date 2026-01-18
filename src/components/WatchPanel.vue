<template>
  <div class="watching">
    <tabs :options="{ useUrlFragment: false }">
      <tab
        name="Tracked episodes"
        :suffix="'<span class=badge>' + watchingEpisodes.length + '</span>'"
      >
        <EpisodeList :episodes="watchingEpisodes" />
      </tab>
      <tab
        name="Tracked movies"
        :suffix="'<span class=badge>' + watchingMovies.length + '</span>'"
      >
        <MovieList :movies="watchingMovies" />
      </tab>
      <tab
        name="next up"
        :suffix="'<span class=badge>' + nextEpisodes.length + '</span>'"
      >
        <EpisodeList :episodes="nextEpisodes" />
      </tab>
    </tabs>
  </div>
</template>

<script>
  import EpisodeList from '@/components/itemLists/EpisodeList'
  import SeriesList from '@/components/itemLists/SeriesList'
  import MovieList from '@/components/itemLists/MovieList'
  import { mapState } from 'vuex'

  export default {
    name: 'WatchPanel',
    components: {
      SeriesList,
      EpisodeList,
      MovieList
    },
    computed: mapState([
      'watchingEpisodes',
      'watchingMovies',
      'nextEpisodes'
    ]),
    created () {

    },
    methods: {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  .watching
    position: relative
    margin-top: 64px

    margin-bottom: 20px
    width: 100%
    padding: 20px 0

    background: linear-gradient(140deg, rgba(53, 46, 50, 0.95), rgba(39, 34, 39, 0.88))
    border: 1px solid var(--color-border)
    box-shadow: var(--shadow-strong)
    z-index: 2
    backdrop-filter: blur(6px)

    // The height of the panel if it is populated with shows.
    // If the height isn't set the panel will collapse and the whole thing looks terrible
    height: 356px

    @media screen and (min-height: 1200px)
      position: fixed
      top: 64px
      margin: 0

    @media screen and (max-width: 700px)
      height: 316px


</style>

<style lang="sass">
  .tabs-component-tabs
    list-style: none
    margin-top: 0
    margin-bottom: 15px
    position: relative

    overflow-x: auto

    white-space: nowrap

    .tabs-component-tab
      display: inline-block
      a
        color: var(--color-text-faint)
        display: block
        text-decoration: none
        padding: 12px 22px
        font-family: var(--font-body)
        font-size: 16px
        text-transform: capitalize
        font-weight: bold
        letter-spacing: 0.04em
        border-bottom: 2px solid transparent
        transition: color 0.2s, border-color 0.2s
    .is-active
      a
        color: var(--color-text)
        border-color: var(--color-accent)
  .badge
    display: inline-block
    margin-left: 10px
    background-color: rgba(255, 255, 255, 0.08)
    padding: 2px 8px
    border-radius: 999px
    color: var(--color-text-faint)
    font-size: 0.8em
</style>
