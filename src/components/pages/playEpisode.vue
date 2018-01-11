<template>
  <div class="container">
    <d-player
              ref="player"
              :autoplay="autoplay"
              :contextmenu="contextmenu"
              :loop="false"
              :video="video"
              lang="en"

              v-if="episode"

              @play="play"
              @canplay="canplay"
              @playing="playing"

    > </d-player>

    <a v-on:click="seriesView" class="return">Go back</a>
    <div class="nextEpisode" v-if="showNext">
      <Episode v-bind:title="next.episodeName"
               v-bind:episodeId="next.id"
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
        episode: false,
        next: {},
        autoplay: true,
        player: null,
        showNext: false,
        contextmenu: [],
        firstPlay: true, // firstplay defines whether or not to seek to the last point watched which is sent by the server
        video: {
          url: this.axios.defaults.baseURL + '/episode/' + this.$route.params.episodeId + '/play'
        }
      }
    },
    async created () {
      let { data: episode } = await this.axios.get('/episode/' + this.$route.params.episodeId + `/info`)
      this.episode = episode

      let { data: next } = await this.axios.get('/episode/' + this.$route.params.episodeId + `/next`)
      this.next = next
    },
    watch: {
      async '$route' (to, from) {
        this.player.switchVideo({
          url: this.axios.defaults.baseURL + '/episode/' + this.$route.params.episodeId + '/play'
        })

        this.player.play()

        let { data: episode } = await this.axios.get('/episode/' + this.$route.params.episodeId + `/info`)
        this.episode = episode

        let { data: next } = await this.axios.get('/episode/' + this.$route.params.episodeId + `/next`)
        this.next = next
      }
    },
    methods: {
      seriesView: function (event) {
        event.preventDefault()
        this.$router.push({name: 'SeriesView', params: {seriesId: this.episode.tvshowId}})
      },
      pause: function () {
        this.player.video.pause()
      },
      play () {
      },
      canplay () {
        this.player = this.$refs.player.dp

        if (!this.firstPlay) {
          return false
        }

        this.player.video.seek(this.episode.watchTime)
        this.firstPlay = false
      },
      playing: function () {
        if (!this.player) {
          return false
        }

        this.$socket.emit('playing', {
          time: this.player.video.currentTime(),
          progress: this.player.video.currentTime() / this.player.video.duration,
          tvshowId: this.episode.tvshowId,
          episodeId: this.episode.id,
          type: 'tv'
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
