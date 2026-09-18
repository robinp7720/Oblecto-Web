<template>
  <div class="GroupsSettings">
    <div
      v-for="group in groups"
      :key="group.id"
      class="settings-card"
    >
      <div class="settings-header-row">
        <h2 class="settings-title-plain group-title">
          <input
            v-if="!group.builtIn"
            :value="group.name"
            type="text"
            class="group-name"
            :aria-label="t('groups.rename')"
            @change="rename(group, $event.target.value)"
          >
          <template v-else>
            {{ group.name }}
            <span class="group-badge">{{ t('groups.builtIn') }}</span>
          </template>
        </h2>
        <span class="group-members">{{ t('groups.members', group.members) }}</span>
      </div>

      <fieldset class="group-permissions">
        <legend>{{ t('groups.permissions') }}</legend>
        <div
          v-for="permission in permissions"
          :key="permission.key"
          class="setting-row"
        >
          <label class="checkbox-container">
            {{ permissionName(permission) }}
            <input
              type="checkbox"
              :checked="group.permissions.includes(permission.key)"
              :disabled="locked(group, permission.key)"
              @change="toggle(group, permission.key, $event.target.checked)"
            >
            <span class="checkmark" />
          </label>
          <p class="checkbox-description">
            {{ permission.description }}
          </p>
        </div>
        <p
          v-if="!group.permissions.length"
          class="form-hint"
        >
          {{ t('groups.none') }}
        </p>
      </fieldset>

      <div
        v-if="!group.builtIn"
        class="settings-card-actions"
      >
        <span />
        <button
          type="button"
          class="btn btn-secondary"
          @click="remove(group)"
        >
          {{ t('groups.delete') }}
        </button>
      </div>
    </div>

    <form
      class="settings-card"
      @submit.prevent="create"
    >
      <div class="form-group">
        <label for="new-group-name">{{ t('groups.newName') }}</label>
        <input
          id="new-group-name"
          v-model="newName"
          type="text"
          required
        >
      </div>
      <div class="settings-card-actions">
        <SaveState :state="status" />
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!newName.trim() || status.status === 'busy'"
        >
          {{ t('groups.create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'
import { confirm } from '@/composables/useConfirm'
import { useAuthStore } from '@/stores/auth'
import oblectoClient from '@/oblectoClient'

const { t, te } = useI18n()
const authStore = useAuthStore()

const groups = ref([])
const permissions = ref([])
const newName = ref('')
// One status line for the page: every change reports here, including the
// server refusing to leave nobody able to manage users.
const status = createSaveState()

// Keys like settings.manage double as the message path under permissionNames.
const permissionName = permission => te(`groups.permissionNames.${permission.key}`) ? t(`groups.permissionNames.${permission.key}`) : permission.key

// The server keeps users.manage on the built-in Administrators group.
const locked = (group, key) => group.builtIn && key === 'users.manage' && group.permissions.includes(key)

async function refresh () {
  await status.run(async () => {
    const [loadedGroups, loadedPermissions] = await Promise.all([
      oblectoClient.groups.getGroups(),
      oblectoClient.groups.getPermissions()
    ])

    groups.value = loadedGroups
    permissions.value = loadedPermissions
  }, { busy: t('groups.loading'), ok: '', error: t('groups.loadFailed') })
}

function replace (updated) {
  groups.value = groups.value.map(group => group.id === updated.id ? updated : group)
}

async function change (group, changes) {
  // Shown at once; put back if the server refuses.
  replace({ ...group, ...changes })

  const ok = await status.run(
    async () => replace(await oblectoClient.groups.updateGroup(group.id, changes)),
    { busy: t('groups.saving'), ok: t('groups.saved', { name: changes.name || group.name }), error: t('groups.saveFailed', { name: group.name }) }
  )

  if (!ok) replace(group)

  // The signed-in user's own group may have gained or lost something.
  await authStore.loadMe(true)
}

function toggle (group, key, enabled) {
  const next = enabled ? [...group.permissions, key] : group.permissions.filter(permission => permission !== key)

  return change(group, { permissions: next })
}

function rename (group, name) {
  if (!name.trim() || name.trim() === group.name) return

  return change(group, { name: name.trim() })
}

async function create () {
  const name = newName.value.trim()

  const ok = await status.run(
    async () => { groups.value = [...groups.value, await oblectoClient.groups.createGroup(name, [])] },
    { busy: t('groups.saving'), ok: t('groups.created', { name }), error: t('groups.createFailed') }
  )

  if (ok) newName.value = ''
}

async function remove (group) {
  const confirmed = await confirm({
    title: t('groups.deleteTitle', { name: group.name }),
    message: t('groups.deleteMessage'),
    confirmLabel: t('groups.delete'),
    destructive: true
  })

  if (!confirmed) return

  const ok = await status.run(
    () => oblectoClient.groups.deleteGroup(group.id),
    { busy: t('groups.deleting'), ok: t('groups.deleted', { name: group.name }), error: t('groups.deleteFailed', { name: group.name }) }
  )

  // Its members moved, so the counts changed too.
  if (ok) await refresh()
}

refresh()
</script>

<style scoped lang="sass">
.group-title
  display: flex
  align-items: center
  gap: 10px

.group-name
  padding: 4px 8px
  border: 1px solid transparent
  border-radius: var(--radius-sm)
  background: transparent
  color: inherit
  font: inherit

  &:hover, &:focus
    border-color: var(--color-border)
    background: rgba(255, 255, 255, 0.07)
    outline: none

.group-badge
  padding: 2px 8px
  border-radius: 999px
  background: var(--color-surface-hover)
  color: var(--color-text-muted)
  font-size: 0.7rem
  font-weight: 600
  letter-spacing: 0.04em
  text-transform: uppercase

.group-members
  color: var(--color-text-muted)
  font-size: 0.9rem

.group-permissions
  margin: 12px 0 0
  padding: 0
  border: 0

  legend
    margin-bottom: 4px
    color: var(--color-text-muted)
    font-size: 0.85em
</style>
