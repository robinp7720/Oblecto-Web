<template>
  <AppDialog
    :open="open"
    :title="`Add ${typeLabel} library`"
    subtitle="Point Oblecto at a folder on the server. It is scanned on the next index run."
    size="md"
    @update:open="$emit('update:open', $event)"
    @submit="addLibrary"
  >
    <div
      class="form-group"
      :class="{ 'is-invalid': Boolean(pathError) }"
    >
      <label for="library-path">Path</label>
      <input
        id="library-path"
        ref="pathInput"
        v-model.trim="path"
        type="text"
        placeholder="/media/movies"
        :aria-describedby="pathError ? 'library-path-error' : undefined"
      >
      <p
        v-if="pathError"
        id="library-path-error"
        class="form-hint form-error"
      >
        {{ pathError }}
      </p>
    </div>

    <template #status>
      <SaveState :state="save" />
    </template>

    <template #footer>
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('update:open', false)"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="save.status === 'busy'"
      >
        Add library
      </button>
    </template>
  </AppDialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useLibrariesStore } from '@/stores/libraries'
import AppDialog from '@/components/system/AppDialog.vue'
import SaveState from '@/components/system/SaveState.vue'
import { createSaveState } from '@/composables/useSaveState'
import oblectoClient from '@/oblectoClient'

const props = defineProps({
  open: { type: Boolean, default: false },
  libraryType: { type: String, default: 'movies' }
})

const emit = defineEmits(['update:open', 'added'])

const store = useLibrariesStore()
const save = createSaveState()
const path = ref('')
const pathError = ref('')
const pathInput = ref(null)

const typeLabel = computed(() => (props.libraryType === 'movies' ? 'movie' : 'TV show'))

watch(() => props.open, async open => {
  if (!open) return

  path.value = ''
  pathError.value = ''
  save.reset()

  await nextTick()
  pathInput.value?.focus()
})

async function addLibrary () {
  if (!path.value) {
    pathError.value = 'A library path is required.'
    return
  }

  pathError.value = ''

  const ok = await save.run(
    () => oblectoClient.libraries.addPath(props.libraryType, path.value),
    { busy: 'Adding…', ok: 'Added', error: 'Could not add this path' }
  )

  if (!ok) return

  await store.updateAll()
  emit('added', path.value)
  emit('update:open', false)
}
</script>
