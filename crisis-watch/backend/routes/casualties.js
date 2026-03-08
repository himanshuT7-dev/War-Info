const express = require('express');
const axios = require('axios');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// Wikipedia page titles for each conflict's casualty data
const CONFLICT_PAGES = {
    ukraine: {
        pages: ['Casualties_of_the_Russo-Ukrainian_war'],
        conflictName: 'Russo-Ukrainian War',
        startDate: '2022-02-24',
        parties: ['Ukraine', 'Russia']
    },
    gaza: {
        pages: ['Gaza_war_(2023%E2%80%93present)', 'Casualties_of_the_Gaza_war_(2023%E2%80%93present)'],
        conflictName: 'Gaza War (Israel–Hamas)',
        startDate: '2023-10-07',
        parties: ['Palestine', 'Israel']
    },
    iran: {
        pages: ['Iran%E2%80%93Israel_conflict_during_the_Gaza_war', '2024_Iran%E2%80%93Israel_conflict', 'Iran%E2%80%93United_Arab_Emirates_relations'],
        conflictName: 'Iran–UAE–Israel Conflict',
        startDate: '2024-04-13',
        parties: ['Iran', 'Israel', 'UAE', 'Houthis']
    },
    sudan: {
        pages: ['War_in_Sudan_(2023%E2%80%93present)'],
        conflictName: 'Sudanese Civil War',
        startDate: '2023-04-15',
        parties: ['Sudan SAF', 'RSF']
    },
    afghanistan: {
        pages: ['Civilian_casualties_in_the_war_in_Afghanistan_(2001%E2%80%932021)', 'War_in_Afghanistan_(2001%E2%80%932021)', 'Insurgency_in_Khyber_Pakhtunkhwa'],
        conflictName: 'Afghanistan–Pakistan Conflict',
        startDate: '2001-10-07',
        parties: ['Taliban', 'Pakistan Army', 'TTP', 'ISIS-K']
    },
    myanmar: {
        pages: ['Myanmar_civil_war_(2021%E2%80%93present)', 'Internal_conflict_in_Myanmar'],
        conflictName: 'Myanmar Civil War',
        startDate: '2021-02-01',
        parties: ['Myanmar Military (Tatmadaw)', 'NUG / PDF', 'Ethnic Armed Organizations'],
        fallbackStats: { killed: 50000, displaced: 3000000 }
    },
    ethiopia: {
        pages: ['Tigray_war', 'Ethiopian_civil_conflict_(2018%E2%80%93present)'],
        conflictName: 'Ethiopian Conflicts',
        startDate: '2020-11-04',
        parties: ['Ethiopian Government (ENDF)', 'TPLF', 'Fano Militia', 'OLA'],
        fallbackStats: { killed: 600000, displaced: 2500000 }
    },
    drc: {
        pages: ['M23_offensive_(2022%E2%80%93present)', 'Kivu_conflict', 'Ituri_conflict'],
        conflictName: 'DRC / Congo Conflict',
        startDate: '2022-03-01',
        parties: ['DRC Military (FARDC)', 'M23', 'ADF', 'Rwanda (alleged)'],
        fallbackStats: { killed: 12000, displaced: 6900000 }
    },
    somalia: {
        pages: ['Somali_Civil_War_(2009%E2%80%93present)', 'Al-Shabaab_(militant_group)'],
        conflictName: 'Somalia / Al-Shabaab Insurgency',
        startDate: '2009-01-31',
        parties: ['Somali Government', 'Al-Shabaab', 'AMISOM/ATMIS', 'ISIS-Somalia'],
        fallbackStats: { killed: 50000, displaced: 3800000 }
    },
    yemen: {
        pages: ['Yemeni_civil_war_(2014%E2%80%93present)', 'Houthi%E2%80%93Saudi_Arabian_conflict'],
        conflictName: 'Yemeni Civil War',
        startDate: '2014-09-16',
        parties: ['Houthis (Ansar Allah)', 'Saudi Coalition', 'Yemen Government', 'STC'],
        fallbackStats: { killed: 377000, displaced: 4500000 }
    },
    // Aggregate casualties across all tracked conflicts for the Global view
    global: {
        pages: [
            'Casualties_of_the_Russo-Ukrainian_war',
            'Gaza_war_(2023%E2%80%93present)',
            'Casualties_of_the_Gaza_war_(2023%E2%80%93present)',
            'Iran%E2%80%93Israel_conflict_during_the_Gaza_war',
            'War_in_Sudan_(2023%E2%80%93present)',
            'Civilian_casualties_in_the_war_in_Afghanistan_(2001%E2%80%932021)',
            'Myanmar_civil_war_(2021%E2%80%93present)',
            'Tigray_war',
            'M23_offensive_(2022%E2%80%93present)',
            'Somali_Civil_War_(2009%E2%80%93present)',
            'Yemeni_civil_war_(2014%E2%80%93present)'
        ],
        conflictName: 'Tracked Conflicts (Global)',
        startDate: null,
        parties: ['Ukraine', 'Russia', 'Palestine', 'Israel', 'Iran', 'UAE', 'Sudan', 'Afghanistan', 'Pakistan', 'Myanmar', 'Ethiopia', 'DRC', 'Somalia', 'Yemen']
    }
};

