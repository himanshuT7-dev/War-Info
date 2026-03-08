const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

router.get('/events', cacheMiddleware('acled', 300), async (req, res) => {
    try {
        const { key, email, region, event_type, limit = 500, days = 7 } = req.query;

        if (!key || !email) {
            return res.status(400).json({ error: 'ACLED API key and email are required' });
        }

        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - parseInt(days));
        const dateStr = dateFrom.toISOString().split('T')[0];

        const params = {
            key,
            email,
            event_date: dateStr,
            event_date_where: '>=',
            limit: parseInt(limit),
            fields: 'event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|country|admin1|admin2|location|latitude|longitude|fatalities|source|notes|timestamp'
        };

        if (region) params.region = region;
        if (event_type) params.event_type = event_type;

        const response = await axios.get('https://api.acleddata.com/acled/read', {
            params,
            timeout: 15000
        });

        if (response.data && response.data.data) {
            return res.sendCached(response.data.data);
        }

        return res.sendWithFallback(null);
    } catch (error) {
        console.error('[ACLED] Fetch error:', error.message);
        return res.sendFallback();
    }
});

router.get('/stats', cacheMiddleware('acled_stats', 300), async (req, res) => {
    try {
        const { key, email, region, days = 1 } = req.query;

        if (!key || !email) {
            return res.status(400).json({ error: 'ACLED API key and email are required' });
        }

        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - parseInt(days));
        const dateStr = dateFrom.toISOString().split('T')[0];

        const response = await axios.get('https://api.acleddata.com/acled/read', {
            params: {
                key,
                email,
                event_date: dateStr,
                event_date_where: '>=',
                limit: 2000,
                fields: 'event_id_cnty|event_date|event_type|country|latitude|longitude|fatalities|timestamp'
            },
            timeout: 15000
        });

        if (response.data && response.data.data) {
            const events = response.data.data;
            const stats = {
                totalEvents: events.length,
                totalFatalities: events.reduce((sum, e) => sum + (parseInt(e.fatalities) || 0), 0),
                byType: {},
                byCountry: {},
                recentEvents: events.slice(0, 10)
            };

            events.forEach(e => {
                stats.byType[e.event_type] = (stats.byType[e.event_type] || 0) + 1;
                stats.byCountry[e.country] = (stats.byCountry[e.country] || 0) + 1;
            });

            return res.sendCached(stats);
        }

        return res.sendWithFallback(null);
    } catch (error) {
        console.error('[ACLED Stats] Fetch error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
