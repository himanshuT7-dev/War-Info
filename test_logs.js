const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  
  try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 4000));
  } catch (err) {
      console.error('Script Error:', err.message);
  } finally {
      await browser.close();
  }
})();
