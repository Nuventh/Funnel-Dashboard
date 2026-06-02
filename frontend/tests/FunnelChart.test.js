import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FunnelChart from '../src/components/FunnelChart.vue';

// A camp_001-shaped campaign as the backend would return it.
const campaign = {
  id: 'camp_001',
  name: 'Welcome Discount Popup',
  device: 'desktop',
  entered: 10000,
  completed: 820,
  overallConversionRate: 0.082,
  worstStep: { id: 'step_2', name: 'Email capture' },
  steps: [
    { id: 'step_1', name: 'Teaser', views: 10000, proceeds: 3200, cumulativeConversionAfter: 0.32, dropOffRate: 0.68 },
    { id: 'step_2', name: 'Email capture', views: 3200, proceeds: 850, cumulativeConversionAfter: 0.085, dropOffRate: 0.7344 },
    { id: 'step_3', name: 'Success', views: 850, proceeds: 820, cumulativeConversionAfter: 0.082, dropOffRate: 0.035 },
  ],
};

describe('FunnelChart', () => {
  const wrapper = mount(FunnelChart, { props: { campaign } });
  const text = wrapper.text();

  it('shows cumulative conversion entering each step', () => {
    expect(text).toContain('100%');
    expect(text).toContain('32%');
    expect(text).toContain('8.5%');
  });

  it('shows the visitor count for each step', () => {
    expect(text).toContain('10,000');
    expect(text).toContain('3,200');
    expect(text).toContain('850');
  });

  it('highlights exactly the worst step', () => {
    const worst = wrapper.findAll('.chip-text.worst');
    expect(worst).toHaveLength(1);
    expect(worst[0].text()).toContain('Email capture');
  });

  it('renders the overall conversion headline', () => {
    expect(text).toContain('8.2%');
  });
});
