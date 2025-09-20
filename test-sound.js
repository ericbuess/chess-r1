const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Chess R1 sound test...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 240, height: 320 },
    args: ['--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[vite]')) {
      console.log('Browser console:', text);
    }
  });

  // Listen for errors
  page.on('error', err => {
    console.error('Page error:', err);
  });

  page.on('pageerror', err => {
    console.error('Page error:', err);
  });

  await page.goto('http://localhost:5187');

  console.log('Page loaded. Testing sound initialization...');

  // Wait for game to load - use ID instead of class
  await page.waitForSelector('#board', { timeout: 5000 });

  // Click to initialize audio context
  await page.click('#board');
  console.log('Clicked board to initialize audio');

  // Make a move to trigger sound
  await page.evaluate(() => {
    // Click E2 pawn
    const squares = document.querySelectorAll('.square');
    squares[52].click(); // E2
  });

  await page.waitForTimeout(500);

  await page.evaluate(() => {
    // Click E4
    const squares = document.querySelectorAll('.square');
    squares[28].click(); // E4
  });

  console.log('Made move E2-E4 - sound should play');

  // Check if audio context was created
  const audioStatus = await page.evaluate(() => {
    return {
      hasAudioContext: typeof window.audioContext !== 'undefined',
      audioState: window.audioContext ? window.audioContext.state : 'no context',
      hasSoundData: window.game ? (window.game.soundSystem ? 'sound system exists' : 'no sound system') : 'no game object'
    };
  });

  console.log('Audio status:', audioStatus);

  // Keep browser open for manual testing
  console.log('\nBrowser will stay open. Make moves to test sound.');
  console.log('Press Ctrl+C to exit.');
})();