<template>
  <section class="statistics-chart">
    <div class="chart-heading">
      <h2>{{ title }}</h2><span>{{ unit }} · UTC</span>
    </div>
    <p
      v-if="!points.length"
      class="muted"
    >
      No measurements in this period.
    </p>
    <template v-else>
      <svg
        viewBox="0 0 800 220"
        role="img"
        :aria-label="`${title}. ${points.length} measurements; values available in the table below.`"
      >
        <g
          v-for="tick in ticks"
          :key="tick.y"
          class="chart-grid"
        >
          <line
            x1="60"
            x2="780"
            :y1="tick.y"
            :y2="tick.y"
          />
          <text
            x="48"
            :y="tick.y + 4"
            text-anchor="end"
          >{{ format(tick.value) }}</text>
        </g>
        <path
          :d="path"
          fill="none"
          stroke="var(--color-brand-turquoise, #4bcebd)"
          stroke-width="3"
        />
        <circle
          v-for="(point, index) in plotted"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="3"
          fill="var(--color-brand-turquoise)"
        >
          <title>{{ points[index].label }}: {{ format(points[index].value) }} {{ unit }}</title>
        </circle>
      </svg>
      <p class="chart-range">
        <span>{{ points[0].label }}</span><span>Peak {{ format(maximum) }} {{ unit }}</span><span>{{ points.at(-1).label }}</span>
      </p>
      <details>
        <summary>View data table</summary>
        <div class="table-scroll">
          <table>
            <caption>{{ title }} ({{ unit }})</caption>
            <thead>
              <tr>
                <th scope="col">
                  Time (UTC)
                </th><th scope="col">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="point in points"
                :key="point.label"
              >
                <th scope="row">
                  {{ point.label }}
                </th><td>{{ format(point.value) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ title: { type: String, required: true }, points: { type: Array, default: () => [] }, unit: { type: String, default: '' }, interval: { type: Number, default: 86400000 } })
const maximum = computed(() => Math.max(0, ...props.points.map(point => Number(point.value))))
const ticks = computed(() => [0, 0.5, 1].map(fraction => ({ y: 184 - 164 * fraction, value: (maximum.value || 1) * fraction })))
const plotted = computed(() => {
  const start = props.points[0]?.time || 0
  const span = (props.points.at(-1)?.time || start) - start || 1
  return props.points.map(point => ({ x: props.points.length === 1 ? 420 : 60 + 720 * (point.time - start) / span, y: 184 - 164 * Number(point.value) / (maximum.value || 1) }))
})
const path = computed(() => plotted.value.map((point, index) => `${index === 0 || props.points[index].time - props.points[index - 1].time > props.interval * 1.5 ? 'M' : 'L'}${point.x},${point.y}`).join(' '))
const format = value => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
</script>

<style scoped lang="sass">
.statistics-chart
  min-width: 0
  padding: 24px
  border: 1px solid var(--color-border)
  border-radius: 16px
  background: var(--color-surface)
  box-sizing: border-box
  & + .statistics-chart
    margin-top: 20px
  h2
    font-family: var(--font-display)
    font-size: 1.15rem
    margin: 0
  svg
    display: block
    width: 100%
    max-height: 280px
    margin-top: 16px
.chart-heading
  display: flex
  align-items: baseline
  justify-content: space-between
  flex-wrap: wrap
  gap: 8px
  span
    color: var(--color-text-faint)
    font-size: .75rem
.chart-grid
  line
    stroke: var(--color-border)
    stroke-dasharray: 4 5
  text
    fill: var(--color-text-muted)
    font-size: 12px
.chart-range
  display: flex
  justify-content: space-between
  flex-wrap: wrap
  gap: 12px
  font-size: .8rem
  color: var(--color-text-faint)
.table-scroll
  max-height: 320px
  overflow: auto
  table
    width: 100%
    text-align: left
    th, td
      padding: 8px
summary
  cursor: pointer
  color: var(--color-text-muted)
  font-size: .8rem
  padding: 14px 0 0
  border-top: 1px solid var(--color-border)
  &:focus-visible
    outline: 2px solid var(--color-brand-turquoise)
    outline-offset: 4px
@media (max-width: 600px)
  .statistics-chart
    padding: 16px
  .chart-range
    font-size: .7rem
</style>
