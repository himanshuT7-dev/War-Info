const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function fetchTensions() {
    try {
        const queries = [
            'territorial dispute 2024 2025',
            'geopolitical tension 2024 2025',
            'military buildup border',
            'diplomatic crisis 2024 2025'
        ];

        const allResults = [];
        const seenTitles = new Set();

        const searchPromises = queries.map(query =>
            axios.get(WIKI_API, {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: query,
                    srnamespace: 0,
                    srlimit: 15,
                    srprop: 'snippet|timestamp',
                    format: 'json',
                    origin: '*'
                },
                headers: { 'User-Agent': 'WarInfo-CrisisMonitor/1.0 (humanitarian tool)' },
                timeout: 8000
            }).catch(() => null)
        );

        const responses = await Promise.all(searchPromises);

        for (const resp of responses) {
            if (!resp?.data?.query?.search) continue;
            for (const item of resp.data.query.search) {
                // Filter out non-current or irrelevant articles
                if (item.title.includes('List of') || item.title.includes('Wikipedia:')) continue;
                if (seenTitles.has(item.title)) continue;

                seenTitles.add(item.title);
                allResults.push({
                    id: `tension-${item.pageid}`,
                    title: item.title,
                    snippet: (item.snippet || '').replace(/<[^>]*>/g, ''),
                    date: item.timestamp,
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`
                });
            }
        }

        // Sort by most recent
        allResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        return allResults.slice(0, 10); // Keep top 10

    } catch (err) {
        console.error('[Tensions] Wiki fetch error:', err.message);
        return [];
    }
}

// GET /api/tensions
router.get('/', cacheMiddleware('tensions_global', 1800), async (req, res) => {
    try {
        const tensions = await fetchTensions();
        if (tensions.length > 0) {
            return res.sendCached(tensions);
        }
        return res.sendFallback();
    } catch (error) {
        console.error('[Tensions] Route error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
