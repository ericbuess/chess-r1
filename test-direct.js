const puppeteer = require('puppeteer');

async function testDirect() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    page.on('console', msg => {
      console.log('Browser:', msg.text());
    });

    // Navigate directly to the dist folder
    const url = `file://${process.cwd()}/app/dist/index.html`;
    console.log('Loading:', url);

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Wait for script to load
    await page.waitForTimeout(2000);

    // Check window.jsChessEngine
    const result = await page.evaluate(() => {
      const checks = [];

      // Check 1: Is window.jsChessEngine defined?
      if (typeof window.jsChessEngine !== 'undefined') {
        checks.push('✅ window.jsChessEngine is defined');

        // Check 2: Can we create a game?
        try {
          const game = new window.jsChessEngine.Game();
          checks.push('✅ new window.jsChessEngine.Game() works');

          // Check 3: Can we make a move?
          try {
            game.move('E2', 'E4');
            checks.push('✅ game.move() works');
          } catch (e) {
            checks.push('❌ game.move() failed: ' + e.message);
          }
        } catch (e) {
          checks.push('❌ new window.jsChessEngine.Game() failed: ' + e.message);
        }
      } else {
        checks.push('❌ window.jsChessEngine is NOT defined');

        // Check what IS defined
        if (typeof jsChessEngine !== 'undefined') {
          checks.push('⚠️  jsChessEngine exists (not on window)');
        }
        if (typeof window.ke !== 'undefined') {
          checks.push('⚠️  window.ke exists (minified name?)');
        }
      }

      return checks;
    });

    result.forEach(check => console.log(check));

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testDirect();