'use strict';

const funnel = require('../src/core/funnel');
const { generateInsights } = require('../src/core/insights');

const camp001 = {
  id: 'camp_001',
  name: 'Welcome Discount Popup',
  steps: [
    { id: 'step_1', name: 'Teaser', type: 'teaser', views: 10000, proceeds: 3200 },
    { id: 'step_2', name: 'Email capture', type: 'email', views: 3200, proceeds: 850 },
    { id: 'step_3', name: 'Success', type: 'success', views: 850, proceeds: 820 },
  ],
};

describe('generateInsights()', () => {
  const analysis = funnel.analyzeCampaign(camp001);
  const insights = generateInsights(analysis);

  test('returns at most 3 insights', () => {
    expect(insights.length).toBeLessThanOrEqual(3);
    expect(insights.length).toBeGreaterThan(0);
  });

  test('headline calls out the email step as biggest drop-off', () => {
    expect(insights[0].title).toMatch(/Email capture/);
    expect(insights[0].title).toMatch(/Step 2/);
  });

  test('every insight has severity, title and message', () => {
    for (const i of insights) {
      expect(['critical', 'warning', 'info']).toContain(i.severity);
      expect(typeof i.title).toBe('string');
      expect(typeof i.message).toBe('string');
    }
  });

  test('critical insights are ordered before info', () => {
    const order = { critical: 0, warning: 1, info: 2 };
    for (let i = 1; i < insights.length; i++) {
      expect(order[insights[i].severity]).toBeGreaterThanOrEqual(
        order[insights[i - 1].severity]
      );
    }
  });
});
