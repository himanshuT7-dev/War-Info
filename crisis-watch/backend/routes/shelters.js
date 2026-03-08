const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// Shelters using HDX search for shelter/camp data
router.get('/camps', cacheMiddleware('shelters', 600), async (req, res) => {
    try {
        const { country, limit = 30 } = req.query;

        const q = country ? `refugee camp shelter ${country}` : 'refugee camp shelter';

        const response = await axios.get('https://data.humdata.org/api/3/action/package_search', {
            params: {
                q,
                rows: parseInt(limit),
                sort: 'metadata_modified desc'
            },
            timeout: 15000
        });

        if (response.data?.result?.results) {
            const shelters = response.data.result.results.map(pkg => ({
                name: pkg.title,
                type: 'refugee camp',
                description: pkg.notes?.substring(0, 200) || '',
                organization: pkg.organization?.title || 'Unknown',
                lastModified: pkg.metadata_modified,
                country: pkg.groups?.[0]?.title || country || 'Unknown',
                url: `https://data.humdata.org/dataset/${pkg.name}`,
                resources: (pkg.resources || []).slice(0, 2).map(r => ({
                    name: r.name,
                    format: r.format,
                    url: r.url
                }))
            }));

            return res.sendCached(shelters);
        }

        return res.sendWithFallback(null);
    } catch (error) {
        console.error('[Shelters] Fetch error:', error.message);
        return res.sendFallback();
    }
});

// Nearby search using Nominatim
router.get('/nearby', cacheMiddleware('nearby_shelters', 300), async (req, res) => {
    try {
        const { lat, lon, radius = 100 } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const searchTerms = ['hospital', 'shelter', 'refugee camp', 'clinic', 'aid center'];
        const allResults = [];

        for (const term of searchTerms.slice(0, 3)) {
            try {
                const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: term,
                        format: 'json',
                        limit: 5,
                        viewbox: `${parseFloat(lon) - 1},${parseFloat(lat) + 1},${parseFloat(lon) + 1},${parseFloat(lat) - 1}`,
                        bounded: 1
                    },
                    timeout: 8000,
                    headers: { 'User-Agent': 'WarInfo-CrisisMonitor/1.0 (humanitarian tool)' }
                });

                if (response.data) {
                    response.data.forEach(place => {
                        const distance = getDistanceKm(
                            parseFloat(lat), parseFloat(lon),
                            parseFloat(place.lat), parseFloat(place.lon)
                        );
                        allResults.push({
                            name: place.display_name.split(',')[0],
                            fullName: place.display_name,
                            lat: parseFloat(place.lat),
                            lon: parseFloat(place.lon),
                            type: term,
                            distance: Math.round(distance * 10) / 10,
                            directionsUrl: `https://www.google.com/maps/dir/${lat},${lon}/${place.lat},${place.lon}`
                        });
                    });
                }
            } catch (err) {
                console.error(`[Shelters Nearby] Search for "${term}" failed:`, err.message);
            }

            // Rate limit — Nominatim requires 1 req/sec
            await new Promise(resolve => setTimeout(resolve, 1100));
        }

        // Deduplicate by coordinates (within 0.001 degree)
        const unique = [];
        allResults.forEach(r => {
            const isDupe = unique.some(u =>
                Math.abs(u.lat - r.lat) < 0.001 && Math.abs(u.lon - r.lon) < 0.001
            );
            if (!isDupe) unique.push(r);
        });

        const sorted = unique.sort((a, b) => a.distance - b.distance).slice(0, 5);
        return res.sendCached(sorted);
    } catch (error) {
        console.error('[Shelters Nearby] Error:', error.message);
        return res.sendFallback();
    }
});

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = router;
