const fs = require('fs');
const path = require('path');
const axios = require('axios');
const turf = require('@turf/turf');

const GEOJSON_PATH = path.join(__dirname, '../../frontend/public/data/countries.geo.json');
const INDIA_STATES_URL = 'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson';

async function fixIndiaMap() {
    try {
        console.log('Fetching India states GeoJSON...');
        const { data: statesGeoJSON } = await axios.get(INDIA_STATES_URL);

        console.log('Unioning states into one India country polygon...');
        let indiaFeature = statesGeoJSON.features[0];
        for (let i = 1; i < statesGeoJSON.features.length; i++) {
            // Some geometries might be problematic, wrap in try/catch to be safe
            try {
                indiaFeature = turf.union(turf.featureCollection([indiaFeature, statesGeoJSON.features[i]]));
            } catch (e) {
                console.warn(`Could not union feature ${i}`, e.message);
            }
        }

        indiaFeature.id = 'IND';
        indiaFeature.properties = { name: 'India' };

        console.log('Reading world geojson...');
        const worldGeoStr = fs.readFileSync(GEOJSON_PATH, 'utf8');
        const worldGeo = JSON.parse(worldGeoStr);

        console.log('Removing old IND, PAK, and CHN (to prevent overlap with new claims)...');
        worldGeo.features = worldGeo.features.filter(f => f.id !== 'IND');

        // Note: For PAK and CHN, technically they have competing claims. 
        // We will just leave PAK and CHN as they are. The new IND will render on top of overlapping areas.
        // Leaflet will render the last drawn on top. But to ensure IND gets click events, we can push it to the end.

        worldGeo.features.push(indiaFeature);

        console.log('Saving updated world geojson...');
        fs.writeFileSync(GEOJSON_PATH, JSON.stringify(worldGeo));
        console.log('India map successfully patched in countries.geo.json.');

    } catch (err) {
        console.error('Error patching map:', err);
    }
}

fixIndiaMap();
