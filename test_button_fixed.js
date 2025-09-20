#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testButtonFixed() {
  console.log('🚀 Testing button disable functionality (fixed version)...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  try {
    console.log('📱 Opening app...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await delay(2000);

    console.log('\n🎯 Test: Button states with moves made');
    console.log('   Making a move first...');

    // Make a move
    await page.click('[data-row="6"][data-col="4"]'); // E2
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]'); // E4
    await delay(2000); // Wait for bot

    console.log('   Opening menu after making moves...');
    await page.keyboard.press('p');
    await delay(1000);

    let backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   Initial: "${backBtn.text}" (disabled: ${backBtn.disabled})`);

    console.log('   Changing color to black...');
    await page.click('input[name="playerColor"][value="black"]');
    await delay(500);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   After color change: "${backBtn.text}" (disabled: ${backBtn.disabled})`);
    const colorChangeWorks = backBtn.disabled && backBtn.text.toLowerCase().includes('color');
    console.log(`   ✅ Color change disable: ${colorChangeWorks ? 'WORKING' : 'NOT WORKING'}`);

    // Change back to white
    console.log('\n   Resetting to white...');
    await page.click('input[name="playerColor"][value="white"]');
    await delay(500);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   After reset: "${backBtn.text}" (disabled: ${backBtn.disabled})`);

    // Test difficulty change
    console.log('\n   Changing difficulty to Easy...');
    await page.click('input[name="botDifficulty"][value="1"]');
    await delay(500);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   After difficulty change: "${backBtn.text}" (disabled: ${backBtn.disabled})`);
    const difficultyChangeWorks = backBtn.disabled && backBtn.text.toLowerCase().includes('difficulty');
    console.log(`   ✅ Difficulty change disable: ${difficultyChangeWorks ? 'WORKING' : 'NOT WORKING'}`);

    // Test both changes
    console.log('\n   Changing BOTH color and difficulty...');
    await page.click('input[name="playerColor"][value="black"]');
    await delay(500);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   After both changes: "${backBtn.text}" (disabled: ${backBtn.disabled})`);
    const bothChangeWorks = backBtn.disabled && backBtn.text.toLowerCase().includes('settings');
    console.log(`   ✅ Both changes disable: ${bothChangeWorks ? 'WORKING' : 'NOT WORKING'}`);

    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(60));
    console.log(`Color change tracking: ${colorChangeWorks ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`Difficulty change tracking: ${difficultyChangeWorks ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`Both changes tracking: ${bothChangeWorks ? '✅ WORKING' : '❌ NOT WORKING'}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(3000);
    await browser.close();
  }
}

testButtonFixed().catch(console.error);