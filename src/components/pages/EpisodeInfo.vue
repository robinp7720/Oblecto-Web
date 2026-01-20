<template>
  <div class="container">
    <div class="episode">
      <div
        v-if="episodeData.id"
        ref="infoContainer"
        class="info-container"
        :style="{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255, 0) 40%, ' + endGradient + ' 80%), url(' + bannerUrl + ')' }"
      >
        <div
          v-if="posterLoaded"
          class="info"
        >
          <div class="poster">
            <img
              :src="posterUrl"
              alt=""
            >
            <a
              class="play"
              @click="playEpisode"
            ><i
              class="fa fa-play"
              aria-hidden="true"
            /></a>
          </div>
          <div class="right">
            <h2>{{ episodeData.episodeName }}</h2>
            <span
              v-if="episodeSubtitle"
              class="year"
            >{{ episodeSubtitle }}</span>
            <span
              v-if="episodeAirDate"
              class="year"
            >First aired on {{ episodeAirDate }}</span>
            <div
              v-if="episodeMeta.length"
              class="meta"
            >
              <div
                v-for="item in episodeMeta"
                :key="item.label"
                class="meta-item"
              >
                <span class="meta-label">{{ item.label }}</span>
                <span class="meta-value">{{ item.value }}</span>
              </div>
            </div>
            <p>
              {{ episodeData.overview }}
            </p>
            <div
              v-if="seriesLabel"
              class="series-link"
            >
              <a @click="viewSeries">{{ seriesLabel }}</a>
            </div>
          </div>
        </div>
      </div>

      <FileList :files="episodeData.Files || []" />
    </div>
  </div>
</template>

<script>
import FileList from '@/components/files/FileList'
import { mapState } from 'vuex'
import oblectoClient from '@/oblectoClient'

export default {
  name: 'EpisodeInfo',
  components: { FileList },
  data () {
    return {
      episodeData: {},
      endGradient: '',
      posterLoaded: false,
      posterUrl: 'data:image/png;base64,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',
      bannerUrl: ''
    }
  },
  computed: {
    ...mapState([
      'host'
    ]),
    seriesLabel () {
      const seriesName = this.normalizeText(this.episodeSeriesName)
      if (!seriesName) return null
      return `View ${seriesName}`
    },
    episodeSeriesName () {
      if (!this.episodeData) return null
      if (this.episodeData.Series && this.episodeData.Series.seriesName) return this.episodeData.Series.seriesName
      return this.normalizeText(this.episodeData.seriesName)
    },
    episodeSubtitle () {
      const season = Number(this.episodeData.airedSeason)
      const episode = Number(this.episodeData.airedEpisodeNumber)
      const parts = []
      if (Number.isFinite(season) && Number.isFinite(episode)) {
        parts.push(`S${season}E${episode}`)
      }
      const seriesName = this.normalizeText(this.episodeSeriesName)
      if (seriesName) {
        parts.push(seriesName)
      }
      return parts.length ? parts.join(' • ') : null
    },
    episodeAirDate () {
      return this.normalizeText(this.episodeData.firstAired || this.episodeData.aired || this.episodeData.airDate)
    },
    episodeMeta () {
      if (!this.episodeData) return []

      const meta = []

      const runtime = this.formatRuntime(this.episodeData.runtime)
      if (runtime) meta.push({ label: 'Runtime', value: runtime })

      const contentRating = this.normalizeText(this.episodeData.rating)
      if (contentRating) meta.push({ label: 'Content rating', value: contentRating })

      const communityRating = this.formatCommunityRating(this.episodeData.siteRating, this.episodeData.siteRatingCount)
      if (communityRating) meta.push({ label: 'Community rating', value: communityRating })

      return meta
    }
  },
  watch: {
    async '$route' (to, from) {
      await this.update()
    }
  },
  async mounted () {
    this.updateGradient()
    window.addEventListener('resize', this.updateGradient)
    window.addEventListener('scroll', this.updateGradient)
  },
  async updated () {
    this.updateGradient()
  },
  async created () {
    await this.update()
  },
  async beforeUnmount () {
    window.removeEventListener('resize', this.updateGradient)
    window.removeEventListener('scroll', this.updateGradient)
  },
  methods: {
    playEpisode (event) {
      event.preventDefault()
      this.$store.dispatch('playEpisode', this.episodeData.id)
    },
    viewSeries (event) {
      event.preventDefault()
      const seriesId = this.episodeData && this.episodeData.Series && this.episodeData.Series.id
      if (!seriesId) return
      this.$router.push({ name: 'SeriesView', params: { seriesId } })
    },
    async update () {
      this.posterLoaded = false
      this.episodeData = await oblectoClient.episodeLibrary.getInfo(this.$route.params.episodeId)
      this.bannerUrl = this.host + '/episode/' + this.episodeData.id + '/banner'

      const seriesId = this.episodeData && this.episodeData.Series && this.episodeData.Series.id
      const posterSrc = seriesId ? (this.host + '/series/' + seriesId + '/poster') : this.bannerUrl

      const posterImage = new Image()
      posterImage.src = posterSrc

      posterImage.onload = () => {
        this.posterUrl = posterImage.src
        this.posterLoaded = true
      }

      posterImage.onerror = () => {
        if (posterImage.src !== this.bannerUrl) {
          const fallback = new Image()
          fallback.src = this.bannerUrl
          fallback.onload = () => {
            this.posterUrl = fallback.src
            this.posterLoaded = true
          }
          fallback.onerror = () => {
            this.posterLoaded = true
          }
        } else {
          this.posterLoaded = true
        }
      }
    },
    gradientColor () {
      if (!this.$refs.infoContainer) return [0, 0, 0]

      let infoBottom = this.$refs.infoContainer.getBoundingClientRect().bottom

      let wh = window.innerHeight
      let st = (wh * 0.36)

      var w1 = infoBottom / st

      var w2 = 1 - w1

      var rgb = [
        Math.round(105 * w2 + 85 * w1),
        Math.round(96 * w2 + 83 * w1),
        Math.round(96 * w2 + 91 * w1)
      ]

      if ((infoBottom - st) < 0) {
        return rgb
      }

      w1 = ((infoBottom - st)) / (wh - st)
      w2 = 1 - w1

      rgb = [
        Math.round(85 * w2 + 40 * w1),
        Math.round(83 * w2 + 52 * w1),
        Math.round(91 * w2 + 59 * w1)
      ]
      return rgb
    },
    updateGradient () {
      let g = this.gradientColor()
      this.endGradient = `rgb(${g[0]}, ${g[1]}, ${g[2]})`
    },
    normalizeText (value) {
      if (value === null || value === undefined) return null
      const text = String(value).trim()
      return text.length > 0 ? text : null
    },
    formatRuntime (value) {
      const minutes = Number(value)
      if (!Number.isFinite(minutes) || minutes <= 0) return null
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
      if (hours > 0) return `${hours}h`
      return `${mins}m`
    },
    formatCommunityRating (score, count) {
      const ratingValue = Number(score)
      if (!Number.isFinite(ratingValue) || ratingValue <= 0) return null
      const rounded = Math.round(ratingValue * 10) / 10
      const countValue = Number(count)
      if (Number.isFinite(countValue) && countValue > 0) {
        return `${rounded} (${this.formatCount(countValue)})`
      }
      return String(rounded)
    },
    formatCount (value) {
      if (!Number.isFinite(value)) return null
      if (value >= 1000000) {
        return `${Math.round(value / 100000) / 10}m`
      }
      if (value >= 1000) {
        return `${Math.round(value / 100) / 10}k`
      }
      return `${Math.round(value)}`
    }
  }
}
</script>

