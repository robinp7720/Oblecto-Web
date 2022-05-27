<template>
  <div class="container">
    <EpisodeList title="Recently aired"
                 v-bind:episodes="episodes.firstAired"
    />
    <SeriesList title="Recently added series"
              v-bind:series="series.createdAt"
    />
    <EpisodeList title="Recently added episodes"
                 v-bind:episodes="episodes.createdAt"
    />
    <MovieList title="Recently added movies"
               v-bind:movies="movies.createdAt"
    />
    <SeriesList title="Shows watched by others"
              v-bind:series="series.siteRatingCount"
    />
    <MovieList title="Popular movies"
               v-bind:movies="movies.popularity"
    />
    <SeriesList title="Best rated series"
              v-bind:series="series.siteRating"
    />
    <MovieList title="Recently released movies"
               v-bind:movies="movies.releaseDate"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import SeriesList from '@/components/itemLists/SeriesList.vue';
import EpisodeList from '@/components/itemLists/EpisodeList.vue';
import MovieList from '@/components/itemLists/MovieList.vue';

export default {
  name: 'main-view',
  components: {
    SeriesList,
    EpisodeList,
    MovieList,
  },
  computed: mapState({
    movies: (state) => state.movies.lists,
    series: (state) => state.series.lists,
    episodes: (state) => state.episodes.lists,
  }),
  created() {
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
