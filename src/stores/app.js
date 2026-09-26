import { defineStore } from 'pinia'
import oblectoClient from '@/oblectoClient'
import { ScreenFormats } from '@/enums/ScreenFormats'
import { useRemoteStore } from '@/remote/state'
import { sendCommand } from '@/remote/transport'

export const useAppStore = defineStore('app', {
  state: () => ({ host: oblectoClient.axios.defaults.baseURL, playing: {}, playSizeFormat: ScreenFormats.SMALL, playRequest: 0 }),
  actions: {
    updateHost (host) {
      this.host = host
      oblectoClient.axios.defaults.baseURL = host
    },
    setPlaying (playing) { this.playRequest++; this.playing = playing },
    setPlaySizeFormat (mode) { this.playSizeFormat = mode },
    clearPlaying () { this.setPlaying({}) },
    // `continuous`: the title follows on from the one playing (the next
    // episode). The current one is not cleared first, so the player, its
    // video element, fullscreen and picture-in-picture all carry over and the
    // new title takes the old one's place at the same size.
    // `position`: start there (seconds) instead of where the user left off;
    // Start over passes 0. `fileId`: play that version of the title.
    async playLocal (type, id, { continuous = false, position, fileId } = {}) {
      if (continuous) this.playRequest++
      else this.clearPlaying()
      const request = this.playRequest
      const client = type === 'movie' ? oblectoClient.movieLibrary : oblectoClient.episodeLibrary
      const entity = await client.getInfo(id)
      if (request !== this.playRequest) return
      this.playing = { title: type === 'movie' ? entity.movieName : entity.episodeName, type, entity, continuous, ...(Number.isFinite(position) ? { startAt: position } : {}), ...(fileId !== undefined ? { fileId } : {}) }
    },
    playMovieLocal (id, options) { return this.playLocal('movie', id, options) },
    playEpisodeLocal (id, options) { return this.playLocal('episode', id, options) },
    async play (type, id, { position, fileId } = {}) {
      const remote = useRemoteStore()
      const request = this.playRequest
      const at = Number.isFinite(position) ? { position } : {}
      // The remote protocol has no way to name a file, so a chosen version
      // plays here, where it can be honoured.
      if (remote.isRemote && fileId === undefined) {
        const ack = await sendCommand(remote.targetDeviceId, { type: 'play', media: { kind: type, id: String(id) }, ...at })
        if (ack.ok) return
      }
      if (request !== this.playRequest) return
      await this.playLocal(type, id, { ...at, fileId })
    },
    playMovie (id, options) { return this.play('movie', id, options) },
    playEpisode (id, options) { return this.play('episode', id, options) }
  }
})
