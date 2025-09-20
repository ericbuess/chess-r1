#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function debugStorage() {
  console.log('🔍 Debugging storage during mode switch...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  try {
    console.log('📱 Opening app...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await delay(2000);

    // Clear storage first
    await page.evaluate(() => localStorage.clear());
    console.log('Cleared localStorage\n');

    // Make moves in bot mode
    console.log('Making moves in Human vs Bot...');
    await page.click('[data-row="6"][data-col="4"]'); // E2
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]'); // E4
    await delay(3000); // Wait for bot and autoSave

    // Check what's in storage
    const storageAfterMoves = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const storage = {};
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          storage[key] = {
            size: value.length,
            moveHistory: parsed.moveHistory?.length || 0,
            stateHistory: parsed.stateHistory?.length || 0
          };
        } catch {
          storage[key] = { size: value.length, raw: value.substring(0, 100) };
        }
      });
      return storage;
    });

    console.log('\n📦 Storage after bot moves:');
    console.log(JSON.stringify(storageAfterMoves, null, 2));

    // Open menu and switch mode
    console.log('\n🔄 Switching to Human vs Human...');
    await page.keyboard.press('p');
    await delay(1000);

    const humanVsHumanRadio = await page.$('input[value="human-vs-human"]');
    await humanVsHumanRadio.click();
    await delay(2000); // Give time for autoSave

    // Check storage after switch
    const storageAfterSwitch = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const storage = {};
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          storage[key] = {
            size: value.length,
            moveHistory: parsed.moveHistory?.length || 0,
            stateHistory: parsed.stateHistory?.length || 0,
            gameMode: parsed.gameMode
          };
        } catch {
          storage[key] = { size: value.length, raw: value.substring(0, 100) };
        }
      });
      return storage;
    });

    console.log('\n📦 Storage after switch to Human vs Human:');
    console.log(JSON.stringify(storageAfterSwitch, null, 2));

    // Now switch back
    await delay(1000);
    console.log('\n🔄 Switching back to Human vs Bot...');
    const humanVsBotRadio = await page.$('input[value="human-vs-bot"]');
    await humanVsBotRadio.click();
    await delay(2000);

    // Final storage check
    const finalStorage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const storage = {};
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        try {
          const parsed = JSON.parse(value);
          storage[key] = {
            size: value.length,
            moveHistory: parsed.moveHistory?.length || 0,
            stateHistory: parsed.stateHistory?.length || 0,
            gameMode: parsed.gameMode
          };
        } catch {
          storage[key] = { size: value.length, raw: value.substring(0, 100) };
        }
      });
      return storage;
    });

    console.log('\n📦 Final storage state:');
    console.log(JSON.stringify(finalStorage, null, 2));

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(3000);
    await browser.close();
  }
}

debugStorage().catch(console.error);