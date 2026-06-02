<script setup>
defineProps({
  insights: { type: Array, default: () => [] },
});
</script>

<template>
  <section class="card insights">
    <h2 class="card-title">Insights</h2>
    <div
      v-for="(item, i) in insights"
      :key="i"
      class="insight"
      :class="item.severity"
    >
      <div class="ins-title">{{ item.title }}</div>
      <div class="ins-msg">{{ item.message }}</div>
    </div>
  </section>
</template>
