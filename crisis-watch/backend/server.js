const express = require('express');
const cors = require('cors');
const reliefwebRoutes = require('./routes/reliefweb');
const flightRoutes = require('./routes/flights');
const shelterRoutes = require('./routes/shelters');
const crossingRoutes = require('./routes/crossings');
const geocodeRoutes = require('./routes/geocode');
const casualtiesRoutes = require('./routes/casualties');
const newsRoutes = require('./routes/news');
const countryDataRoutes = require('./routes/countryData');
const tensionsRoutes = require('./routes/tensions');
const cyberRoutes = require('./routes/cyber');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/reliefweb', reliefwebRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/crossings', crossingRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/casualties', casualtiesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/countries', countryDataRoutes);
app.use('/api/tensions', tensionsRoutes);
app.use('/api/cyber', cyberRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WarInfo Backend] API proxy running on port ${PORT}`);
    console.log(`[WarInfo Backend] Health check: http://localhost:${PORT}/api/health`);
});
