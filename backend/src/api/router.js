'use strict';

const express = require('express');
const campaignService = require('../services/campaign.service');

const router = express.Router();

// GET /api/campaigns — list with summary metrics
router.get('/', (req, res, next) => {
  try {
    res.json(campaignService.listCampaigns());
  } catch (err) {
    next(err);
  }
});

// GET /api/campaigns/:id — full funnel analysis + insights
router.get('/:id', (req, res, next) => {
  try {
    const analysis = campaignService.getCampaignAnalysis(req.params.id);
    if (!analysis) {
      return res
        .status(404)
        .json({ error: 'Campaign not found', id: req.params.id });
    }
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