// Improved number extraction that handles "1.5 million", "72,000", "400,000 and 1.5 million", etc.
function parseNumericValue(str) {
    if (!str) return null;
    str = str.replace(/,/g, '').trim();
    const num = parseFloat(str);
    if (isNaN(num)) return null;
    return num;
}

function extractNumbers(text) {
    const result = {
        totalKilled: null,
        totalWounded: null,
        totalDisplaced: null,
        civilianKilled: null
    };

    // Normalize text for easier matching
    const t = text.replace(/\s+/g, ' ');

    // --- KILLED patterns ---
    // "over X Palestinians killed", "X Israelis killed", "X people killed"
    let match;

    // "over 72,000 Palestinians in Gaza have been killed"
    match = t.match(/over\s+([\d,]+)\s+[\w\s]+?(?:have been\s+)?killed/i);
    if (match) result.totalKilled = parseNumericValue(match[1]);

    // "1,195 Israelis and foreign nationals were killed"
    match = t.match(/([\d,]+)\s+[\w\s]+?were\s+killed/i);
    if (match) {
        const v = parseNumericValue(match[1]);
        if (v && (!result.totalKilled || v > result.totalKilled)) result.totalKilled = v;
    }

    // "between 400,000 and 1.5 million estimated casualties"
    match = t.match(/between\s+([\d,.]+)\s+and\s+([\d,.]+)\s*(million|thousand)?\s*(?:estimated\s+)?casualties/i);
    if (match) {
        let num1 = parseNumericValue(match[1]);
        let num2 = parseNumericValue(match[2]);
        const mult = match[3];
        if (mult && mult.toLowerCase() === 'million') {
            if (num2 < 1000) num2 = num2 * 1000000;
            if (num1 < 1000) num1 = num1 * 1000000;
        } else if (mult && mult.toLowerCase() === 'thousand') {
            if (num2 < 1000) num2 = num2 * 1000;
            if (num1 < 1000) num1 = num1 * 1000;
        }
        const maxVal = Math.max(num1 || 0, num2 || 0);
        if (maxVal > (result.totalKilled || 0)) result.totalKilled = maxVal;
    }

    // "X,XXX killed" or "X deaths"
    const killedSimple = t.match(/([\d,]+)\s+(?:killed|deaths?|dead|fatalities)/gi);
    if (killedSimple) {
        for (const m of killedSimple) {
            const numMatch = m.match(/([\d,]+)/);
            if (numMatch) {
                const v = parseNumericValue(numMatch[1]);
                if (v && (!result.totalKilled || v > result.totalKilled)) result.totalKilled = v;
            }
        }
    }

    // "killed X,XXX"
    match = t.match(/killed\s+([\d,.]+)\s*(million|m)?/i);
    if (match) {
        let v = parseNumericValue(match[1]);
        if (match[2] && match[2].toLowerCase().startsWith('m')) v = v * 1000000;
        if (!result.totalKilled || v > result.totalKilled) result.totalKilled = v;
    }

    // "14,200–14,400 military and civilian deaths" or "estimated 176,000–212,000+"
    const rangeDeaths = t.match(/([\d,]+)[–\-]([\d,]+)(?:\+)?\s+(?:(?:\w+\s+)?(?:and\s+\w+\s+)?deaths?|people|casualties)/i);
    if (rangeDeaths) {
        const v1 = parseNumericValue(rangeDeaths[1]);
        const v2 = parseNumericValue(rangeDeaths[2]);
        const max = Math.max(v1 || 0, v2 || 0);
        if (max > (result.totalKilled || 0)) result.totalKilled = max;
    }

    // "estimated 176,000–212,000+"
    match = t.match(/estimated\s+([\d,]+)[–\-]([\d,]+)/i);
    if (match) {
        const v1 = parseNumericValue(match[1]);
        const v2 = parseNumericValue(match[2]);
        const max = Math.max(v1 || 0, v2 || 0);
        if (max > (result.totalKilled || 0)) result.totalKilled = max;
    }

    // --- DISPLACED patterns ---
    // "12 million people to be forcibly displaced"
    match = t.match(/([\d,.]+)\s*(million|m)?\s+(?:people\s+)?(?:(?:to be\s+)?forcibly\s+)?displaced/i);
    if (match) {
        let v = parseNumericValue(match[1]);
        if (match[2] || v < 1000) v = v * 1000000;
        result.totalDisplaced = v;
    }

    // "displaced X million"
    match = t.match(/displaced\s+([\d,.]+)\s*(million)?/i);
    if (match) {
        let v = parseNumericValue(match[1]);
        if (match[2] || v < 1000) v = v * 1000000;
        if (!result.totalDisplaced || v > result.totalDisplaced) result.totalDisplaced = v;
    }

    // "X internally displaced" or "another X million were internally displaced"
    match = t.match(/([\d,.]+)\s*(million|m)?\s+(?:were\s+)?internally\s+displaced/i);
    if (match) {
        let v = parseNumericValue(match[1]);
        if (match[2] || v < 1000) v = v * 1000000;
        if (!result.totalDisplaced || v > result.totalDisplaced) result.totalDisplaced = v;
    }

    // "X refugees" or "X fled"
    match = t.match(/([\d,.]+)\s*(million|m)?\s+(?:have\s+)?(?:fled|refugees)/i);
    if (match) {
        let v = parseNumericValue(match[1]);
        if (match[2] || v < 100) v = v * 1000000;
        // Add to displaced
        result.totalDisplaced = (result.totalDisplaced || 0) + v;
    }

    // --- WOUNDED patterns ---
    match = t.match(/([\d,]+)\s+(?:wounded|injured)/i);
    if (match) result.totalWounded = parseNumericValue(match[1]);

    // "251 were taken hostage" — interesting but not wounded
    // "hostage" data can be extracted if needed

    return result;
}

