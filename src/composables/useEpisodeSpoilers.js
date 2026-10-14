import { computed, ref, toValue, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMediaStore } from '@/stores/media'

import { episodeSpoilerState } from '@/utils/tvDetails'
export { episodeSpoilerState } from '@/utils/tvDetails'

export function useEpisodeSpoilers (item) {
  const auth = useAuthStore()
  const media = useMediaStore()
  const revealed = ref(false)
  // Do not flash spoilers while the account's preference is loading.
  const preference = computed(() => !auth.me && !auth.legacyServer ? 'hide-titles' : auth.preferences.episodeSpoilers)
  watch([() => toValue(item)?.id, preference, () => media.epoch], () => { revealed.value = false })
  const state = computed(() => episodeSpoilerState(media.withProgress('episode', toValue(item)), preference.value, revealed.value))
  return {
    hidden: computed(() => state.value.hidden), title: computed(() => state.value.title), overview: computed(() => state.value.overview),
    reveal: () => { revealed.value = true }, preference
  }
}
