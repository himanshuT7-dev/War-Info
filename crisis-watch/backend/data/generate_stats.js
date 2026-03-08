const fs = require('fs');
const path = require('path');
const axios = require('axios');

const STATS_PATH = path.join(__dirname, 'countryStats.json');

async function generateGlobalStats() {
    try {
        console.log('Reading existing custom 20-country baseline...');
        const existingStats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));

        console.log('Fetching World Bank Armed Forces Personnel (MS.MIL.TOTL.P1)...');
        // WB API usually has data trailing by a couple of years, so date=2020 is safe
        const personnelRes = await axios.get('http://api.worldbank.org/v2/country/all/indicator/MS.MIL.TOTL.P1?format=json&per_page=300&date=2020');
        const personnelData = personnelRes.data[1] || [];

        console.log('Fetching World Bank GDP USD (NY.GDP.MKTP.CD)...');
        const gdpRes = await axios.get('http://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json&per_page=300&date=2022');
        const gdpData = gdpRes.data[1] || [];


        // Create lookup dictionaries by ISO A3 (id in World Bank is country.id)
        const pMap = {};
        personnelData.forEach(item => {
            // item.countryiso3code
            if (item.countryiso3code && item.value) {
                pMap[item.countryiso3code] = {
                    value: item.value,
                    name: item.country.value
                };
            }
        });

        const gMap = {};
        gdpData.forEach(item => {
            if (item.countryiso3code && item.value) {
                gMap[item.countryiso3code] = {
                    value: item.value,
                    name: item.country.value
                };
            }
        });

        // WB API returns standard ISO A3 codes. We can iterate over the 200+ countries
        const finalStats = { ...existingStats };

        // We want to combine all unique ISO codes from pMap and gMap
        const allIsoCodes = new Set([...Object.keys(pMap), ...Object.keys(gMap)]);

        // Known World Bank aggregate region codes that are not countries
        const excludeAggregates = new Set([
            'ARB', 'CSS', 'CEB', 'EAR', 'EAS', 'EAP', 'TEA', 'ECA', 'TEC', 'EUU', 'FCS',
            'HIC', 'HPC', 'IBD', 'IBW', 'IDA', 'IDB', 'IDX', 'LAC', 'TLA', 'LDC', 'LIC',
            'LMC', 'LMY', 'LTE', 'MNA', 'TMN', 'MIC', 'NAC', 'OED', 'OSS', 'PSS', 'PST',
            'PRE', 'SNO', 'SAS', 'TSA', 'SSF', 'TSSA', 'UMC', 'WLD', 'XC', 'XE', 'XF',
            'XG', 'XH', 'XI', 'XJ', 'XK', 'XL', 'XM', 'XN', 'XO', 'XP', 'XQ', 'XR', 'XS',
            'XT', 'XU', 'XV', 'XY', 'Z4', 'Z7', 'ZJ', 'ZQ', 'ZT'
        ]);

        // Formatting utilities
        const formatNumber = (num) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        };

        const formatCurrency = (num) => {
            if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + ' Trillion';
            if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + ' Billion';
            if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + ' Million';
            return '$' + num.toString();
        };

        allIsoCodes.forEach(iso => {
            if (excludeAggregates.has(iso) || !iso.trim() || iso === 'EMU') return;

            const existing = finalStats[iso] || {};
            const pData = pMap[iso] || {};
            const gData = gMap[iso] || {};

            const activeRaw = pData.value || 0;
            const gdpRaw = gData.value || 0;
            const fetchedName = pData.name || gData.name || "Unknown";

            let finalName = existing.name;
            if (!finalName || finalName === "World Bank Data") {
                finalName = fetchedName;
            }

            finalStats[iso] = {
                name: finalName,
                activePersonnel: (existing.activePersonnel && existing.activePersonnel !== "Data Unavailable")
                    ? existing.activePersonnel
                    : (activeRaw > 0 ? formatNumber(activeRaw) : "Data Unavailable"),
                reservePersonnel: existing.reservePersonnel || "Unknown",
                warheads: existing.warheads || "0",
                gdp: (existing.gdp && existing.gdp !== "Data Unavailable")
                    ? existing.gdp
                    : (gdpRaw > 0 ? formatCurrency(gdpRaw) : "Data Unavailable"),
                budget: existing.budget || "N/A",
                tier: existing.tier || (gdpRaw > 1e12 ? "Tier 2 - Advanced Economy" : (gdpRaw > 1e11 ? "Tier 3 - Regional Economy" : "Tier 4 - Developing Economy"))
            };
        });

        console.log(`Writing ${Object.keys(finalStats).length} total countries to JSON database...`);
        fs.writeFileSync(STATS_PATH, JSON.stringify(finalStats, null, 4));
        console.log('Complete!');

    } catch (err) {
        console.error('Error fetching global stats:', err.message);
    }
}

generateGlobalStats();
