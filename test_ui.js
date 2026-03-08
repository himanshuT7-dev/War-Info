const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
      console.log('Navigating to UI...');
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 4000));
      
      console.log('Clicking the "ALL" global region...');
      // Click the 'ALL' button (globe icon). We can identify it by its label or structure.
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const allBtn = btns.find(b => b.textContent.includes('ALL'));
          if(allBtn) allBtn.click();
      });
      await new Promise(r => setTimeout(r, 4000));

      console.log('Scrolling the left sidebar to the bottom to reveal Tensions...');
      await page.evaluate(() => {
          // Find the scrollable container in the left sidebar
          const sidebar = document.querySelector('.w-80.border-r');
          if (sidebar) sidebar.scrollTop = sidebar.scrollHeight;
      });
      
      await new Promise(r => setTimeout(r, 1000));
      
      console.log('Taking full screen screenshot with Tensions visible...');
      await page.screenshot({ path: path.join(screenshotsDir, 'map_full_screen.png') });
      
      console.log('Clicking specifically on the United States coordinates...');
      // The map coordinates can be clicked via Leaflet API
      await page.evaluate(() => {
          // Try to click near USA context center
          const mapEl = document.querySelector('.leaflet-container');
          if (mapEl) {
              const bounds = mapEl.getBoundingClientRect();
              const clickEvent = new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: bounds.left + bounds.width * 0.25, // approx longitude of USA
                  clientY: bounds.top + bounds.height * 0.35 // approx latitude of USA
              });
              mapEl.dispatchEvent(clickEvent);
          }
      });
      
      await new Promise(r => setTimeout(r, 4000));
      await page.screenshot({ path: path.join(screenshotsDir, 'map_click_popup.png') });

  } catch (err) {
      console.error('Test script error:', err);
  } finally {
      await browser.close();
  }
})();
