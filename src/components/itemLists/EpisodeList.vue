<template>
  <div class="episodes">
    <div class="title" v-if="title">
      <h3>{{ title }}</h3>
    </div>
    <div class="episode-scroller">
    <Episode v-for="(episode, index) in episodes"
          v-bind:title="episode.episodeName"
          v-bind:episodeId="episode.tvdbid"
          v-bind:downloaded="episode.downloaded"
          v-bind:downloading="false"
             v-bind:subtitle="'S' + episode.airedSeason + 'E' + episode.airedEpisodeNumber + ' - ' + show.seriesName"
          v-bind:key="episode.id"
    ></Episode>
    </div>
  </div>
</template>

<script>
  import Episode from '@/components/itemTypes/Episode'

  export default {
    name: 'episodes-list',
    components: {Episode: Episode},
    props: ['episodes', 'title', 'show']
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
.episode-scroller
  padding: 0
  overflow: hidden
  overflow-x: visible
  white-space: nowrap

.episode-scroller::-webkit-scrollbar
  display: none

.title, .title h3
  padding: 0
  font:
    family: roboto
    size: 20px


</style>
