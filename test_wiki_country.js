const axios = require('axios');

async function testCountry(countryName) {
    console.log(`Testing bio for ${countryName}`);
    try {
        const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`);
        console.log("Bio extract:", res.data.extract.substring(0, 100));
    } catch(e) {
        console.error("Bio Error:", e.message);
    }
    
    console.log(`Testing war history for ${countryName}`);
    try {
        const res = await axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
                action: 'query', list: 'search', srsearch: `List of wars involving ${countryName}`,
                srlimit: 1, format: 'json'
            }
        });
        console.log("History hit:", res.data.query.search[0]?.title);
    } catch(e) {
        console.error("History Error:", e.message);
    }
}
testCountry('United States');
