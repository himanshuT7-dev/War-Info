const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();
const WIKI_API = 'https://en.wikipedia.org/w/api.php';

// Load static stats
let countryStats = {};
try {
    const dataPath = path.join(__dirname, '../data/countryStats.json');
    countryStats = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
    console.error('[CountryData] Failed to load static country stats', e);
}

// Fetch war history and general description from Wikipedia
async function fetchCountryHistory(countryName) {
    try {
        // Query 1: The country's main page summary for a general bio
        const summaryPromise = axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`, {
            timeout: 5000,
            headers: { 'Accept': 'application/json' }
        }).catch(() => null);

        // Query 2: Search for "List of wars involving {Country}" or "Military history of {Country}"
        const searchPromise = axios.get(WIKI_API, {
            params: {
                action: 'query',
                list: 'search',
                srsearch: `List of wars involving ${countryName} OR Military history of ${countryName}`,
                srlimit: 1,
                format: 'json',
                origin: '*'
            },
            headers: { 'User-Agent': 'WarInfo-CrisisMonitor/1.0 (humanitarian tool)' },
            timeout: 5000
        }).catch(() => null);

        const [summaryResp, searchResp] = await Promise.all([summaryPromise, searchPromise]);

        let bio = 'No general history available.';
        if (summaryResp?.data?.extract) {
            bio = summaryResp.data.extract.substring(0, 300) + '...';
        }

        let conflictHistory = '';
        let conflictUrl = null;
        if (searchResp?.data?.query?.search?.length > 0) {
            const item = searchResp.data.query.search[0];
            conflictHistory = (item.snippet || '').replace(/<[^>]*>/g, '');
            conflictUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`;
        }

        return {
            bio,
            conflictHistory,
            conflictUrl
        };
    } catch (err) {
        console.error('[CountryData] Wiki fetch error:', err.message);
        return { bio: '', conflictHistory: '', conflictUrl: null };
    }
}

router.get('/', cacheMiddleware('all_country_stats', 3600 * 24), async (req, res) => {
    try {
        return res.sendCached(countryStats);
    } catch (error) {
        console.error('[CountryData] All Stats Route error:', error.message);
        return res.sendFallback();
    }
});

router.get('/:code', cacheMiddleware('country_data', 3600), async (req, res) => {
    try {
        // The code usually comes as ISO-A3 from GeoJSON, e.g., "USA", "RUS"
        const { code } = req.params;
        const countryNameQuery = req.query.name;

        // 1. Get Static Stats
        const stats = countryStats[code] || {
            name: countryNameQuery || code,
            activePersonnel: "Unknown",
            reservePersonnel: "Unknown",
            warheads: "0",
            gdp: "Unknown",
            budget: "Unknown",
            tier: "Unknown Tier"
        };

        const countryName = stats.name;

        // 2. Fetch Dynamic History Context
        const history = await fetchCountryHistory(countryName);

        // 3. Combine and Respond
        const responseData = {
            id: code,
            ...stats,
            history: history.bio,
            conflictContext: history.conflictHistory,
            wikiUrl: history.conflictUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`
        };

        return res.sendCached(responseData);
    } catch (error) {
        console.error('[CountryData] Route error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
