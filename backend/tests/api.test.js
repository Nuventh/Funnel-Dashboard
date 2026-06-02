'use strict';

const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

describe('GET /health', () => {
  test('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/campaigns', () => {
  test('returns a list of campaign summaries', async () => {
    const res = await request(app).get('/api/campaigns');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    const first = res.body.find((c) => c.id === 'camp_001');
    expect(first.overallConversionRate).toBeCloseTo(0.082, 4);
    expect(first.worstStep.position).toBe(2);
    expect(first.steps).toBeUndefined(); // summary only
  });
});

describe('GET /api/campaigns/:id', () => {
  test('returns full analysis with steps and insights', async () => {
    const res = await request(app).get('/api/campaigns/camp_001');
    expect(res.status).toBe(200);
    expect(res.body.steps).toHaveLength(3);
    expect(res.body.worstStep.id).toBe('step_2');
    expect(Array.isArray(res.body.insights)).toBe(true);
    expect(res.body.insights.length).toBeGreaterThan(0);
  });

  test('returns 404 for unknown campaign', async () => {
    const res = await request(app).get('/api/campaigns/camp_999');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe('GET /api-docs.json', () => {
  test('serves the OpenAPI spec', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/api/campaigns']).toBeDefined();
  });
});
