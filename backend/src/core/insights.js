'use strict';

// Rule-based recommendations: each rule inspects an analyzed campaign and
// returns one suggestion { severity, title, message } or null.

const SEVERITY = { CRITICAL: 'critical', WARNING: 'warning', INFO: 'info' };

function asPct(rate) {
  return `${Math.round(rate * 1000) / 10}%`;
}

const rules = [
  function worstStepHeadline(analysis) {
    const worst = analysis.worstStep;
    if (!worst) return null;
    const severity =
      worst.dropOffRate >= 0.7 ? SEVERITY.CRITICAL : SEVERITY.WARNING;
    return {
      severity,
      title: `Biggest drop-off: Step ${worst.position} – ${worst.name}`,
      message:
        `${asPct(worst.dropOffRate)} of users who reach this step leave ` +
        `here (cumulative conversion falls from ${asPct(worst.fromCumulative)} ` +
        `to ${asPct(worst.toCumulative)}). This is the step to fix first.`,
    };
  },

  function emailFriction(analysis) {
    const worst = analysis.worstStep;
    if (!worst || worst.type !== 'email') return null;
    if (worst.dropOffRate < 0.6) return null;
    return {
      severity: SEVERITY.WARNING,
      title: 'Email step has high friction',
      message:
        'Visitors drop when asked for an email too early or for too much. ' +
        'Try reducing form fields, showing the incentive next to the field, ' +
        'or moving the email ask later in the flow.',
    };
  },

  function weakTeaser(analysis) {
    const first = analysis.steps[0];
    if (!first) return null;
    if (!['teaser', 'exit-intent'].includes(first.type)) return null;
    if (first.conversionRate >= 0.25) return null;
    return {
      severity: SEVERITY.WARNING,
      title: 'Few visitors engage with the opening step',
      message:
        `Only ${asPct(first.conversionRate)} of viewers click through the ` +
        `"${first.name}" step. Test a stronger offer or clearer copy, and ` +
        'review timing and placement so it reaches the right moment.',
    };
  },

  function strongFinish(analysis) {
    const last = analysis.steps[analysis.steps.length - 1];
    if (!last || analysis.steps.length < 2) return null;
    if (last.conversionRate < 0.9) return null;
    return {
      severity: SEVERITY.INFO,
      title: 'The final step performs well',
      message:
        `The last step converts at ${asPct(last.conversionRate)}, so users ` +
        'who get there almost always finish. Focus effort on the earlier ' +
        'drop-offs rather than the closing screen.',
    };
  },

  function lowOverall(analysis) {
    if (analysis.overallConversionRate >= 0.1) return null;
    return {
      severity: SEVERITY.INFO,
      title: 'Overall conversion is low',
      message:
        `Only ${asPct(analysis.overallConversionRate)} of visitors complete ` +
        'the whole flow. Fixing the biggest drop-off step above is the ' +
        'fastest way to lift this number.',
    };
  },
];

function generateInsights(analysis, limit = 3) {
  const order = { critical: 0, warning: 1, info: 2 };
  const insights = rules
    .map((rule) => rule(analysis))
    .filter(Boolean)
    .sort((a, b) => order[a.severity] - order[b.severity]);
  return insights.slice(0, limit);
}

module.exports = { generateInsights, SEVERITY };