<style scoped lang="sass">
.info-container
  margin-top: -20px

  padding: 260px 10px 10px

  background-size: cover
  background-position: center

  position: relative

  z-index: 0

.info
  font-size: 1em
  border-radius: 16px
  background: var(--color-surface-card)
  border: 1px solid var(--color-border)
  box-shadow: var(--shadow-strong)
  padding-bottom: 40px

  min-height: 240px

  &::after
    content: ""
    display: block
    clear: both

  .poster
    position: relative

    height: 300px
    width: 204px

    float: left
    box-shadow: 0 18px 40px rgba(12, 10, 12, 0.6)
    border-radius: 14px
    overflow: hidden

    margin: -50px 20px 20px

    @media screen and (max-width: 700px)
      height: 200px
      width: 133.333px

    img
      height: 100%
      width: 100%
      object-fit: cover

  .right
    padding: 20px

    h2
      padding: 0
      font-size: 1.6em
      margin: 0 0 8px
      font-family: var(--font-display)

    .year, .genres
      color: var(--color-text-muted)
      margin-bottom: 10px
      padding: 0
      font-weight: normal

    p
      color: var(--color-text)
      padding: 0
      margin: 20px 0 0

      max-width: 900px

    .meta
      display: flex
      flex-wrap: wrap
      gap: 8px 20px
      margin-top: 10px
      color: var(--color-text-muted)

      .meta-item
        min-width: 140px
        display: flex
        flex-direction: column

      .meta-label
        text-transform: uppercase
        letter-spacing: 0.08em
        font-size: 0.65em
        color: var(--color-text-faint)
        margin-bottom: 2px

      .meta-value
        color: var(--color-text)

    .genres
      float: right
      margin-top: 20px

.series-link
  margin-top: 12px

  a
    color: var(--color-text)
    cursor: pointer

.genres
  list-style: none

  li
    display: inline-block
    margin-right: 3px
    font-style: italic

  li:after
    content: ","

  li:last-child:after
    content: ''

a
  color: var(--color-text)
  margin: 0 5px
  cursor: pointer

.fa
  margin-left: 10px

a.play
  opacity: 0
  display: block
  font-size: 4em
  margin: 0
  width: 100px
  height: 100px

  position: absolute
  top: calc(50% - 50px)
  left: calc(50% - 50px)

  background-color: rgba(0, 0, 0, 0.6)
  border: 2px solid rgba(255, 255, 255, 0.8)
  border-radius: 100%
  text-align: center
  line-height: 100px
  transition: opacity 0.2s

.poster:hover a.play
  opacity: 0.4

a.play:hover
  opacity: 1 !important
</style>