// GET /api/casualties/:region
router.get('/:region', cacheMiddleware('casualties', 3600), async (req, res) => {
    try {
        const { region } = req.params;
        const config = CONFLICT_PAGES[region];

        if (!config) {
            return res.sendCached({
                region,
                conflictName: 'Unknown Region',
                totalKilled: null,
                totalDisplaced: null,
                totalWounded: null,
                summary: 'No casualty data available for this region.',
                startDate: null,
                source: null
            });
        }

        // Fetch Wikipedia page summaries — try all pages
        const summaries = await Promise.all(
            config.pages.map(async (page) => {
                try {
                    const response = await axios.get(
                        `https://en.wikipedia.org/api/rest_v1/page/summary/${page}`,
                        {
                            timeout: 10000,
                            headers: {
                                'User-Agent': 'WarInfo-CrisisMonitor/1.0 (humanitarian tool; contact: warinfo@example.com)',
                                'Accept': 'application/json'
                            }
                        }
                    );
                    return response.data;
                } catch (err) {
                    console.error(`[Casualties] Wikipedia fetch error for ${page}:`, err.message);
                    return null;
                }
            })
        );

        const validSummaries = summaries.filter(Boolean);

        if (validSummaries.length === 0) {
            return res.sendFallback();
        }

        // Combine all extract text for number extraction
        const combinedText = validSummaries.map(s => s.extract || '').join(' ');
        const numbers = extractNumbers(combinedText);

        const result = {
            region,
            conflictName: config.conflictName,
            startDate: config.startDate,
            parties: config.parties,
            totalKilled: numbers.totalKilled || config.fallbackStats?.killed || null,
            totalWounded: numbers.totalWounded || null,
            totalDisplaced: numbers.totalDisplaced || config.fallbackStats?.displaced || null,
            civilianKilled: numbers.civilianKilled || null,
            summary: validSummaries[0]?.extract || '',
            sourceUrl: validSummaries[0]?.content_urls?.desktop?.page || null,
            source: 'Wikipedia',
            lastUpdated: new Date().toISOString()
        };

        return res.sendCached(result);
    } catch (error) {
        console.error('[Casualties] Error:', error.message);
        return res.sendFallback();
    }
});

module.exports = router;
