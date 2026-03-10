const express = require('express');
const router = express.Router();
const { generateRouteLink } = require('../utils');

// POST /api/route/generate
// Body: { locations: string[], travelmode: string }
router.post('/generate', async (req, res) => {
  const { locations, travelmode = 'driving' } = req.body;
  if (!Array.isArray(locations) || locations.length < 2) {
    return res.status(400).json({ error: 'At least 2 locations are required.' });
  }
  try {
    const routeUrl = await generateRouteLink(locations, travelmode, process.env.GEOCODING_API_KEY || process.env.PLACES_API_KEY || '');
    res.json({ routeUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

