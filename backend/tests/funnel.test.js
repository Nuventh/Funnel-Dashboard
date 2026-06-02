'use strict';

const funnel = require('../src/core/funnel');

// camp_001 from the dataset — used as the canonical worked example.
const camp001 = {
  id: 'camp_001',
  name: 'Welcome Discount Popup',
  device: 'desktop',
  steps: [
    { id: 'step_1', name: 'Teaser', type: 'teaser', views: 10000, proceeds: 3200 },
    { id: 'step_2', name: 'Email capture', type: 'email', views: 3200, proceeds: 850 },
    { id: 'step_3', name: 'Success', type: 'success', views: 850, proceeds: 820 },
  ],
};

describe('ratio()', () => {
  test('divides normally', () => {
    expect(funnel.ratio(3200, 10000)).toBeCloseTo(0.32, 5);
  });
  test('returns 0 instead of dividing by zero', () => {
    expect(funnel.ratio(5, 0)).toBe(0);
    expect(funnel.ratio(5, undefined)).toBe(0);
  });
});

describe('analyzeStep()', () => {
  const step = funnel.analyzeStep(camp001.steps[1], 1, 10000);

  test('computes step conversion rate', () => {
    expect(step.conversionRate).toBeCloseTo(0.2656, 4); // 850 / 3200
  });
  test('computes absolute drop-off', () => {
    expect(step.dropOff).toBe(2350); // 3200 - 850
  });
  test('computes drop-off rate', () => {
    expect(step.dropOffRate).toBeCloseTo(0.7344, 4);
  });
  test('computes cumulative conversion relative to top of funnel', () => {
    expect(step.cumulativeConversionBefore).toBeCloseTo(0.32, 4); // 3200 / 10000
    expect(step.cumulativeConversionAfter).toBeCloseTo(0.085, 4); // 850 / 10000
  });
  test('uses 1-based position', () => {
    expect(step.position).toBe(2);
  });
});

describe('analyzeCampaign()', () => {
  const analysis = funnel.analyzeCampaign(camp001);

  test('overall conversion is completed / entered', () => {
    expect(analysis.entered).toBe(10000);
    expect(analysis.completed).toBe(820);
    expect(analysis.overallConversionRate).toBeCloseTo(0.082, 4);
  });

  test('worst step is the email step (highest drop-off rate)', () => {
    expect(analysis.worstStep.id).toBe('step_2');
    expect(analysis.worstStep.type).toBe('email');
    expect(analysis.worstStep.position).toBe(2);
  });

  test('returns one analyzed entry per step', () => {
    expect(analysis.steps).toHaveLength(3);
  });

  test('builds KPI metric tiles from real funnel numbers', () => {
    const byKey = Object.fromEntries(analysis.metrics.map((m) => [m.key, m]));
    expect(byKey.visitors.value).toBe(10000);
    expect(byKey.conversions.value).toBe(820);
    expect(byKey.lost.value).toBe(9180); // 10000 - 820
    expect(byKey.worstDropOff.format).toBe('percent');
    expect(byKey.worstDropOff.sub).toBe('Email capture');
  });
});

describe('edge cases', () => {
  test('handles a campaign with no steps', () => {
    const a = funnel.analyzeCampaign({ id: 'x', name: 'empty', steps: [] });
    expect(a.entered).toBe(0);
    expect(a.completed).toBe(0);
    expect(a.overallConversionRate).toBe(0);
    expect(a.worstStep).toBeNull();
  });

  test('handles zero views without NaN', () => {
    const a = funnel.analyzeCampaign({
      id: 'z',
      name: 'zero',
      steps: [{ id: 's1', name: 's1', type: 'teaser', views: 0, proceeds: 0 }],
    });
    expect(a.steps[0].conversionRate).toBe(0);
    expect(a.steps[0].dropOffRate).toBe(0);
  });

  test('single-step campaign', () => {
    const a = funnel.analyzeCampaign({
      id: 'one',
      name: 'one',
      steps: [{ id: 's1', name: 's1', type: 'teaser', views: 100, proceeds: 40 }],
    });
    expect(a.overallConversionRate).toBeCloseTo(0.4, 4);
    expect(a.worstStep.id).toBe('s1');
  });
});

describe('summarizeCampaign()', () => {
  test('returns compact summary without per-step detail', () => {
    const s = funnel.summarizeCampaign(camp001);
    expect(s.overallConversionRate).toBeCloseTo(0.082, 4);
    expect(s.worstStep.position).toBe(2);
    expect(s.steps).toBeUndefined();
  });
});
