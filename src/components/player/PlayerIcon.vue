<template>
  <svg
    class="player-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'play'">
      <path
        d="M8 5.5 18.5 12 8 18.5z"
        fill="currentColor"
        stroke-width="1.6"
      />
    </template>
    <template v-else-if="name === 'pause'">
      <path
        d="M9 5v14M15 5v14"
        stroke-width="2.4"
      />
    </template>
    <template v-else-if="name === 'stop'">
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="1.5"
        fill="currentColor"
        stroke="none"
      />
    </template>
    <template v-else-if="name === 'replay-10'">
      <path d="M12 5a7 7 0 1 1-6.7 9" />
      <path
        d="M12 2.5 8.6 5 12 7.5z"
        fill="currentColor"
        stroke="none"
      />
      <text
        class="skip-text"
        x="12"
        y="15.6"
      >10</text>
    </template>
    <template v-else-if="name === 'forward-10'">
      <path d="M12 5a7 7 0 1 0 6.7 9" />
      <path
        d="M12 2.5 15.4 5 12 7.5z"
        fill="currentColor"
        stroke="none"
      />
      <text
        class="skip-text"
        x="12"
        y="15.6"
      >10</text>
    </template>
    <template v-else-if="name === 'volume-high'">
      <path d="M4 9.5h3L11 6v12l-4-3.5H4z" />
      <path d="M15.2 9a4 4 0 0 1 0 6M17.8 6.6a7.5 7.5 0 0 1 0 10.8" />
    </template>
    <template v-else-if="name === 'volume-low'">
      <path d="M4 9.5h3L11 6v12l-4-3.5H4z" />
      <path d="M15.2 9a4 4 0 0 1 0 6" />
    </template>
    <template v-else-if="name === 'volume-mute'">
      <path d="M4 9.5h3L11 6v12l-4-3.5H4z" />
      <path d="m15.5 9.5 5 5M20.5 9.5l-5 5" />
    </template>
    <template v-else-if="name === 'captions'">
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2.5"
      />
      <path d="M10 10.2a2.6 2.6 0 1 0 0 3.6M17.5 10.2a2.6 2.6 0 1 0 0 3.6" />
    </template>
    <template v-else-if="name === 'settings'">
      <circle
        cx="12"
        cy="12"
        r="2.9"
      />
      <path d="M19.1 14.2a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.2a1.8 1.8 0 1 1-3.6 0v-.1a1.5 1.5 0 0 0-2.7-1.1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.2a1.8 1.8 0 1 1 0-3.6h.1a1.5 1.5 0 0 0 1.1-2.7l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.2a1.8 1.8 0 1 1 3.6 0v.1a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0-.3 1.7v.1a1.5 1.5 0 0 0 1.4.9h.2a1.8 1.8 0 1 1 0 3.6h-.1a1.5 1.5 0 0 0-1.4.9z" />
    </template>
    <template v-else-if="name === 'expand'">
      <path d="M8.5 3.5h-5v5M15.5 3.5h5v5M15.5 20.5h5v-5M8.5 20.5h-5v-5" />
    </template>
    <template v-else-if="name === 'compress'">
      <path d="M3.5 8.5h5v-5M20.5 8.5h-5v-5M20.5 15.5h-5v5M3.5 15.5h5v5" />
    </template>
    <template v-else-if="name === 'pip'">
      <rect
        x="2.5"
        y="4.5"
        width="19"
        height="15"
        rx="2.5"
      />
      <rect
        x="12"
        y="11"
        width="7.5"
        height="6.5"
        rx="1.2"
        fill="currentColor"
        stroke="none"
      />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9.5 6 6 6-6" />
    </template>
    <template v-else-if="name === 'chevron-up'">
      <path d="m6 14.5 6-6 6 6" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'next'">
      <path
        d="M6 5.5 15 12 6 18.5z"
        fill="currentColor"
        stroke-width="1.6"
      />
      <path d="M18 5v14" />
    </template>
    <template v-else-if="name === 'speed'">
      <path d="M12 20a8 8 0 1 1 8-8" />
      <path d="M12 12 16.5 8.5" />
      <circle
        cx="12"
        cy="12"
        r="1.2"
        fill="currentColor"
        stroke="none"
      />
    </template>
    <template v-else-if="name === 'alert'">
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4M12 17h.01" />
    </template>
    <template v-else-if="name === 'spinner'">
      <circle
        cx="12"
        cy="12"
        r="9"
        opacity="0.22"
      />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  }
})
</script>

<style scoped lang="sass">
.player-icon
  display: block
  width: 1em
  height: 1em
  flex: none

.skip-text
  font-family: var(--font-body)
  font-size: 7.5px
  font-weight: 700
  text-anchor: middle
  fill: currentColor
  stroke: none
</style>
