<template>
  <div class="wrapper">
    <form
      class="settings-card"
      @submit.prevent="saveProfile"
    >
      <h2 class="settings-section-title">
        {{ t('account.profile.title') }}
      </h2>
      <fieldset
        class="settings-fields"
        :disabled="!me"
      >
        <div class="form-grid">
          <div class="form-group">
            <label for="account-name">{{ t('account.profile.name') }}</label>
            <input
              id="account-name"
              v-model="name"
              type="text"
              autocomplete="name"
              aria-describedby="account-name-hint"
            >
            <p
              id="account-name-hint"
              class="form-hint"
            >
              {{ t('account.profile.nameHint') }}
            </p>
          </div>
          <div class="form-group">
            <label for="account-email">{{ t('account.profile.email') }}</label>
            <input
              id="account-email"
              v-model="email"
              type="email"
              autocomplete="email"
            >
          </div>
        </div>
        <dl class="account-facts">
          <div>
            <dt>{{ t('account.profile.username') }}</dt>
            <dd :title="t('account.profile.usernameHint')">
              {{ me?.username }}
            </dd>
          </div>
          <div>
            <dt>{{ t('account.profile.group') }}</dt>
            <dd>{{ me?.group?.name || t('account.profile.noGroup') }}</dd>
          </div>
        </dl>
      </fieldset>
      <div class="settings-card-actions">
        <SaveState :state="profileState" />
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!dirty || profileState.status === 'busy'"
        >
          {{ t('account.profile.save') }}
        </button>
      </div>
    </form>

    <div class="settings-card">
      <h2 class="settings-section-title">
        {{ t('account.profile.pictureTitle') }}
      </h2>
      <div class="picture-row">
        <UserAvatar
          v-if="me"
          :user="me"
          :size="96"
        />
        <div class="picture-actions">
          <p class="form-hint">
            {{ t('account.profile.pictureHint') }}
          </p>
          <div class="picture-buttons">
            <button
              type="button"
              class="btn"
              :disabled="!me || pictureState.status === 'busy'"
              @click="$refs.avatarFile.click()"
            >
              {{ t('account.profile.upload') }}
            </button>
            <button
              v-if="me?.avatar"
              type="button"
              class="btn btn-secondary"
              :disabled="pictureState.status === 'busy'"
              @click="removeAvatar"
            >
              {{ t('account.profile.remove') }}
            </button>
          </div>
          <input
            ref="avatarFile"
            type="file"
            accept="image/*"
            hidden
            @change="pickAvatar"
          >
        </div>
      </div>
      <div class="settings-card-actions">
        <SaveState :state="pictureState" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SaveState from '@/components/system/SaveState.vue'
import UserAvatar from '@/components/system/UserAvatar.vue'
import { createSaveState } from '@/composables/useSaveState'
import { useLeaveGuard } from '@/composables/useLeaveGuard'
import { useAuthStore } from '@/stores/auth'
import oblectoClient from '@/oblectoClient'

const { t } = useI18n()
const authStore = useAuthStore()
const me = computed(() => authStore.me)

const name = ref('')
const email = ref('')
const profileState = createSaveState()
const pictureState = createSaveState()

// Refill the form whenever the account arrives or changes.
watch(me, value => {
  name.value = value?.name || ''
  email.value = value?.email || ''
}, { immediate: true })

const dirty = computed(() => Boolean(me.value) && (name.value !== (me.value.name || '') || email.value !== (me.value.email || '')))
useLeaveGuard(dirty)

void authStore.loadMe()

function saveProfile () {
  return profileState.run(
    async () => authStore.setMe(await oblectoClient.account.update({ name: name.value, email: email.value })),
    { busy: t('account.profile.saving'), ok: t('account.profile.saved'), error: t('account.profile.saveFailed') }
  )
}

function pickAvatar (event) {
  const [file] = event.target.files

  // Cleared so picking the same file again still fires a change.
  event.target.value = ''

  if (!file) return

  return pictureState.run(
    async () => authStore.setMe(await oblectoClient.account.uploadAvatar(file)),
    { busy: t('account.profile.uploading'), ok: t('account.profile.uploaded'), error: t('account.profile.uploadFailed') }
  )
}

function removeAvatar () {
  return pictureState.run(
    async () => authStore.setMe(await oblectoClient.account.removeAvatar()),
    { busy: t('account.profile.removing'), ok: t('account.profile.removed'), error: t('account.profile.removeFailed') }
  )
}
</script>

<style scoped lang="sass">
.account-facts
  display: flex
  flex-wrap: wrap
  gap: 12px 40px
  margin: 4px 0 0

  dt
    color: var(--color-text-muted)
    font-size: 0.85em

  dd
    margin: 4px 0 0

.picture-row
  display: flex
  align-items: center
  gap: 20px

.picture-actions
  display: grid
  gap: 12px

  .form-hint
    margin: 0

.picture-buttons
  display: flex
  flex-wrap: wrap
  gap: 10px
</style>
