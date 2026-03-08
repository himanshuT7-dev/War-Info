const axios = require('axios');

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function testTensions() {
    const queries = ['territorial dispute 2024 2025', 'geopolitical tension 2024 2025'];
    for (const query of queries) {
        console.log(`Querying: ${query}`);
        try {
            const res = await axios.get(WIKI_API, {
                params: {
                    action: 'query', list: 'search', srsearch: query,
                    srnamespace: 0, srlimit: 3, format: 'json', origin: '*'
                }
            });
            console.log(JSON.stringify(res.data.query.search.map(s => s.title)));
        } catch (e) {
            console.error(e.message);
        }
    }
}
testTensions();
