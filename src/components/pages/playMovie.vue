<template>
  <div class="container">
    <d-player ref="player"
              :video="video"
              :autoplay="autoplay"
              :contextmenu="contextmenu"
              :loop="false"
              lang="en"

              @play="play"
              @canplay="canplay"
              @playing="playing"
    > </d-player>

    <a v-on:click="back" class="return">Go back</a>
  </div>
</template>

<script>
  import VueDPlayer from 'vue-dplayer'
  import { mapState } from 'vuex'

  export default {
    name: 'player',
    components: {
      'd-player': VueDPlayer
    },
    computed: mapState([
      'host'
    ]),
    data () {
      return {
        movie: {},
        autoplay: true,
        player: null,
        video: {
          url: this.axios.defaults.baseURL + '/movie/' + this.$route.params.movieId + '/play'
        },
        contextmenu: [],
        firstPlay: true
      }
    },
    created () {
      this.axios.get('/movie/' + this.$route.params.movieId + `/info`)
        .then(response => {
          this.movie = response.data

          this.firstPlay = true
        })
        .catch(e => {
          console.log(e)
        })
    },
    mounted () {
      this.player = this.$refs.player.dp
    },
    watch: {
      '$route' (to, from) {
        this.player.switchVideo({
          url: this.axios.defaults.baseURL + '/movie/' + this.$route.params.movieId + '/play'
        })

        this.player.play()

        this.axios.get('/movie/' + this.$route.params.movieId + `/info`)
          .then(response => {
            this.movie = response.data
            this.firstPlay = true
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    methods: {
      back (event) {
        event.preventDefault()
        this.$router.push({name: 'Movies'})
      },
      pause () {
        this.player.video.pause()
      },
      play () {
        console.log('play callback')
      },
      canplay () {
        if (this.firstPlay) {
          this.player.video.seek(this.movie.watchTime)
          this.firstPlay = false
        }
      },
      playing () {
        this.$socket.emit('playing', {
          time: this.player.video.currentTime(),
          progress: this.player.video.currentTime() / this.player.video.duration,
          movieId: this.movie.id,
          type: 'movie'
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .container, .dplayer {
    width: 100%;
    height: 100%;
    min-height: 0;
    position: fixed;
    top: 0;
    left: 0;
    background-color: black;
  }

  a.return {
    position: fixed;
    top: 50px;
    left: 50px;

    text-decoration: none;
    color: white;
    font-size: 1.2em;
    padding: 20px;
    background-color: rgba(0,0,0,0.5);
    border: 1px solid white;

    -webkit-border-radius: 15px;
    -moz-border-radius: 15px;
    border-radius: 15px;

    -webkit-transition: opacity 0.5s;
    -moz-transition: opacity 0.5s;
    -ms-transition: opacity 0.5s;
    -o-transition: opacity 0.5s;
    transition: opacity 0.5s;

    opacity: 0.2;
  }

  a.return:hover {
    opacity: 1;
  }

  .nextEpisode {
    position: fixed;
    bottom: 50px;
    right: 50px;
  }
</style>
