const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Chess R1 bot test...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 240, height: 320 },
    args: ['--window-size=240,320']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('error') || text.includes('BOT')) {
      console.log('[CONSOLE]', msg.type().toUpperCase(), text);
    }
  });

  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  console.log('Navigating to http://localhost:5187/');
  await page.goto('http://localhost:5187/', { waitUntil: 'networkidle2' });

  // Wait for game to load
  await new Promise(r => setTimeout(r, 1000));

  console.log('Starting new game...');
  // Click options button (P key)
  await page.keyboard.press('p');
  await new Promise(r => setTimeout(r, 500));

  // Click new game button
  const newGameBtn = await page.$('#new-game-btn');
  if (newGameBtn) {
    await newGameBtn.click();
    console.log('Clicked new game button');
    await new Promise(r => setTimeout(r, 500));
  }

  // Confirm new game
  const confirmBtn = await page.$('#confirm-yes-btn');
  if (confirmBtn) {
    await confirmBtn.click();
    console.log('Confirmed new game');
    await new Promise(r => setTimeout(r, 500));
  }

  // Close options menu
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  console.log('Making a move...');
  // Make a move (E2 to E4)
  const e2Square = await page.$('[data-row="6"][data-col="4"]');
  if (e2Square) {
    await e2Square.click();
    console.log('Selected E2');
    await new Promise(r => setTimeout(r, 300));
  }

  const e4Square = await page.$('[data-row="4"][data-col="4"]');
  if (e4Square) {
    await e4Square.click();
    console.log('Moved to E4');
  }

  // Wait to see bot response
  console.log('Waiting for bot response...');
  await new Promise(r => setTimeout(r, 5000));

  // Check for error notifications
  const notification = await page.$eval('.notification', el => el ? el.textContent : null).catch(() => null);
  if (notification) {
    console.log('NOTIFICATION:', notification);
  }

  // Take a screenshot
  await page.screenshot({ path: 'bot-test.png' });
  console.log('Screenshot saved as bot-test.png');

  // Keep browser open for inspection
  console.log('\n=== TEST COMPLETE ===');
  console.log('Check the browser window and console for any errors');
  console.log('Press Ctrl+C to close when done inspecting');

  // Keep the script running
  await new Promise(() => {});
})();