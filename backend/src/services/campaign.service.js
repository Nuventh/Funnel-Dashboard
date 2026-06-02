'use strict';

// Only place that touches the data source: swapping the static JSON for a
// database later would only change this file.
const fs = require('node:fs');
const settings = require('../config/settings');
const funnel = require('../core/funnel');
const { generateInsights } = require('../core/insights');

let cache = null;

function loadRaw() {
  if (cache) return cache;
  const contents = fs.readFileSync(settings.dataFile, 'utf8');
  const parsed = JSON.parse(contents);
  cache = Array.isArray(parsed.campaigns) ? parsed.campaigns : [];
  return cache;
}

function resetCache() {
  cache = null;
}

function listCampaigns() {
  return loadRaw().map((c) => funnel.summarizeCampaign(c));
}

function getCampaignAnalysis(id) {
  const raw = loadRaw().find((c) => c.id === id);
  if (!raw) return null;
  const analysis = funnel.analyzeCampaign(raw);
  return { ...analysis, insights: generateInsights(analysis) };
}

module.exports = {
  listCampaigns,
  getCampaignAnalysis,
  resetCache,
};
