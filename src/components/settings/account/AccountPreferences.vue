<template>
  <div class="wrapper">
    <fieldset
      class="settings-fields"
      :disabled="!me"
    >
      <div class="settings-card">
        <h2 class="settings-section-title">
          {{ t('account.preferences.languageTitle') }}
        </h2>
        <div class="form-group">
          <label for="preference-language">{{ t('account.preferences.language') }}</label>
          <select
            id="preference-language"
            :value="preferences.language ?? ''"
            aria-describedby="preference-language-hint"
            @change="update('language', $event.target.value || null)"
          >
            <option value="">
              {{ t('account.preferences.browserLanguage') }}
            </option>
            <option
              v-for="locale in LOCALES"
              :key="locale.code"
              :value="locale.code"
            >
              {{ nativeName(locale.code) }}
            </option>
          </select>
          <p
            id="preference-language-hint"
            class="form-hint"
          >
            {{ t('account.preferences.languageHint') }}
          </p>
        </div>
      </div>

      <div class="settings-card">
        <h2 class="settings-section-title">
          {{ t('account.preferences.playbackTitle') }}
        </h2>
        <p class="settings-description">
          {{ t('account.preferences.playbackHint') }}
        </p>
        <div class="form-grid">
          <div class="form-group">
            <label for="preference-audio">{{ t('account.preferences.audioLanguage') }}</label>
            <select
              id="preference-audio"
              :value="preferences.audioLanguage ?? ''"
              @change="update('audioLanguage', $event.target.value || null)"
            >
              <option value="">
                {{ t('account.preferences.fileDefault') }}
              </option>
              <option
                v-for="language in trackLanguages"
                :key="language.code"
                :value="language.code"
              >
                {{ language.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="preference-quality">{{ t('account.preferences.quality') }}</label>
            <select
              id="preference-quality"
              :value="String(preferences.quality)"
              @change="update('quality', parseQuality($event.target.value))"
            >
              <option
                v-for="quality in QUALITIES"
                :key="quality"
                :value="String(quality)"
              >
                {{ qualityLabel(quality) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="preference-subtitle-mode">{{ t('account.preferences.subtitleMode') }}</label>
            <select
              id="preference-subtitle-mode"
              :value="preferences.subtitleMode"
              @change="update('subtitleMode', $event.target.value)"
            >
              <option
                v-for="mode in SUBTITLE_MODES"
                :key="mode"
                :value="mode"
              >
                {{ t(`account.preferences.subtitleModes.${mode}`) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="preference-subtitles">{{ t('account.preferences.subtitleLanguage') }}</label>
            <select
              id="preference-subtitles"
              :value="preferences.subtitleLanguage ?? ''"
              :disabled="preferences.subtitleMode === 'off'"
              @change="update('subtitleLanguage', $event.target.value || null)"
            >
              <option value="">
                {{ t('account.preferences.fileDefault') }}
              </option>
              <option
                v-for="language in trackLanguages"
                :key="language.code"
                :value="language.code"
              >
                {{ language.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="setting-row">
          <label class="checkbox-container">
            {{ t('account.preferences.autoplayNext') }}
            <input
              id="preference-autoplayNext"
              type="checkbox"
              :checked="preferences.autoplayNext"
              @change="update('autoplayNext', $event.target.checked)"
            >
            <span class="checkmark" />
          </label>
        </div>
      </div>
    </fieldset>
    <div class="settings-card-actions">
      <SaveState :state="state" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'
import { useAuthStore } from '@/stores/auth'
import { LOCALES, languageName } from '@/i18n'
import { TRACK_LANGUAGES, displayCode } from '@/playback/languages'
import oblectoClient from '@/oblectoClient'

const QUALITIES = ['original', 'auto', 1080, 720, 480, 360]
const SUBTITLE_MODES = ['auto', 'forced', 'off']

const { t, locale: interfaceLocale } = useI18n()
const authStore = useAuthStore()
const me = computed(() => authStore.me)
const preferences = computed(() => authStore.preferences)
const state = createSaveState()

void authStore.loadMe()

// Sorted by name in the current interface language.
const trackLanguages = computed(() => {
  void interfaceLocale.value

  return TRACK_LANGUAGES
    .map(([code]) => ({ code, name: languageName(displayCode(code)) }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Each language named in itself, so people can find their own.
function nativeName (code) {
  try {
    return new Intl.DisplayNames([code], { type: 'language' }).of(code) || code
  } catch {
    return code
  }
}

function qualityLabel (quality) {
  return typeof quality === 'number'
    ? t('account.preferences.qualities.height', { height: quality })
    : t(`account.preferences.qualities.${quality}`)
}

const parseQuality = value => ['original', 'auto'].includes(value) ? value : Number(value)

// Saved as soon as it changes; shown at once and put back if the server refuses.
async function update (key, value) {
  const previous = authStore.me

  authStore.setMe({ ...previous, preferences: { ...previous.preferences, [key]: value } })

  const ok = await state.run(
    async () => authStore.setMe(await oblectoClient.account.update({ preferences: { [key]: value } })),
    { busy: t('account.preferences.saving'), ok: t('account.preferences.saved'), error: t('account.preferences.saveFailed') }
  )

  if (!ok) authStore.setMe(previous)
}
</script>
