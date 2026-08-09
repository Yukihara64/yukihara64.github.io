const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a nice desktop size
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Navigate to Vite dev server
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait a moment for any CSS animations to settle
  await new Promise(r => setTimeout(r, 2000));
  
  // Save screenshot in the artifacts directory so I can embed it
  const screenshotPath = "C:\\Users\\Tsukihara Yuki\\.gemini\\antigravity\\brain\\91578fc3-423d-46da-a91b-2d940f2a8023\\screenshot.jpg";
  await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 90 });
  
  await browser.close();
  console.log(`Screenshot saved to ${screenshotPath}`);
})();
