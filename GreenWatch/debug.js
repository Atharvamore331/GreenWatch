const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE_ERROR:', error.message);
  });

  console.log('Navigating to Map page...');
  try {
    await page.goto('http://localhost:5173/map', { waitUntil: 'networkidle2' });
  } catch (err) {
    console.log('Navigation error:', err.message);
  }

  await browser.close();
})();
