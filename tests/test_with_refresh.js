#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithRefresh() {
  console.log('🚀 Testing mode switching with refresh (simulates real usage)...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  try {
    console.log('📱 PHASE 1: Create and save a bot game');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    // Create bot game
    await page.click('[data-row="6"][data-col="4"]'); // E2-E4
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]');
    await delay(3000);

    await page.click('[data-row="6"][data-col="3"]'); // D2-D4
    await delay(500);
    await page.click('[data-row="4"][data-col="3"]');
    await delay(3000);

    console.log('Bot game created with moves');

    // REFRESH to ensure game is saved
    console.log('\n📱 PHASE 2: Refresh page (ensures save)');
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    const restoredDisplay = await page.$eval('#move-display', el => el.textContent);
    console.log(`After refresh: "${restoredDisplay}"`);

    // Now switch to human-vs-human
    console.log('\n📱 PHASE 3: Switch to Human vs Human');
    await page.keyboard.press('p');
    await delay(1000);

    await page.$eval('input[value="human-vs-human"]', el => el.click());
    await delay(2000);

    const btnAfterSwitch1 = await page.$eval('#back-btn', btn => ({
      disabled: btn.disabled,
      text: btn.textContent.trim()
    }));
    console.log(`After switch to H-vs-H: "${btnAfterSwitch1.text}" (disabled: ${btnAfterSwitch1.disabled})`);

    // Start new game in human mode
    await page.click('#new-game-btn');
    await delay(1000);

    // Make a move
    await page.click('[data-row="6"][data-col="0"]'); // A2-A3
    await delay(500);
    await page.click('[data-row="5"][data-col="0"]');
    await delay(1000);

    // Switch back to bot
    console.log('\n📱 PHASE 4: Switch back to Human vs Bot');
    await page.keyboard.press('p');
    await delay(1000);

    await page.$eval('input[value="human-vs-bot"]', el => el.click());
    await delay(2000);

    // THE KEY TEST
    const finalBtn = await page.$eval('#back-btn', btn => ({
      disabled: btn.disabled,
      text: btn.textContent.trim()
    }));

    const finalDisplay = await page.$eval('#move-display', el => el.textContent);
    const pieceCount = await page.$$eval('.piece', pieces => pieces.length);

    // Check localStorage directly
    const storageCheck = await page.evaluate(() => {
      const botState = localStorage.getItem('chess_game_state_human_vs_bot');
      if (botState) {
        const parsed = JSON.parse(botState);
        return {
          exists: true,
          moves: parsed.moveHistory?.length || 0,
          states: parsed.stateHistory?.length || 0
        };
      }
      return { exists: false };
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    console.log(`Button: "${finalBtn.text}" (disabled: ${finalBtn.disabled})`);
    console.log(`Display: "${finalDisplay}"`);
    console.log(`Pieces: ${pieceCount}`);
    console.log(`Storage: ${JSON.stringify(storageCheck)}`);
    console.log('');

    if (!finalBtn.disabled && finalDisplay.includes('.')) {
      console.log('✅ PERFECT: Bot game restored AND button enabled!');
    } else if (finalBtn.disabled && finalDisplay.includes('.')) {
      console.log('❌ USER\'S BUG: Bot game restored but button disabled');
    } else {
      console.log('❓ Different issue - game not restored at all');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await delay(5000);
    await browser.close();
  }
}

testWithRefresh().catch(console.error);