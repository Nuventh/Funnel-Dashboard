'use strict';

function round(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function ratio(numerator, denominator) {
  if (!denominator || denominator <= 0) return 0;
  return numerator / denominator;
}

function analyzeStep(step, index, topOfFunnel) {
  const views = Number(step.views) || 0;
  const proceeds = Number(step.proceeds) || 0;

  const conversionRate = ratio(proceeds, views);
  const dropOff = Math.max(views - proceeds, 0);
  const dropOffRate = ratio(dropOff, views);

  const cumulativeBefore = ratio(views, topOfFunnel);
  const cumulativeAfter = ratio(proceeds, topOfFunnel);

  return {
    id: step.id,
    name: step.name,
    type: step.type,
    description: step.description || '',
    position: index + 1,
    views,
    proceeds,
    conversionRate: round(conversionRate),
    dropOff,
    dropOffRate: round(dropOffRate),
    cumulativeConversionBefore: round(cumulativeBefore),
    cumulativeConversionAfter: round(cumulativeAfter),
  };
}

// Worst step = highest drop-off rate, not absolute count: the top of a funnel
// always loses the most people in raw numbers, so the proportion is the signal.
function findWorstStep(analyzedSteps) {
  if (analyzedSteps.length === 0) return null;

  let worst = analyzedSteps[0];
  for (const step of analyzedSteps) {
    if (step.dropOffRate > worst.dropOffRate) worst = step;
  }

  return {
    id: worst.id,
    name: worst.name,
    type: worst.type,
    position: worst.position,
    dropOffRate: worst.dropOffRate,
    dropOff: worst.dropOff,
    conversionRate: worst.conversionRate,
    fromCumulative: worst.cumulativeConversionBefore,
    toCumulative: worst.cumulativeConversionAfter,
  };
}

function buildMetrics(entered, completed, worstStep) {
  return [
    { key: 'visitors', label: 'Visitors', value: entered, format: 'int' },
    { key: 'conversions', label: 'Conversions', value: completed, format: 'int' },
    {
      key: 'lost',
      label: 'Lost visitors',
      value: Math.max(entered - completed, 0),
      format: 'int',
    },
    {
      key: 'worstDropOff',
      label: 'Biggest drop-off',
      value: worstStep ? worstStep.dropOffRate : 0,
      format: 'percent',
      sub: worstStep ? worstStep.name : null,
    },
  ];
}

function analyzeCampaign(campaign) {
  const rawSteps = Array.isArray(campaign.steps) ? campaign.steps : [];
  const topOfFunnel = rawSteps.length ? Number(rawSteps[0].views) || 0 : 0;

  const steps = rawSteps.map((step, index) =>
    analyzeStep(step, index, topOfFunnel)
  );

  const entered = topOfFunnel;
  const completed = rawSteps.length
    ? Number(rawSteps[rawSteps.length - 1].proceeds) || 0
    : 0;
  const worstStep = findWorstStep(steps);

  return {
    id: campaign.id,
    name: campaign.name,
    device: campaign.device || null,
    stepCount: steps.length,
    entered,
    completed,
    overallConversionRate: round(ratio(completed, entered)),
    worstStep,
    metrics: buildMetrics(entered, completed, worstStep),
    steps,
  };
}

function summarizeCampaign(campaign) {
  const full = analyzeCampaign(campaign);
  return {
    id: full.id,
    name: full.name,
    device: full.device,
    stepCount: full.stepCount,
    entered: full.entered,
    completed: full.completed,
    overallConversionRate: full.overallConversionRate,
    worstStep: full.worstStep
      ? {
          name: full.worstStep.name,
          position: full.worstStep.position,
          dropOffRate: full.worstStep.dropOffRate,
        }
      : null,
  };
}

module.exports = {
  round,
  ratio,
  analyzeStep,
  findWorstStep,
  analyzeCampaign,
  summarizeCampaign,
};
