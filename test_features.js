#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testChessApp() {
  console.log('🚀 Starting Chess R1 feature tests...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to R1 dimensions
  await page.setViewport({ width: 240, height: 320 });

  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('[') || msg.text().includes('Cookie') || msg.text().includes('save') || msg.text().includes('load')) {
      console.log('Browser:', msg.text());
    }
  });

  page.on('error', err => {
    console.error('❌ Page error:', err);
  });

  try {
    console.log('📱 Opening app at http://localhost:5187...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await delay(2000);

    // Test 1: Check if game loads
    console.log('\n✅ Test 1: Page loaded successfully');

    // Test 2: Make a move
    console.log('\n🎯 Test 2: Making a move...');
    // Click on E2 square (pawn)
    await page.click('[data-row="6"][data-col="4"]');
    await delay(500);
    // Click on E4 square (destination)
    await page.click('[data-row="4"][data-col="4"]');
    await delay(2000);

    // Check if move was made
    const moveDisplay = await page.$eval('#move-display', el => el.textContent);
    console.log(`   Move display shows: "${moveDisplay}"`);

    // Test 3: Check cookies
    console.log('\n🍪 Test 3: Checking cookies...');
    const cookies = await page.cookies();
    console.log(`   Total cookies: ${cookies.length}`);
    const chessCookies = cookies.filter(c => c.name.includes('chess') || c.name.includes('game') || c.name.includes('mode'));
    console.log(`   Found ${chessCookies.length} game-related cookies`);
    chessCookies.forEach(c => {
      console.log(`   - ${c.name}: ${c.value.substring(0, 50)}...`);
    });

    // Also check document.cookie directly
    const documentCookies = await page.evaluate(() => document.cookie);
    console.log(`   document.cookie: ${documentCookies || 'empty'}`);

    // Test 4: Check localStorage
    console.log('\n💾 Test 4: Checking localStorage...');
    const localStorageData = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('chess')) {
          items[key] = localStorage.getItem(key).substring(0, 100);
        }
      }
      return items;
    });
    console.log('   localStorage:', Object.keys(localStorageData).length > 0 ? localStorageData : 'No chess data found');

    // Test 5: Refresh and check if state persists
    console.log('\n🔄 Test 5: Testing save/restore after refresh...');
    const movesBefore = moveDisplay;
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    const movesAfter = await page.$eval('#move-display', el => el.textContent);
    console.log(`   Before refresh: "${movesBefore}"`);
    console.log(`   After refresh: "${movesAfter}"`);
    console.log(`   ✅ State ${movesBefore === movesAfter ? 'RESTORED' : 'NOT RESTORED'}`);

    // Test 6: Open options menu
    console.log('\n⚙️ Test 6: Testing options menu...');
    await page.keyboard.press('p');
    await delay(1000);

    const menuVisible = await page.$eval('#options-overlay', el => !el.classList.contains('hidden'));
    console.log(`   Options menu: ${menuVisible ? 'VISIBLE' : 'NOT VISIBLE'}`);

    if (menuVisible) {
      // Test 7: Check bot difficulty names
      console.log('\n🤖 Test 7: Checking bot difficulty names...');
      const difficultyLabels = await page.$$eval('.difficulty-option .radio-text', els => els.map(el => el.textContent));
      console.log('   Bot names:', difficultyLabels.join(', '));

      // Test 8: Change color and check button state
      console.log('\n🎨 Test 8: Testing button disable on color change...');

      // Get initial button state
      const backBtnBefore = await page.$eval('#back-btn', el => ({
        disabled: el.disabled,
        text: el.textContent
      }));
      console.log(`   Back button before: "${backBtnBefore.text}" (disabled: ${backBtnBefore.disabled})`);

      // Change color to black
      await page.click('input[name="playerColor"][value="black"]');
      await delay(500);

      const backBtnAfter = await page.$eval('#back-btn', el => ({
        disabled: el.disabled,
        text: el.textContent
      }));
      console.log(`   Back button after: "${backBtnAfter.text}" (disabled: ${backBtnAfter.disabled})`);
      console.log(`   ✅ Button disable: ${backBtnAfter.disabled ? 'WORKING' : 'NOT WORKING'}`);

      // Start new game with black
      console.log('\n♟️ Test 9: Testing bot first move when human is black...');
      await page.click('#new-game-btn');
      await delay(3000);

      // Check if bot made first move
      const moveAfterNewGame = await page.$eval('#move-display', el => el.textContent);
      console.log(`   Move display: "${moveAfterNewGame}"`);
      console.log(`   ✅ Bot first move: ${moveAfterNewGame.includes('1.') ? 'WORKING' : 'NOT WORKING'}`);

      // Test 10: Check for orange spinner
      console.log('\n🔄 Test 10: Checking for bot thinking spinner...');

      // Make a move to trigger bot thinking
      await page.click('[data-row="6"][data-col="4"]'); // Click black pawn
      await delay(500);
      await page.click('[data-row="5"][data-col="4"]'); // Move it
      await delay(100);

      // Check for spinner
      const spinnerExists = await page.$('.bot-thinking-spinner') !== null;
      console.log(`   Orange spinner: ${spinnerExists ? 'FOUND' : 'NOT FOUND'}`);

      if (spinnerExists) {
        const spinnerStyle = await page.$eval('.bot-thinking-spinner', el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            width: computed.width,
            position: computed.position
          };
        });
        console.log('   Spinner style:', spinnerStyle);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    // Evaluate overall status
    const issues = [];
    if (!chessCookies.length && !Object.keys(localStorageData).length) {
      issues.push('❌ No save/restore mechanism working');
    }
    if (movesBefore !== movesAfter) {
      issues.push('❌ State not persisting after refresh');
    }
    if (!menuVisible) {
      issues.push('❌ Options menu not opening');
    }

    if (issues.length === 0) {
      console.log('✅ All basic features appear to be working!');
    } else {
      console.log('Issues found:');
      issues.forEach(issue => console.log('  ' + issue));
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(5000); // Keep browser open for inspection
    await browser.close();
  }
}

// Run tests
testChessApp().catch(console.error);