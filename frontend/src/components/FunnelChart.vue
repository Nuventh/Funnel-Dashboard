<script setup>
import { computed } from 'vue';
import { formatPct, formatInt } from '../lib/format.js';

const props = defineProps({
  campaign: { type: Object, required: true },
});

const W = 900;
const H = 360;
const cy = 180;
const padX = 0;
const maxHalf = 82;
const minHalf = 6;
const TOP_Y = 28;
const BOT_Y = H - 28;
const CHIP_H = 28;
const PCT_H = 30;

// Band height at each boundary is the cumulative conversion, so the shape
// narrows as visitors drop off.
const model = computed(() => {
  const steps = props.campaign.steps;
  const n = steps.length;

  const fractions = [1, ...steps.map((s) => s.cumulativeConversionAfter)];
  const xs = fractions.map((_, i) => padX + ((W - 2 * padX) * i) / n);
  const half = (f) => Math.max(f * maxHalf, minHalf);

  const smooth = (points) => {
    let d = '';
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const mx = ((x0 + x1) / 2).toFixed(1);
      d += ` C${mx},${y0.toFixed(1)} ${mx},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return d;
  };

  const layer = (k) => {
    const top = xs.map((x, i) => [x, cy - half(fractions[i]) * k]);
    const bottom = xs.map((x, i) => [x, cy + half(fractions[i]) * k]).reverse();
    let d = `M${top[0][0].toFixed(1)},${top[0][1].toFixed(1)}`;
    d += smooth(top);
    d += ` L${bottom[0][0].toFixed(1)},${bottom[0][1].toFixed(1)}`;
    d += smooth(bottom);
    return `${d} Z`;
  };

  const chipW = (text, charW = 8.5, pad = 24) =>
    Math.ceil(text.length * charW + pad);
  const clampX = (x, w) => Math.min(Math.max(x, w / 2 + 4), W - w / 2 - 4);

  const worstId = props.campaign.worstStep ? props.campaign.worstStep.id : null;

  // 0.6 places each marker past the segment center so the tail isn't empty.
  const markers = steps.map((s, i) => {
    const x = xs[i] + (xs[i + 1] - xs[i]) * 0.6;
    const count = formatInt(s.views);
    const pct = formatPct(fractions[i]);
    const countW = chipW(count);
    const pctW = chipW(pct, 9, 26);
    const nameW = chipW(s.name);
    return {
      worst: s.id === worstId,
      line: { x, y1: TOP_Y + CHIP_H / 2, y2: BOT_Y - CHIP_H / 2 },
      count: { text: count, w: countW, x: clampX(x, countW), y: TOP_Y },
      pct: { text: pct, w: pctW, x: clampX(x, pctW), y: cy },
      name: { text: s.name, w: nameW, x: clampX(x, nameW), y: BOT_Y },
    };
  });

  return { layers: [layer(1.6), layer(1.28), layer(1)], markers };
});
</script>

<template>
  <section class="card chart">
    <div class="chart-head">
      <h2 class="card-title">{{ campaign.name }}</h2>
      <span class="device-tag">{{ campaign.device }}</span>
    </div>

    <div class="big">
      {{ formatPct(campaign.overallConversionRate) }}
      <span class="big-sub">
        overall conversion · {{ formatInt(campaign.completed) }} of
        {{ formatInt(campaign.entered) }} visitors
      </span>
    </div>

    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="funnel"
      role="img"
      :aria-label="`Funnel chart for ${campaign.name}`"
    >
      <rect x="0" y="0" :width="W" :height="H" rx="18" class="chart-bg" />

      <path :d="model.layers[0]" class="layer-50" />
      <path :d="model.layers[1]" class="layer-100" />
      <path :d="model.layers[2]" class="layer-main" />

      <g v-for="(m, i) in model.markers" :key="`m-${i}`">
        <line
          :x1="m.line.x"
          :x2="m.line.x"
          :y1="m.line.y1"
          :y2="m.line.y2"
          class="connector"
        />

        <rect
          :x="m.count.x - m.count.w / 2"
          :y="m.count.y - CHIP_H / 2"
          :width="m.count.w"
          :height="CHIP_H"
          rx="12"
          class="chip"
        />
        <text :x="m.count.x" :y="m.count.y + 5" class="chip-text">
          {{ m.count.text }}
        </text>

        <rect
          :x="m.pct.x - m.pct.w / 2"
          :y="m.pct.y - PCT_H / 2"
          :width="m.pct.w"
          :height="PCT_H"
          rx="15"
          class="pill"
        />
        <text :x="m.pct.x" :y="m.pct.y + 5" class="pill-text">{{ m.pct.text }}</text>

        <rect
          :x="m.name.x - m.name.w / 2"
          :y="m.name.y - CHIP_H / 2"
          :width="m.name.w"
          :height="CHIP_H"
          rx="12"
          class="chip"
          :class="{ worst: m.worst }"
        />
        <text
          :x="m.name.x"
          :y="m.name.y + 5"
          class="chip-text"
          :class="{ worst: m.worst }"
        >
          {{ m.worst ? '▼ ' : '' }}{{ m.name.text }}
        </text>
      </g>
    </svg>
  </section>
</template>
