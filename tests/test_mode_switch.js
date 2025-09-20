#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testModeSwitch() {
  console.log('🚀 Testing mode switching with existing games...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('MODE SWITCH') || text.includes('MENU UPDATE') || text.includes('moveHistory') || text.includes('stateHistory')) {
      console.log('Browser:', text);
    }
  });

  try {
    console.log('📱 Opening app...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await delay(2000);

    // STEP 1: Start a game in human-vs-bot mode
    console.log('\n=== STEP 1: Start game in Human vs Bot ===');

    // Make some moves
    console.log('Making moves in bot mode...');
    await page.click('[data-row="6"][data-col="4"]'); // E2
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]'); // E4
    await delay(2500); // Wait for bot

    await page.click('[data-row="6"][data-col="3"]'); // D2
    await delay(500);
    await page.click('[data-row="4"][data-col="3"]'); // D4
    await delay(2500); // Wait for bot

    // STEP 2: Switch to human-vs-human mode
    console.log('\n=== STEP 2: Switch to Human vs Human ===');

    await page.keyboard.press('p'); // Open menu
    await delay(1000);

    const humanVsHumanRadio = await page.$('input[value="human-vs-human"]');
    await humanVsHumanRadio.click();
    await delay(500);

    // Check button state
    const backBtn1 = await page.$eval('#back-btn', btn => ({
      disabled: btn.disabled,
      text: btn.textContent
    }));
    console.log(`After switch to Human-vs-Human: "${backBtn1.text}" (disabled: ${backBtn1.disabled})`);

    if (backBtn1.disabled) {
      console.log('Starting new game in human-vs-human...');
      await page.click('#new-game-btn');
      await delay(1000);
    } else {
      console.log('Going back to existing game...');
      await page.click('#back-btn');
      await delay(1000);
    }

    // Make moves in human-vs-human
    console.log('\nMaking moves in human-vs-human mode...');
    await page.click('[data-row="6"][data-col="0"]'); // A2
    await delay(500);
    await page.click('[data-row="5"][data-col="0"]'); // A3
    await delay(500);

    await page.click('[data-row="1"][data-col="1"]'); // B7
    await delay(500);
    await page.click('[data-row="2"][data-col="1"]'); // B6
    await delay(500);

    // STEP 3: Switch back to human-vs-bot mode
    console.log('\n=== STEP 3: Switch back to Human vs Bot ===');

    await page.keyboard.press('p'); // Open menu
    await delay(1000);

    const humanVsBotRadio = await page.$('input[value="human-vs-bot"]');
    await humanVsBotRadio.click();
    await delay(500);

    // Check button state - THIS IS THE KEY TEST
    const backBtn2 = await page.$eval('#back-btn', btn => ({
      disabled: btn.disabled,
      text: btn.textContent
    }));
    console.log(`After switch back to Human-vs-Bot: "${backBtn2.text}" (disabled: ${backBtn2.disabled})`);

    // Check the board state
    const moveDisplay = await page.$eval('#move-display', el => el.textContent);
    console.log(`Move display shows: "${moveDisplay}"`);

    // Get piece count to verify game was restored
    const pieceCount = await page.$$eval('.piece', pieces => pieces.length);
    console.log(`Pieces on board: ${pieceCount}`);

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));

    if (!backBtn2.disabled && pieceCount !== 32) {
      console.log('✅ SUCCESS: Bot game restored and "Back to game" button enabled!');
      console.log('   - Button correctly shows game can be resumed');
      console.log('   - Board shows previous bot game position');
    } else if (!backBtn2.disabled && pieceCount === 32) {
      console.log('⚠️  PARTIAL: Button enabled but board shows starting position');
      console.log('   - Button logic fixed but game state may not be restored');
    } else if (backBtn2.disabled && pieceCount !== 32) {
      console.log('❌ ISSUE: Bot game restored but button incorrectly disabled');
      console.log('   - This is the bug the user reported');
      console.log('   - Board shows game position but button says "no moves"');
    } else {
      console.log('❌ FAILED: Neither game restored nor button enabled');
      console.log('   - Both issues present');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(3000);
    await browser.close();
  }
}

testModeSwitch().catch(console.error);