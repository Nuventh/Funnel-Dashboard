'use strict';

// OpenAPI 3.0 spec, served as Swagger UI at /api-docs.
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Funnel Dashboard API',
    version: '1.0.0',
    description:
      'Backend for step-level popup funnel analytics. All conversion and ' +
      'drop-off math is computed here so the frontend only visualizes the ' +
      'returned numbers.',
  },
  servers: [{ url: '/', description: 'Current host' }],
  tags: [
    { name: 'Campaigns', description: 'Funnel data for popup campaigns' },
    { name: 'System', description: 'Health and diagnostics' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is up',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
                example: { status: 'ok', uptime: 12.34 },
              },
            },
          },
        },
      },
    },
    '/api/campaigns': {
      get: {
        tags: ['Campaigns'],
        summary: 'List campaigns with summary metrics',
        description:
          'Returns every campaign with its overall conversion rate and a ' +
          'pointer to its worst step. Used by the campaign list view.',
        responses: {
          200: {
            description: 'Array of campaign summaries',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CampaignSummary' },
                },
              },
            },
          },
        },
      },
    },
    '/api/campaigns/{id}': {
      get: {
        tags: ['Campaigns'],
        summary: 'Full funnel analysis for one campaign',
        description:
          'Returns per-step conversion and drop-off, the worst step, and ' +
          'plain-language insights. Everything is pre-computed for rendering.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Campaign id, e.g. camp_001',
            schema: { type: 'string' },
            example: 'camp_001',
          },
        ],
        responses: {
          200: {
            description: 'Full campaign analysis',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CampaignAnalysis' },
              },
            },
          },
          404: {
            description: 'Campaign not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Campaign not found', id: 'camp_999' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          uptime: { type: 'number', example: 12.34 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          id: { type: 'string' },
        },
      },
      WorstStepRef: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Email capture' },
          position: { type: 'integer', example: 2 },
          dropOffRate: {
            type: 'number',
            description: 'Fraction (0..1) of users lost at this step',
            example: 0.7344,
          },
        },
      },
      CampaignSummary: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'camp_001' },
          name: { type: 'string', example: 'Welcome Discount Popup' },
          device: { type: 'string', nullable: true, example: 'desktop' },
          stepCount: { type: 'integer', example: 3 },
          entered: { type: 'integer', example: 10000 },
          completed: { type: 'integer', example: 820 },
          overallConversionRate: {
            type: 'number',
            description: 'completed / entered, as a fraction (0..1)',
            example: 0.082,
          },
          worstStep: { $ref: '#/components/schemas/WorstStepRef' },
        },
      },
      Step: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'step_2' },
          name: { type: 'string', example: 'Email capture' },
          type: { type: 'string', example: 'email' },
          description: { type: 'string' },
          position: { type: 'integer', example: 2 },
          views: { type: 'integer', example: 3200 },
          proceeds: { type: 'integer', example: 850 },
          conversionRate: {
            type: 'number',
            description: 'proceeds / views (0..1)',
            example: 0.2656,
          },
          dropOff: {
            type: 'integer',
            description: 'Absolute users lost at this step',
            example: 2350,
          },
          dropOffRate: {
            type: 'number',
            description: '1 - conversionRate (0..1)',
            example: 0.7344,
          },
          cumulativeConversionBefore: {
            type: 'number',
            description: 'Share of original visitors still in funnel entering this step',
            example: 0.32,
          },
          cumulativeConversionAfter: {
            type: 'number',
            description: 'Share of original visitors still in funnel after this step',
            example: 0.085,
          },
        },
      },
      Metric: {
        type: 'object',
        properties: {
          key: { type: 'string', example: 'visitors' },
          label: { type: 'string', example: 'Visitors' },
          value: { type: 'number', example: 10000 },
          format: { type: 'string', enum: ['int', 'percent'], example: 'int' },
          sub: { type: 'string', nullable: true, example: 'Email capture' },
        },
      },
      Insight: {
        type: 'object',
        properties: {
          severity: {
            type: 'string',
            enum: ['critical', 'warning', 'info'],
            example: 'critical',
          },
          title: { type: 'string', example: 'Biggest drop-off: Step 2 – Email capture' },
          message: { type: 'string' },
        },
      },
      CampaignAnalysis: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'camp_001' },
          name: { type: 'string', example: 'Welcome Discount Popup' },
          device: { type: 'string', nullable: true, example: 'desktop' },
          stepCount: { type: 'integer', example: 3 },
          entered: { type: 'integer', example: 10000 },
          completed: { type: 'integer', example: 820 },
          overallConversionRate: { type: 'number', example: 0.082 },
          worstStep: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'step_2' },
              name: { type: 'string', example: 'Email capture' },
              type: { type: 'string', example: 'email' },
              position: { type: 'integer', example: 2 },
              dropOffRate: { type: 'number', example: 0.7344 },
              dropOff: { type: 'integer', example: 2350 },
              conversionRate: { type: 'number', example: 0.2656 },
              fromCumulative: { type: 'number', example: 0.32 },
              toCumulative: { type: 'number', example: 0.085 },
            },
          },
          metrics: {
            type: 'array',
            description: 'KPI tiles for the dashboard, pre-computed for display.',
            items: { $ref: '#/components/schemas/Metric' },
          },
          steps: {
            type: 'array',
            items: { $ref: '#/components/schemas/Step' },
          },
          insights: {
            type: 'array',
            items: { $ref: '#/components/schemas/Insight' },
          },
        },
      },
    },
  },
};
