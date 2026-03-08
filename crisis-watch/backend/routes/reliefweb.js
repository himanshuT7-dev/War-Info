const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// Region-specific search queries for conflict reports
const REGION_QUERIES = {
    ukraine: ['Ukraine war', 'Russia Ukraine conflict', 'Ukrainian military', 'Kyiv attack'],
    gaza: ['Gaza war', 'Israel Hamas', 'Gaza conflict', 'Palestinian casualties'],
    iran: ['Iran Israel conflict', 'Yemen Houthi', 'Syria military', 'Iran proxy war'],
    sudan: ['Sudan civil war', 'Sudan RSF', 'Darfur conflict', 'Sudan humanitarian']
};

// All country names for global queries
const ALL_COUNTRIES = ['Ukraine', 'Russia', 'Gaza', 'Israel', 'Hamas', 'Lebanon', 'Iran', 'Syria', 'Yemen', 'Sudan', 'Chad', 'Ethiopia', 'Pakistan', 'Iraq', 'United Arab Emirates'];

async function fetchWikiReports(queries, limit = 50) {
    try {
        const allResults = [];
        // Run queries in parallel for speed
        const searchPromises = queries.map(query =>
            axios.get(WIKI_API, {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: query + ' 2024 2025',
                    srnamespace: 0,
                    srlimit: Math.min(limit, 20),
                    srprop: 'snippet|timestamp|titlesnippet|size',
                    format: 'json',
                    origin: '*'
                },
                timeout: 10000,
                headers: { 'User-Agent': 'WarInfo-CrisisMonitor/1.0', 'Accept': 'application/json' }
            }).catch(err => {
                console.warn('[Wiki Reports] Search error:', err.message);
                return null;
            })
        );

        const responses = await Promise.all(searchPromises);

        const seenIds = new Set();
        for (const resp of responses) {
            if (!resp?.data?.query?.search) continue;
            for (const item of resp.data.query.search) {
                if (seenIds.has(item.pageid)) continue;
                seenIds.add(item.pageid);

                const snippet = (item.snippet || '').replace(/<[^>]*>/g, '');

                // Try to determine country from title/snippet
                let country = 'Unknown';
                const combined = (item.title + ' ' + snippet).toLowerCase();
                if (combined.includes('ukraine') || combined.includes('kyiv') || combined.includes('russian invasion')) country = 'Ukraine';
                else if (combined.includes('gaza') || combined.includes('palestinian') || combined.includes('hamas')) country = 'Palestine';
                else if (combined.includes('israel')) country = 'Israel';
                else if (combined.includes('iran')) country = 'Iran';
                else if (combined.includes('lebanon') || combined.includes('hezbollah')) country = 'Lebanon';
                else if (combined.includes('syria')) country = 'Syria';
                else if (combined.includes('yemen') || combined.includes('houthi')) country = 'Yemen';
                else if (combined.includes('sudan') || combined.includes('darfur') || combined.includes('khartoum')) country = 'Sudan';
                else if (combined.includes('russia')) country = 'Russia';
                else if (combined.includes('chad')) country = 'Chad';
                else if (combined.includes('ethiopia')) country = 'Ethiopia';
                else if (combined.includes('pakistan')) country = 'Pakistan';
                else if (combined.includes('iraq') || combined.includes('erbil')) country = 'Iraq';
                else if (combined.includes('uae') || combined.includes('emirates')) country = 'United Arab Emirates';

                // Determine type from content
                let disasterType = 'Conflict';
                if (combined.includes('airstrike') || combined.includes('bombing') || combined.includes('missile')) disasterType = 'Military Strike';
                else if (combined.includes('humanitarian') || combined.includes('refugee')) disasterType = 'Humanitarian';
                else if (combined.includes('casualties') || combined.includes('killed') || combined.includes('death')) disasterType = 'Casualties';
                else if (combined.includes('ceasefire') || combined.includes('peace') || combined.includes('negotiation')) disasterType = 'Diplomacy';

                allResults.push({
                    id: `wiki-report-${item.pageid}`,
                    title: item.title,
                    date: item.timestamp,
                    source: 'Wikipedia',
                    country,
                    countries: [country],
                    disaster: 'Armed Conflict',
                    disasterType,
                    themes: [disasterType, 'Conflict'],
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                    snippet,
                    image: null
                });
            }
        }

        // Sort by date
        allResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        return allResults.slice(0, limit);
    } catch (err) {
        console.error('[Wiki Reports] Error:', err.message);
        return [];
    }
}

// Reports endpoint — uses Wikipedia search
router.get('/reports', cacheMiddleware('wiki_reports', 120), async (req, res) => {
    try {
        const { country, limit = 50 } = req.query;

        let queries;
        if (country) {
            const countries = Array.isArray(country) ? country : [country];
            queries = countries.map(c => `${c} war conflict 2024 2025`);
        } else {
            // Global — search all conflict queries
            queries = ['war conflict casualties 2024 2025', 'military attack airstrike 2024 2025', 'humanitarian crisis refugee 2024 2025'];
        }

        const reports = await fetchWikiReports(queries, parseInt(limit));

        if (reports.length > 0) {
            return res.sendCached(reports);
        }

        return res.sendFallback();
    } catch (error) {
        console.error('[Reports] Error:', error.message);
        return res.sendFallback();
    }
});

// Disasters endpoint — uses Wikipedia search for active conflicts
router.get('/disasters', cacheMiddleware('wiki_disasters', 600), async (req, res) => {
    try {
        const { country, limit = 20 } = req.query;

        let queries;
        if (country) {
            const countries = Array.isArray(country) ? country : [country];
            queries = countries.map(c => `${c} crisis emergency humanitarian disaster`);
        } else {
            queries = ['humanitarian crisis ongoing 2024 2025', 'military conflict active war'];
        }

        const results = await fetchWikiReports(queries, parseInt(limit));

        // Transform to disaster format
        const disasters = results.map(r => ({
            id: r.id.replace('report', 'disaster'),
            name: r.title,
            date: r.date,
            status: 'ongoing',
            country: r.country,
            countries: r.countries,
            type: r.disasterType || 'Crisis',
            glide: null,
            url: r.url
        }));

        if (disasters.length > 0) {
            return res.sendCached(disasters);
        }

        return res.sendFallback();
    } catch (error) {
        console.error('[Disasters] Error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
