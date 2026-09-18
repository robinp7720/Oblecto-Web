<template>
  <form
    class="settings-card"
    @submit.prevent="changePassword"
  >
    <h2 class="settings-section-title">
      {{ t('account.password.title') }}
    </h2>
    <p
      v-if="me && !me.hasPassword"
      class="settings-description"
    >
      {{ t('account.password.noPassword') }}
    </p>
    <!-- Lets password managers tie the new password to this account. -->
    <input
      type="text"
      name="username"
      autocomplete="username"
      :value="me?.username || ''"
      hidden
      readonly
    >
    <div
      v-if="!me || me.hasPassword"
      class="form-group"
    >
      <label for="account-current-password">{{ t('account.password.current') }}</label>
      <input
        id="account-current-password"
        v-model="current"
        type="password"
        autocomplete="current-password"
        required
      >
    </div>
    <div class="form-grid">
      <div
        class="form-group"
        :class="{ 'is-invalid': Boolean(problem) }"
      >
        <label for="account-new-password">{{ t('account.password.new') }}</label>
        <input
          id="account-new-password"
          v-model="next"
          type="password"
          autocomplete="new-password"
          :aria-describedby="problem ? 'account-password-problem' : undefined"
          required
        >
      </div>
      <div
        class="form-group"
        :class="{ 'is-invalid': Boolean(problem) }"
      >
        <label for="account-confirm-password">{{ t('account.password.confirm') }}</label>
        <input
          id="account-confirm-password"
          v-model="confirmation"
          type="password"
          autocomplete="new-password"
          :aria-describedby="problem ? 'account-password-problem' : undefined"
          required
        >
      </div>
    </div>
    <p
      v-if="problem"
      id="account-password-problem"
      class="form-hint form-error"
    >
      {{ problem }}
    </p>
    <div class="settings-card-actions">
      <SaveState :state="state" />
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!me || state.status === 'busy'"
      >
        {{ t('account.password.save') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'
import { useAuthStore } from '@/stores/auth'
import oblectoClient from '@/oblectoClient'

// Matches the server's minimum.
const MIN_LENGTH = 4

const { t } = useI18n()
const authStore = useAuthStore()
const me = computed(() => authStore.me)

const current = ref('')
const next = ref('')
const confirmation = ref('')
const problem = ref('')
const state = createSaveState()

void authStore.loadMe()

async function changePassword () {
  problem.value = ''

  if (next.value.length < MIN_LENGTH) {
    problem.value = t('account.password.tooShort', { min: MIN_LENGTH })
    return
  }

  if (next.value !== confirmation.value) {
    problem.value = t('account.password.mismatch')
    return
  }

  const ok = await state.run(
    async () => authStore.setMe(await oblectoClient.account.changePassword(me.value?.hasPassword ? current.value : undefined, next.value)),
    { busy: t('account.password.saving'), ok: t('account.password.saved'), error: t('account.password.saveFailed') }
  )

  if (ok) {
    current.value = ''
    next.value = ''
    confirmation.value = ''
  }
}
</script>
