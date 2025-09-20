#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testModeSwitchFixed() {
  console.log('🚀 Testing mode switching with proper game setup...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false, // Less noise
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  // Only log critical messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[MODE SWITCH]') && (text.includes('Found in localStorage') || text.includes('Not found'))) {
      console.log('Browser:', text);
    }
  });

  try {
    console.log('📱 Opening app and clearing storage...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    // STEP 1: Create a bot game
    console.log('\n=== STEP 1: Create Human vs Bot game ===');
    console.log('Making moves...');
    await page.click('[data-row="6"][data-col="4"]'); // E2
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]'); // E4
    await delay(3000); // Wait for bot and autoSave

    await page.click('[data-row="6"][data-col="3"]'); // D2
    await delay(500);
    await page.click('[data-row="4"][data-col="3"]'); // D4
    await delay(3000); // Wait for bot and autoSave

    // STEP 2: Switch to human-vs-human and create a game there too
    console.log('\n=== STEP 2: Switch to Human vs Human ===');
    await page.keyboard.press('p');
    await delay(1000);

    await page.$eval('input[value="human-vs-human"]', el => el.click());
    await delay(2000); // Wait for save

    // Start new game in human-vs-human
    await page.click('#new-game-btn');
    await delay(1000);

    console.log('Making human-vs-human moves...');
    await page.click('[data-row="6"][data-col="0"]'); // A2
    await delay(500);
    await page.click('[data-row="5"][data-col="0"]'); // A3
    await delay(500);

    await page.click('[data-row="1"][data-col="0"]'); // A7
    await delay(500);
    await page.click('[data-row="2"][data-col="0"]'); // A6
    await delay(2000); // Wait for autoSave

    // STEP 3: Now switch back to bot mode - THIS IS THE KEY TEST
    console.log('\n=== STEP 3: Switch back to Human vs Bot (should restore game) ===');
    await page.keyboard.press('p');
    await delay(1000);

    await page.$eval('input[value="human-vs-bot"]', el => el.click());
    await delay(2000);

    // Check button state
    const backBtn = await page.$eval('#back-btn', btn => ({
      disabled: btn.disabled,
      text: btn.textContent.trim()
    }));

    // Check board state
    const pieceCount = await page.$$eval('.piece', pieces => pieces.length);
    const moveDisplay = await page.$eval('#move-display', el => el.textContent);

    // Final verdict
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Button text: "${backBtn.text}"`);
    console.log(`Button disabled: ${backBtn.disabled}`);
    console.log(`Pieces on board: ${pieceCount}`);
    console.log(`Move display: "${moveDisplay}"`);
    console.log('');

    if (!backBtn.disabled && pieceCount < 32) {
      console.log('✅ SUCCESS! Mode switching works correctly:');
      console.log('   - Bot game was restored');
      console.log('   - "Back to game" button is enabled');
      console.log('   - User can continue their bot game');
    } else if (backBtn.disabled && pieceCount < 32) {
      console.log('❌ BUG CONFIRMED: Game restored but button incorrectly disabled');
      console.log('   - This is the issue the user reported');
    } else {
      console.log('❌ FAILED: Game not restored properly');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(5000);
    await browser.close();
  }
}

testModeSwitchFixed().catch(console.error);