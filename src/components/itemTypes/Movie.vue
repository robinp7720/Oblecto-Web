<template>
  <transition
    name="slide-fade"
    appear
  >
    <li
      v-if="horizontal"
      class="movie-horizontal"
    >
      <div
        class="movie-poster"
        :style="{ backgroundImage: 'url(' + host + '/movie/' + movieId + '/banner)' }"
      >
        <a
          class="play"
          @click="playMovie"
        ><i
          class="fa fa-play"
          aria-hidden="true"
        /></a>
        <div
          v-if="inside"
          :title="title"
          class="title"
        >
          {{ title }}
        </div>
        <div
          class="progress"
          :style="{ width: progress * 100 + '%' }"
        />
      </div>
      <div
        v-if="!inside"
        :title="title"
        class="title"
      >
        {{ title }}
      </div>
      <div
        v-if="subtitle && !inside"
        class="subtitle"
      >
        {{ subtitle }}
      </div>
    </li>

    <li
      v-if="!horizontal"
      class="movie-vertical"
    >
      <div
        class="movie-poster"
        :style="{ backgroundImage: 'url(' + host + '/movie/' + movieId + '/poster)' }"
      >
        <a
          class="play"
          @click="playMovie"
        ><i
          class="fa fa-play"
          aria-hidden="true"
        /></a>
        <div class="actions">
          <a
            class="action-item"
            title="Options"
            @click="openModal"
          >
            <i
              class="fa fa-info"
              aria-hidden="true"
            />
          </a>
          <a
            class="action-item"
            title="Info"
            @click="viewMovieInfo"
          >
            <i
              class="fa fa-eye"
              aria-hidden="true"
            />
          </a>
        </div>
        <div
          class="progress"
          :style="{ width: progress * 100 + '%' }"
        />
      </div>
      <div
        :title="title"
        class="title"
      >
        {{ title }}
      </div>
      <div
        v-if="subtitle"
        class="subtitle"
      >
        {{ subtitle }}
      </div>
    </li>
  </transition>
</template>

<script>
  import { mapState } from 'vuex'
  import { getSocket } from '@/socket'

  export default {
    name: 'Movie',
    props: ['title', 'movieId', 'subtitle', 'inside', 'horizontal', 'movie'],
    computed: mapState([
      'host'
    ]),
    created () {
      if (this.movie.TrackMovies[0]) {
        this.progress = this.movie.TrackMovies[0].progress
      }
      getSocket().on('client-movie-progress', this.handleMovieProgress)
    },
    data () {
      return {
        progress: 0
      }
    },
    beforeUnmount () {
      getSocket().off('client-movie-progress', this.handleMovieProgress)
    },
    methods: {
      handleMovieProgress: function (message) {
        if (message.movieId === this.movieId) {
          this.movie.TrackMovies[0] = message
          this.progress = message.progress
        }
      },
      playMovie: function (event) {
        event.preventDefault()
        this.$store.dispatch('playMovie', this.movie.id)
      },
      openModal: function (event) {
        this.$modal.show('MovieDialog', { movie: this.movie })
      },
      viewMovieInfo: function (event) {
        this.$router.push({ name: 'MovieInfo', params: { movieId: this.movieId } })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .slide-fade-enter-active {
    transition: all .5s;
  }
  .slide-fade-leave-active {
    transition: all .5s;
  }
  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
  }

  .movie-horizontal {
    display: inline-block;
    margin: 0 10px;

    width: 357px;
  }

  .movie-vertical {
    display: inline-block;
    margin: 0 10px;

    width: 136px;
    position: relative;
  }

  .title {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;

    margin-top: 5px;
    padding: 0;
    text-overflow: ellipsis;

    overflow: hidden;
    color: var(--color-text)
  }

  .subtitle {
    font-family: var(--font-body);
    font-size: 12px;

    margin-top: 5px;
    padding: 0;
    text-overflow: ellipsis;
    color: var(--color-text-faint);

    overflow: hidden;
  }

  .movie-poster {
    box-shadow: 0 18px 30px rgba(10, 8, 10, 0.45);

    background-color: rgba(0, 0, 0, 0.6);
    -webkit-background-size: cover;
    background-size: cover;
    background-position: center;

    -webkit-border-radius: 14px;
    -moz-border-radius: 14px;
    border-radius: 14px;

    -webkit-transition: box-shadow 0.2s, opacity 0.2s, transform 0.2s;
    -moz-transition: box-shadow 0.2s, opacity 0.2s, transform 0.2s;
    -ms-transition: box-shadow 0.2s, opacity 0.2s, transform 0.2s;
    -o-transition: box-shadow 0.2s, opacity 0.2s, transform 0.2s;
    transition: box-shadow 0.2s, opacity 0.2s, transform 0.2s;

    position: relative;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .movie-horizontal .movie-poster {
    height: 200px;
    width: 357px;
  }

  .movie-vertical .movie-poster {
    height: 200px;
    width: 136px;
  }

  @media screen and (max-width: 700px) {

    .movie-horizontal {
      width: 285.6px;
      margin: 0 5px;
    }

    .movie-vertical {
      width: 108.8px;
      margin: 0 5px;
    }

    .movie-horizontal .movie-poster {
      height: 160px;
      width: 285.6px;
    }

    .movie-vertical .movie-poster {
      height: 160px;
      width: 108.8px;
    }

  }


  .actions {
    position: absolute;
    bottom: -50px;
    text-align: right;
    -webkit-transition: bottom 0.2s;
    -moz-transition: bottom 0.2s;
    -ms-transition: bottom 0.2s;
    -o-transition: bottom 0.2s;
    transition: bottom 0.2s;
    width: 100%;
    padding: 5px;
    background: linear-gradient(180deg, rgba(10, 8, 10, 0), rgba(10, 8, 10, 0.75));
  }

  a {
    color: var(--color-text);
    margin: 0 5px;
    cursor: pointer;
  }

  .movie-poster:hover {
    box-shadow: 0 16px 34px rgba(10, 8, 10, 0.55), 0 0 0 2px var(--color-accent-soft);
    transform: translateY(-3px);
    opacity: 1;
  }

  .movie-poster:hover .actions {
    bottom: 0;
  }

  a.play {
    opacity: 0;
    display: block;
    font-size: 4em;
    margin: 0;
    width: 100px;
    height: 100px;
    background-color: rgba(0,0,0,0.6);
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 100%;
    text-align: center;
    line-height: 100px;
    -webkit-transition: opacity 0.2s;
    -moz-transition: opacity 0.2s;
    -ms-transition: opacity 0.2s;
    -o-transition: opacity 0.2s;
    transition: opacity 0.2s;
  }
  .fa {
    margin-left: 10px;
  }

  .movie-poster:hover a.play{
    opacity: 0.4;
  }

  a.play:hover {
    opacity: 1!important;
  }

  .movie-poster .title {
    position: absolute;
    bottom: 0;
    left: 0;
    font-size: 1.4em;
    padding: 10px;
    color: var(--color-text);
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  }

  .progress {
    height: 5px;
    background-color: var(--color-accent);
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>
