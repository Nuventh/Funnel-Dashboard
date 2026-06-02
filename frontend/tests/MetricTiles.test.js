import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MetricTiles from '../src/components/MetricTiles.vue';

const metrics = [
  { key: 'visitors', label: 'Visitors', value: 10000, format: 'int' },
  {
    key: 'worstDropOff',
    label: 'Biggest drop-off',
    value: 0.7344,
    format: 'percent',
    sub: 'Email capture',
  },
];

describe('MetricTiles', () => {
  const wrapper = mount(MetricTiles, { props: { metrics } });

  it('renders integer metrics with separators', () => {
    expect(wrapper.text()).toContain('Visitors');
    expect(wrapper.text()).toContain('10,000');
  });

  it('formats percent metrics and shows the sub-label', () => {
    expect(wrapper.text()).toContain('73.4%');
    expect(wrapper.text()).toContain('Email capture');
  });

  it('renders one tile per metric', () => {
    expect(wrapper.findAll('.tile')).toHaveLength(2);
  });
});
