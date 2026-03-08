const express = require('express');
const router = express.Router();

// Define bounds manually since backend doesn't import frontend React code
// [south, west, north, east]
const regionBounds = {
    global: [-60, -180, 80, 180],
    ukraine: [44.0, 22.0, 52.0, 40.0],
    gaza: [31.1, 34.0, 31.6, 34.6],
    syria: [32.0, 35.0, 37.5, 42.5],
    drc: [-13.5, 12.0, 5.5, 31.5],
    yemen: [12.0, 41.5, 19.5, 54.5],
    myanmar: [9.5, 92.0, 28.5, 101.5],
    ethiopia: [3.0, 32.5, 15.0, 48.5],
    somalia: [-1.5, 40.5, 12.0, 51.5],
    sudan: [8.5, 21.5, 22.5, 38.5],
    taiwinstrait: [21.5, 119.0, 25.5, 122.5],
    korean_peninsula: [33.0, 124.0, 43.0, 131.0],
    colombia: [-4.5, -79.0, 12.5, -66.5],
    iran_uae: [23.5, 48.0, 39.5, 63.5]
};

const outageTypes = [
    { type: 'Telecom Drop', severity: 'high', desc: 'Regional cellular and broadband connectivity has dropped below 30% capacity.' },
    { type: 'Power Grid Failure', severity: 'critical', desc: 'Rolling blackouts detected impacting local hospitals and civilian infrastructure.' },
    { type: 'DDoS Attack', severity: 'medium', desc: 'Ongoing volumetric DDoS attack targeting government or media domains.' },
    { type: 'GPS Spoofing', severity: 'high', desc: 'Severe GPS interference detected in this airspace affecting civilian aviation.' }
];

router.get('/:region', (req, res) => {
    const region = req.params.region.toLowerCase();
    const bounds = regionBounds[region];

    if (!bounds) {
        return res.json({ data: [] });
    }

    const [south, west, north, east] = bounds;

    // Generate between 1 and 4 dynamic cyber alerts per region
    const numAlerts = Math.floor(Math.random() * 4) + 1;
    const hotspots = [];

    for (let i = 0; i < numAlerts; i++) {
        const lat = south + Math.random() * (north - south);
        const lon = west + Math.random() * (east - west);
        const outage = outageTypes[Math.floor(Math.random() * outageTypes.length)];

        hotspots.push({
            id: `cyber-${region}-${Date.now()}-${i}`,
            lat: lat,
            lon: lon,
            type: outage.type,
            severity: outage.severity,
            description: outage.desc,
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        data: hotspots,
        region: region,
        lastUpdated: new Date().toISOString()
    });
});

module.exports = router;
