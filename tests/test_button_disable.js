#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testButtonDisable() {
  console.log('🚀 Testing button disable functionality...\n');

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
    if (text.includes('MENU UPDATE') || text.includes('colorChanged') || text.includes('originalHuman')) {
      console.log('Browser:', text);
    }
  });

  try {
    console.log('📱 Opening app...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await delay(2000);

    console.log('\n🎯 Test 1: Button disable with no moves made');
    console.log('   Opening menu without any moves...');
    await page.keyboard.press('p');
    await delay(1000);

    let backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   Initial button state: "${backBtn.text}" (disabled: ${backBtn.disabled})`);

    console.log('   Changing color to black...');
    await page.click('input[name="playerColor"][value="black"]');
    await delay(500);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   After color change (no moves): "${backBtn.text}" (disabled: ${backBtn.disabled})`);
    console.log(`   Expected: disabled=false (no moves made yet)`);
    console.log(`   Result: ${backBtn.disabled === false ? '✅ CORRECT' : '❌ WRONG'}`);

    // Close menu
    await page.keyboard.press('Escape');
    await delay(500);

    console.log('\n🎯 Test 2: Button disable WITH moves made');
    console.log('   Making a move first...');

    // Make a move
    await page.click('[data-row="6"][data-col="4"]'); // E2
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]'); // E4
    await delay(2000); // Wait for bot

    console.log('   Opening menu after making moves...');
    await page.keyboard.press('p');
    await delay(1000);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   Initial button state: "${backBtn.text}" (disabled: ${backBtn.disabled})`);

    console.log('   Changing color to black...');
    await page.click('input[name="playerColor"][value="black"]');
    await delay(500);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent,
      className: el.className
    }));
    console.log(`   After color change (with moves): "${backBtn.text}"`);
    console.log(`   Disabled: ${backBtn.disabled}, Class: ${backBtn.className}`);
    console.log(`   Expected: disabled=true, text includes "color changed"`);
    console.log(`   Result: ${backBtn.disabled && backBtn.text.toLowerCase().includes('color') ? '✅ WORKING' : '❌ NOT WORKING'}`);

    // Test difficulty change
    console.log('\n   Changing back to white...');
    await page.click('input[name="playerColor"][value="white"]');
    await delay(500);

    console.log('   Changing difficulty...');
    await page.click('input[name="botDifficulty"][value="1"]');
    await delay(500);

    backBtn = await page.$eval('#back-btn', el => ({
      disabled: el.disabled,
      text: el.textContent
    }));
    console.log(`   After difficulty change: "${backBtn.text}"`);
    console.log(`   Disabled: ${backBtn.disabled}`);
    console.log(`   Expected: disabled=true, text includes "difficulty changed"`);
    console.log(`   Result: ${backBtn.disabled && backBtn.text.toLowerCase().includes('difficulty') ? '✅ WORKING' : '❌ NOT WORKING'}`);

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(3000);
    await browser.close();
  }
}

testButtonDisable().catch(console.error);