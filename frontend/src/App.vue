<script setup>
import { ref, onMounted } from 'vue';
import { fetchCampaigns, fetchCampaign } from './services/api.js';
import CampaignList from './components/CampaignList.vue';
import MetricTiles from './components/MetricTiles.vue';
import FunnelChart from './components/FunnelChart.vue';
import InsightList from './components/InsightList.vue';

const campaigns = ref([]);
const selected = ref(null);
const loading = ref(true);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    campaigns.value = await fetchCampaigns();
    if (campaigns.value.length > 0) {
      await select(campaigns.value[0].id);
    }
  } catch (e) {
    error.value =
      'Could not load campaigns. Make sure the backend is running on port 3000.';
  } finally {
    loading.value = false;
  }
}

async function select(id) {
  selected.value = await fetchCampaign(id);
}

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="title"><span class="dot"></span> Funnel Dashboard</div>
      <button class="btn" @click="load">Refresh data</button>
    </header>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="muted">Loading…</p>

    <div v-else class="layout">
      <CampaignList
        :campaigns="campaigns"
        :selected-id="selected?.id"
        @select="select"
      />
      <main class="main">
        <MetricTiles v-if="selected" :metrics="selected.metrics" />
        <FunnelChart v-if="selected" :campaign="selected" />
        <InsightList v-if="selected" :insights="selected.insights" />
      </main>
    </div>
  </div>
</template>
