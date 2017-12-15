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

    <a v-on:click="seriesView" class="return">Go back</a>
    <div class="nextEpisode" v-if="showNext">
      <Episode v-bind:title="next.episodeName"
               v-bind:episodeId="next.tvdbid"
               v-bind:downloaded="next.downloaded"
               v-bind:downloading="false"
               v-bind:subtitle="'S' + next.airedSeason + 'E' + next.airedEpisodeNumber + ' - ' + next.show"
               v-bind:key="next.id"
               v-bind:inside="true"
      ></Episode>
    </div>
  </div>
</template>

<script>
  import Episode from '@/components/itemTypes/Episode'
  import VueDPlayer from 'vue-dplayer'
  import { mapState } from 'vuex'

  export default {
    name: 'player',
    components: {
      'd-player': VueDPlayer,
      Episode: Episode
    },
    computed: mapState([
      'host'
    ]),
    data () {
      return {
        episode: {},
        next: {},
        autoplay: true,
        player: null,
        showNext: false,
        video: {
          url: this.axios.defaults.baseURL + '/episode/' + this.$route.params.episodeId + '/play'
        },
        contextmenu: [],
        firstPlay: true
      }
    },
    created () {
      this.axios.get('/episode/' + this.$route.params.episodeId + `/info`)
        .then(response => {
          this.episode = response.data
          this.firstPlay = true
        })
        .catch(e => {
          console.log(e)
        })
      this.axios.get('/episode/' + this.$route.params.episodeId + `/next`)
        .then(response => {
          this.next = response.data
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
        console.log(this.host)
        this.player.switchVideo({
          url: this.axios.defaults.baseURL + '/episode/' + this.$route.params.episodeId + '/play'
        })
        this.player.play()

        this.axios.get('/episode/' + this.$route.params.episodeId + `/info`)
          .then(response => {
            this.episode = response.data
            console.log(response.data)
            this.firstPlay = true
          })
          .catch(e => {
            console.log(e)
          })
        this.axios.get('/episode/' + this.$route.params.episodeId + `/next`)
          .then(response => {
            this.next = response.data
            console.log(response.data)
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    methods: {
      seriesView: function (event) {
        event.preventDefault()
        this.$router.push({name: 'SeriesView', params: {seriesId: this.episode.showid}})
      },
      pause: function () {
        this.pause()
      },
      play () {
        console.log('play callback')
      },
      canplay () {
        if (this.firstPlay) {
          this.player.video.seek(this.episode.watchTime)
          this.firstPlay = false
        }
      },
      playing () {
        this.$socket.emit('playing', {
          time: this.player.video.currentTime(),
          progress: this.player.video.currentTime() / this.player.video.duration,
          tvshow: this.episode.tvdbid
        })

        if (this.player.video.duration < 100) {
          this.showNext = false
        } else {
          this.showNext = this.player.video.duration - this.player.video.currentTime() < 60
        }
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
