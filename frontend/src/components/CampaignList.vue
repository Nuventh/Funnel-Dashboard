<script setup>
import { formatPct } from '../lib/format.js';

defineProps({
  campaigns: { type: Array, required: true },
  selectedId: { type: String, default: null },
});

defineEmits(['select']);
</script>

<template>
  <aside class="list card">
    <h2 class="card-title">Campaigns</h2>
    <ul>
      <li
        v-for="c in campaigns"
        :key="c.id"
        :class="{ active: c.id === selectedId }"
        @click="$emit('select', c.id)"
      >
        <div class="row">
          <span class="name">{{ c.name }}</span>
          <span class="device">{{ c.device }}</span>
        </div>
        <div class="sub">
          <span class="conv">Conversion {{ formatPct(c.overallConversionRate) }}</span>
        </div>
      </li>
    </ul>
  </aside>
</template>
