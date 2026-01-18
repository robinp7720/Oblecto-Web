<template>
  <li class="show">
    <div
      class="show-poster"
      :style="{ backgroundImage: 'url(' + host + '/series/' + series.id + '/poster)' }"
    >
      <a
        class="play"
        @click="viewEpisodes"
      ><i
        class="fa fa-eye"
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
      </div>
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
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'Show',
    props: ['title', 'subtitle', 'series'],
    data () {
      return {}
    },
    computed: mapState([
      'host'
    ]),
    methods: {
      openModal: function (event) {
        this.$modal.show('ShowDialog', { show: this.series })
      },
      viewEpisodes: function (event) {
        this.$router.push({ name: 'SeriesView', params: { seriesId: this.series.id } })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .show {
    display: inline-block;
    margin: 0 10px;

    width: 136px;
    position: relative;
  }

  .title {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;

    width: 136px;

    margin-top: 5px;
    padding: 0;
    text-overflow: ellipsis;

    overflow: hidden;
    color: var(--color-text)
  }

  .subtitle {
    font-family: var(--font-body);
    font-size: 12px;

    width: 136px;

    margin-top: 5px;
    padding: 0;
    text-overflow: ellipsis;
    color: var(--color-text-faint);

    overflow: hidden;
  }

  .show-poster {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;

    box-shadow: 0 18px 30px rgba(10, 8, 10, 0.45);

    background-color: rgba(0, 0, 0, 0.6);
    -webkit-background-size: cover;
    background-size: cover;
    background-position: center;

    height: 200px;
    width: 136px;

    -webkit-border-radius: 14px;
    -moz-border-radius: 14px;
    border-radius: 14px;

    border: 0 solid var(--color-accent);

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

  @media screen and (max-width: 700px) {

    .show {
      width: 108.8px;
      margin: 0 5px;
    }

    .show-poster {
      height: 160px;
      width: 108.8px;
    }

  }


  .actions {
    position: absolute;
    bottom: -28px;
    text-align: right;
    -webkit-transition: bottom 0.2s;
    -moz-transition: bottom 0.2s;
    -ms-transition: bottom 0.2s;
    -o-transition: bottom 0.2s;
    transition: bottom 0.2s;
    width: 100%;
    padding: 5px;
    background: linear-gradient(180deg, rgba(10, 8, 10, 0), rgba(10, 8, 10, 0.75));
    overflow: visible
  }

  a {
    color: var(--color-text);
    margin: 0 5px;
    cursor: pointer;
  }

  .show-poster:hover {
    box-shadow: 0 16px 34px rgba(10, 8, 10, 0.55), 0 0 0 2px var(--color-accent-soft);
    transform: translateY(-3px);
  }

  .show-poster:hover .actions {
    bottom: 0;
  }

  .actions:hover {
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

  .show-poster:hover a.play{
    opacity: 0.4;
  }

  a.play:hover {
    opacity: 1!important;
  }
</style>
