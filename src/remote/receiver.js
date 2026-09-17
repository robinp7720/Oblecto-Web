import { setDeviceName } from './device.js'

// Executes commands arriving from another of the user's devices.
//
// This lives outside the player on purpose: `play` and `stop` have to work
// when nothing is playing yet and the player component has registered nothing,
// which is the single most common remote-play case.

let store = null
let handlers = {}

export function bindStore (next) {
  store = next
}

/**
 * Registers the controls the local player exposes. PlayerRoot calls this on
 * mount and clears it on unmount; anything not registered is reported back as
 * unsupported rather than silently ignored.
 *
 * @param {object} next - Map of command type to handler.
 */
export function registerHandlers (next) {
  handlers = next || {}
}

export function clearHandlers () {
  handlers = {}
}

const ok = () => ({ ok: true })
const fail = (code, error) => ({ ok: false, code, error })

async function run (command) {
  switch (command.type) {
    case 'play': {
      if (!store) return fail('failed', 'The player is not ready')

      const action = command.media.kind === 'movie' ? 'playMovieLocal' : 'playEpisodeLocal'

      await store.dispatch(action, command.media.id)

      return ok()
    }

    case 'rename':
      setDeviceName(command.name)

      return ok()

    default: {
      const handler = handlers[command.type]

      if (!handler) return fail('unsupported', 'Nothing is playing on that device')

      await handler(command)

      return ok()
    }
  }
}

/**
 * Handles one delivered command and produces the acknowledgement the
 * controlling device sees.
 *
 * @param {object} payload - The `remote:command` payload.
 * @returns {Promise<object>} A CommandAck.
 */
export async function handleCommand (payload) {
  const command = payload?.command

  if (!command || typeof command.type !== 'string') return fail('invalid', 'Malformed command')

  try {
    return await run(command)
  } catch (e) {
    return fail('failed', e?.message || 'The command failed')
  }
}
