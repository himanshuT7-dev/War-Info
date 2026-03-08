const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// Fetch conflict news from Wikipedia search
async function fetchWikiNews(queries, limit = 20) {
    try {
        const allResults = [];
        const seenIds = new Set();

        const searchPromises = queries.map(query =>
            axios.get(WIKI_API, {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: query,
                    srnamespace: 0,
                    srlimit: Math.min(limit, 20),
                    srprop: 'snippet|timestamp|titlesnippet|size',
                    format: 'json',
                    origin: '*'
                },
                timeout: 10000,
                headers: { 'User-Agent': 'WarInfo-CrisisMonitor/1.0', 'Accept': 'application/json' }
            }).catch(err => {
                console.warn('[Wiki News] Search error:', err.message);
                return null;
            })
        );

        const responses = await Promise.all(searchPromises);

        for (const resp of responses) {
            if (!resp?.data?.query?.search) continue;
            for (const item of resp.data.query.search) {
                if (seenIds.has(item.pageid)) continue;
                seenIds.add(item.pageid);
                allResults.push({
                    id: `wiki-news-${item.pageid}`,
                    title: item.title,
                    snippet: (item.snippet || '').replace(/<[^>]*>/g, ''),
                    date: item.timestamp,
                    source: 'Wikipedia',
                    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                    type: 'encyclopedia'
                });
            }
        }

        allResults.sort((a, b) => new Date(b.date) - new Date(a.date));
        return allResults.slice(0, limit);
    } catch (err) {
        console.error('[Wiki News] Error:', err.message);
        return [];
    }
}

// GET /api/news/global
router.get('/global', cacheMiddleware('news_global', 300), async (req, res) => {
    try {
        const queries = [
            'war conflict 2024 2025 casualties military',
            'military attack bombardment airstrike 2024 2025',
            'ceasefire peace negotiation 2024 2025',
            'humanitarian crisis displacement refugee 2024 2025'
        ];

        const news = await fetchWikiNews(queries, 25);

        if (news.length > 0) {
            return res.sendCached(news);
        }
        return res.sendFallback();
    } catch (error) {
        console.error('[News] Global error:', error.message);
        return res.sendFallback();
    }
});

// GET /api/news/:region
router.get('/:region', cacheMiddleware('news_region', 300), async (req, res) => {
    try {
        const { region } = req.params;

        const regionQueries = {
            ukraine: ['Ukraine Russia war 2024 2025', 'Ukrainian military offensive', 'Kyiv attack missile strike'],
            gaza: ['Gaza Israel war 2024 2025', 'Hamas ceasefire negotiation', 'Palestinian crisis humanitarian'],
            iran: ['Iran Israel conflict 2024 2025', 'Iran UAE attack 2025', 'Houthi Red Sea attack', 'Iran missile strike Gulf', 'Strait of Hormuz tension'],
            sudan: ['Sudan civil war 2024 2025', 'Darfur RSF humanitarian', 'Sudan displacement crisis'],
            afghanistan: ['Afghanistan Taliban conflict 2024 2025', 'Pakistan TTP insurgency attack', 'Afghanistan ISIS-K terrorism'],
            myanmar: ['Myanmar civil war 2024 2025', 'Myanmar military coup resistance', 'Chin Kachin Karen conflict'],
            ethiopia: ['Ethiopia Tigray war 2024 2025', 'Amhara Fano conflict', 'Ethiopia Oromia conflict'],
            drc: ['DRC M23 conflict 2024 2025', 'Congo Kivu war Rwanda', 'DRC humanitarian crisis displacement'],
            somalia: ['Somalia Al-Shabaab 2024 2025', 'Mogadishu attack explosion', 'Somalia ATMIS military operation'],
            yemen: ['Yemen Houthi war 2024 2025', 'Yemen Saudi coalition airstrike', 'Red Sea shipping attack Houthi']
        };

        const queries = regionQueries[region] || [`${region} war conflict 2024 2025`];
        const news = await fetchWikiNews(queries, 15);

        if (news.length > 0) {
            return res.sendCached(news);
        }
        return res.sendFallback();
    } catch (error) {
        console.error('[News] Region error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
