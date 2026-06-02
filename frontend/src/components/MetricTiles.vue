<script setup>
import { formatPct, formatInt } from '../lib/format.js';

defineProps({
  metrics: { type: Array, default: () => [] },
});

function display(metric) {
  return metric.format === 'percent'
    ? formatPct(metric.value)
    : formatInt(metric.value);
}
</script>

<template>
  <div class="tiles">
    <div v-for="m in metrics" :key="m.key" class="tile card">
      <div class="tile-label">{{ m.label }}</div>
      <div class="tile-value">{{ display(m) }}</div>
      <div v-if="m.sub" class="tile-sub">{{ m.sub }}</div>
    </div>
  </div>
</template>
