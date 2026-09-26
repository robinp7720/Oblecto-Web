import { onBeforeUnmount, onMounted, toValue } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { confirm } from './useConfirm'

// For pages with an explicit Save: leaving with unsaved edits asks first, in
// the app (another page) and in the browser (reload, close the tab). The
// Options API settings pages get the same from settingsForm.
export function useLeaveGuard (dirty) {
  onBeforeRouteLeave(() => !toValue(dirty) || confirm({
    title: 'Leave with unsaved changes?',
    message: 'Some changes have not been saved. Leave this page and discard them?',
    confirmLabel: 'Leave page'
  }))

  function onUnload (event) {
    if (!toValue(dirty)) return
    event.preventDefault()
    event.returnValue = ''
  }

  onMounted(() => window.addEventListener('beforeunload', onUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onUnload))
}
