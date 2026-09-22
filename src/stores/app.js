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
    async playLocal (type, id) {
      this.clearPlaying()
      const request = this.playRequest
      const client = type === 'movie' ? oblectoClient.movieLibrary : oblectoClient.episodeLibrary
      const entity = await client.getInfo(id)
      if (request !== this.playRequest) return
      this.playing = { title: type === 'movie' ? entity.movieName : entity.episodeName, type, entity }
    },
    playMovieLocal (id) { return this.playLocal('movie', id) },
    playEpisodeLocal (id) { return this.playLocal('episode', id) },
    async play (type, id) {
      const remote = useRemoteStore()
      const request = this.playRequest
      if (remote.isRemote) {
        const ack = await sendCommand(remote.targetDeviceId, { type: 'play', media: { kind: type, id: String(id) } })
        if (ack.ok) return
      }
      if (request !== this.playRequest) return
      await this.playLocal(type, id)
    },
    playMovie (id) { return this.play('movie', id) },
    playEpisode (id) { return this.play('episode', id) }
  }
})
