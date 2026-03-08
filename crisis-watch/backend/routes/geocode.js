const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

router.get('/search', cacheMiddleware('geocode', 3600), async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q,
                format: 'json',
                limit: parseInt(limit),
                addressdetails: 1
            },
            timeout: 10000,
            headers: { 'User-Agent': 'WarInfo-CrisisMonitor/1.0' }
        });

        if (response.data) {
            const results = response.data.map(place => ({
                name: place.display_name,
                lat: parseFloat(place.lat),
                lon: parseFloat(place.lon),
                type: place.type,
                address: place.address || {}
            }));
            return res.sendCached(results);
        }

        return res.sendWithFallback(null);
    } catch (error) {
        console.error('[Geocode] Error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
