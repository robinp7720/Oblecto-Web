<template>
  <transition
    name="slide-fade"
    appear
  >
    <div class="episode">
      <div
        class="episode-poster"
        :style="{ backgroundImage: 'url(' + bannerUrl + ')' }"
      >
        <a
          class="play"
          @click="playEpisode"
        ><i
          class="fa fa-play"
          aria-hidden="true"
        /></a>
        <div
          v-if="inside"
          :title="episode.episodeName"
          class="title"
        >
          {{ episode.episodeName }}
        </div>
        <div
          v-if="progress"
          class="progress"
          :style="{ width: progress * 100 + '%' }"
        />
        <div class="actions">
          <a
            class="action-item"
            title="Options"
            @click="openEpisodeDialog"
          >
            <i
              class="fa fa-info"
              aria-hidden="true"
            />
          </a>
          <a
            class="action-item"
            title="Info"
            @click="viewEpisodeInfo"
          >
            <i
              class="fa fa-eye"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
      <div
        v-if="!inside"
        :title="episode.episodeName"
        class="title"
      >
        {{ episode.episodeName }}
      </div>
      <div
        v-if="subtitle && !inside"
        class="subtitle"
      >
        {{ subtitle }}
      </div>
    </div>
  </transition>
</template>

<script>
  import { mapState } from 'vuex'
  import { getSocket } from '@/socket'

  export default {
    name: 'Episode',
    props: {
      'subtitle': {
        type: String,
        required: false
      },
      'inside': {
        type: Boolean,
        required: false,
        default: false
      },
      'episode': {
        required: true,
        default: false
      }
    },
    data () {
      return {
        progress: 0,
        loaded: false,
        bannerUrl: '',
        bannerLoaded: false
      }
    },
    watch: {
      episode: async function (newState, oldState) {
        if (this.episode.TrackEpisodes[0]) {
          this.progress = this.episode.TrackEpisodes[0].progress
        }
      }
    },
    created () {
      if (this.episode.TrackEpisodes[0]) {
        this.progress = this.episode.TrackEpisodes[0].progress
      }

      const img = new Image()
      img.src = this.host + '/episode/' + this.episode.id + '/banner'

      img.onload = () => {
        this.bannerUrl = img.src
        this.bannerLoaded = true
      }

      img.onerror = () => {
        this.posterLoaded = true
      }

      getSocket().on('client-episode-progress', this.handleEpisodeProgress)
    },
    mounted () {

    },
    beforeUnmount () {
      getSocket().off('client-episode-progress', this.handleEpisodeProgress)
    },
    computed: {
      ...mapState([
        'host'
      ])
    },
    methods: {
      handleEpisodeProgress: function (message) {
        if (message.episodeId === this.episode.id) {
          this.episode.TrackEpisodes[0] = message
          this.progress = message.progress
        }
      },
      playEpisode: function (event) {
        event.preventDefault()
        // this.$router.push({name: 'PlayEpisode', params: {episodeId: this.episodeId}})
        this.$store.dispatch('playEpisode', this.episode.id)
      },
      openEpisodeDialog: function (event) {
        this.$modal.show('EpisodeDialog', { episode: this.episode })
      },
      viewEpisodeInfo: function (event) {
        this.$router.push({ name: 'EpisodeInfo', params: { episode: this.episode.id } })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .load-detector {

  }
  .slide-fade-enter-active {
    transition: all .5s;
  }

  .slide-fade-leave-active {
    transition: all .5s;
  }

  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active below version 2.1.8 */
  {
    transform: translateX(10px);
    opacity: 0;
  }

  .episode {
    display: inline-block;
    margin: 0 10px;

    width: 357px;
  }

  .title {
    font-family: Roboto, sans-serif;
    font-size: 13px;

    margin-top: 5px;
    padding: 0;
    text-overflow: ellipsis;

    overflow: hidden;
    color: #eee
  }

  .subtitle {
    font-family: Roboto, sans-serif;
    font-size: 12px;

    margin-top: 5px;
    padding: 0;
    text-overflow: ellipsis;
    color: #aaa;

    overflow: hidden;
  }

  .episode-poster {
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.75);

    background-color: rgba(0, 0, 0, 0.8);
    -webkit-background-size: cover;
    background-size: cover;
    background-position: center;

    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;

    height: 200px;
    width: 357px;

    border: 0 solid #ae6600;

    -webkit-transition: box-shadow 0.1s, opacity 0.1s;
    -moz-transition: box-shadow 0.1s, opacity 0.1s;
    -ms-transition: box-shadow 0.1s, opacity 0.1s;
    -o-transition: box-shadow 0.1s, opacity 0.1s;
    transition: box-shadow 0.1s, opacity 0.1s;

    position: relative;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media screen and (max-width: 700px) {

    .episode {
      width: 285.6px;
      margin: 0 5px;
    }

    .episode-poster {
      height: 160px;
      width: 285.6px
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
    background-color: rgba(0, 0, 0, 0.5);
  }

  a {
    color: white;
    margin: 0 5px;
    cursor: pointer;
  }

  .episode-poster:hover {
    box-shadow: 0 0 0 2px rgba(174, 102, 0, 0.75);
    opacity: 1;
  }

  .episode-poster:hover .actions {
    bottom: 0;
  }

  a.play {
    opacity: 0;
    display: block;
    font-size: 4em;
    margin: 0;
    width: 100px;
    height: 100px;
    background-color: rgba(0, 0, 0, 0.5);
    border: 2px solid white;
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

  .episode-poster:hover a.play {
    opacity: 0.4;
  }

  a.play:hover {
    opacity: 1 !important;
  }

  .episode-poster .title {
    position: absolute;
    bottom: 0;
    left: 0;
    font-size: 1.4em;
    padding: 10px;
  }

  .progress {
    height: 5px;
    background-color: #ae6600;
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>
