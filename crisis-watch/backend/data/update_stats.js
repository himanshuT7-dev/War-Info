const fs = require('fs');
const path = require('path');
const axios = require('axios');

const STATS_PATH = path.join(__dirname, 'countryStats.json');

async function updateStats() {
    try {
        const stats = JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
        console.log('Fetching World Bank data...');
        const personnelRes = await axios.get('http://api.worldbank.org/v2/country/all/indicator/MS.MIL.TOTL.P1?format=json&per_page=300&date=2020');
        const gdpRes = await axios.get('http://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json&per_page=300&date=2022');
        const pMap = {};
        (personnelRes.data[1] || []).forEach(item => {
            if (item.countryiso3code && item.value) pMap[item.countryiso3code] = item.value;
        });
        const gMap = {};
        (gdpRes.data[1] || []).forEach(item => {
            if (item.countryiso3code && item.value) gMap[item.countryiso3code] = item.value;
        });
        const formatNumber = num => {
            if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
            return num.toString();
        };
        const formatCurrency = num => {
            if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + ' Trillion';
            if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + ' Billion';
            if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + ' Million';
            return '$' + num.toString();
        };
        let updated = 0;
        Object.keys(stats).forEach(iso => {
            const entry = stats[iso];
            if (entry.activePersonnel === 'Data Unavailable' && pMap[iso]) {
                entry.activePersonnel = formatNumber(pMap[iso]);
                updated++;
            }
            if (entry.gdp === 'Data Unavailable' && gMap[iso]) {
                entry.gdp = formatCurrency(gMap[iso]);
                updated++;
            }
        });
        console.log(`Updated ${updated} fields`);
        fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 4));
        console.log('Done');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

updateStats();
