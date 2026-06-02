// Relative '/api' URLs: Vite proxy in dev, nginx proxy in production.
const BASE = '/api';

async function getJson(path) {
  const response = await fetch(BASE + path);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export function fetchCampaigns() {
  return getJson('/campaigns');
}

export function fetchCampaign(id) {
  return getJson(`/campaigns/${id}`);
}
