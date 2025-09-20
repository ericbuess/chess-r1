#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSaveRestore() {
  console.log('🚀 Testing Save/Restore functionality...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Cookie') || text.includes('save') || text.includes('load') || text.includes('LOAD')) {
      console.log('Browser:', text);
    }
  });

  try {
    console.log('📱 Opening app...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await delay(2000);

    console.log('\n🎮 Making some moves...');
    // Make move E2-E4
    await page.click('[data-row="6"][data-col="4"]');
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]');
    await delay(2000); // Wait for bot

    // Make another move
    await page.click('[data-row="6"][data-col="3"]');
    await delay(500);
    await page.click('[data-row="4"][data-col="3"]');
    await delay(2000);

    // Get current game state
    const movesBefore = await page.$eval('#move-display', el => el.textContent);
    console.log(`\n📊 Moves before refresh: "${movesBefore}"`);

    // Check cookies
    const cookiesBefore = await page.cookies();
    const chessCookies = cookiesBefore.filter(c => c.name.includes('chess'));
    console.log(`\n🍪 Cookies saved: ${chessCookies.length}`);
    chessCookies.forEach(c => {
      console.log(`   - ${c.name}: ${c.value.substring(0, 100)}...`);
    });

    // Refresh page
    console.log('\n🔄 Refreshing page...');
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(2000);

    // Get state after refresh
    const movesAfter = await page.$eval('#move-display', el => el.textContent);
    console.log(`\n📊 Moves after refresh: "${movesAfter}"`);

    // Check if board state restored
    const pieces = await page.$$('.piece');
    console.log(`\n♟️ Pieces on board: ${pieces.length}`);

    // Final verdict
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));

    if (movesAfter.includes('1.') && movesAfter.includes('2.')) {
      console.log('✅ Save/Restore WORKING - Moves were restored!');
      console.log(`   Restored: ${movesAfter}`);
    } else if (movesAfter === movesBefore && movesBefore !== 'Bot (Bayes) • Ready to play') {
      console.log('✅ Save/Restore WORKING - State matches!');
    } else {
      console.log('❌ Save/Restore NOT WORKING');
      console.log(`   Before: ${movesBefore}`);
      console.log(`   After: ${movesAfter}`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(3000);
    await browser.close();
  }
}

testSaveRestore().catch(console.error);