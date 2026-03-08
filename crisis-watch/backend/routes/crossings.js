const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// HDX dataset search — humanitarian data packages
router.get('/search', cacheMiddleware('hdx_search', 600), async (req, res) => {
    try {
        const { region, q = 'border crossing humanitarian', rows = 20 } = req.query;
        const searchQuery = region ? `${q} ${region}` : q;

        const response = await axios.get('https://data.humdata.org/api/3/action/package_search', {
            params: {
                q: searchQuery,
                rows: parseInt(rows),
                sort: 'metadata_modified desc'
            },
            timeout: 15000
        });

        if (response.data && response.data.result) {
            const packages = response.data.result.results.map(pkg => ({
                id: pkg.id,
                title: pkg.title,
                description: pkg.notes ? pkg.notes.substring(0, 200) : '',
                organization: pkg.organization ? pkg.organization.title : 'Unknown',
                lastModified: pkg.metadata_modified,
                resources: (pkg.resources || []).slice(0, 3).map(r => ({
                    name: r.name,
                    format: r.format,
                    url: r.url,
                    lastModified: r.last_modified
                }))
            }));

            return res.sendCached(packages);
        }

        return res.sendWithFallback(null);
    } catch (error) {
        console.error('[HDX] Search error:', error.message);
        return res.sendFallback();
    }
});

// HDX crisis data for conflict events — returns incidents parsed from HDX
router.get('/crises', cacheMiddleware('hdx_crises', 300), async (req, res) => {
    try {
        const { country, limit = 50 } = req.query;
        const queries = [];

        if (country) {
            queries.push(`conflict ${country}`, `violence ${country}`, `crisis ${country}`);
        } else {
            queries.push('armed conflict', 'violence against civilians', 'crisis humanitarian');
        }

        const allResults = [];

        for (const q of queries.slice(0, 2)) {
            try {
                const response = await axios.get('https://data.humdata.org/api/3/action/package_search', {
                    params: { q, rows: Math.ceil(parseInt(limit) / 2), sort: 'metadata_modified desc' },
                    timeout: 10000
                });

                if (response.data?.result?.results) {
                    response.data.result.results.forEach(pkg => {
                        allResults.push({
                            id: pkg.id,
                            title: pkg.title,
                            description: pkg.notes?.substring(0, 300) || '',
                            organization: pkg.organization?.title || 'Unknown',
                            lastModified: pkg.metadata_modified,
                            tags: (pkg.tags || []).map(t => t.name),
                            country: pkg.groups?.[0]?.title || country || 'Global',
                            resourceCount: (pkg.resources || []).length,
                            url: `https://data.humdata.org/dataset/${pkg.name}`
                        });
                    });
                }
            } catch (err) {
                console.error(`[HDX] Query "${q}" failed:`, err.message);
            }
        }

        return res.sendCached(allResults.slice(0, parseInt(limit)));
    } catch (error) {
        console.error('[HDX] Crises error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
