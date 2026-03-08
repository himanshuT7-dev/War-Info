const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

router.get('/states', cacheMiddleware('flights', 60), async (req, res) => {
    try {
        const { lamin, lomin, lamax, lomax } = req.query;

        let url = 'https://opensky-network.org/api/states/all';
        const params = {};

        if (lamin && lomin && lamax && lomax) {
            params.lamin = parseFloat(lamin);
            params.lomin = parseFloat(lomin);
            params.lamax = parseFloat(lamax);
            params.lomax = parseFloat(lomax);
        }

        // Use public API (no auth) — 5 requests/min rate limit
        const response = await axios.get(url, {
            params,
            timeout: 20000,
            headers: {
                'User-Agent': 'WarInfo-CrisisMonitor/1.0 (humanitarian)',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.states) {
            const aircraft = response.data.states.map(s => ({
                icao24: s[0],
                callsign: (s[1] || '').trim(),
                originCountry: s[2],
                longitude: s[5],
                latitude: s[6],
                altitude: s[7] || s[13],
                onGround: s[8],
                velocity: s[9],
                heading: s[10],
                verticalRate: s[11],
                squawk: s[14]
            })).filter(a => a.latitude && a.longitude);

            // Cap aircraft for global/worldwide bounds to avoid lag (OpenSky returns thousands)
            const latSpan = params.lamax && params.lamin ? params.lamax - params.lamin : 0;
            const lonSpan = params.lomax && params.lomin ? params.lomax - params.lomin : 0;
            const isGlobal = latSpan >= 100 || lonSpan >= 300;
            const capped = isGlobal ? aircraft.slice(0, 30) : aircraft;

            return res.sendCached(capped);
        }

        return res.sendWithFallback(null);
    } catch (error) {
        console.error('[OpenSky] Fetch error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
