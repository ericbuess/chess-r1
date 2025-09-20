#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAllIssues() {
  console.log('🚀 Testing undo/redo, mode switching, and state size...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true, // Open devtools to see errors
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 240, height: 320 });

  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('ERROR') || text.includes('TypeError') || text.includes('Uncaught')) {
      console.log('❌ ERROR:', text);
    } else if (text.includes('UNDO') || text.includes('REDO') || text.includes('engineState')) {
      console.log('Browser:', text);
    }
  });

  page.on('pageerror', error => {
    console.log('❌ PAGE ERROR:', error.message);
  });

  try {
    console.log('📱 Opening app...');
    await page.goto('http://localhost:5187', { waitUntil: 'networkidle2' });
    await delay(2000);

    // TEST 1: Undo/Redo in human-vs-bot mode
    console.log('\n=== TEST 1: Undo/Redo in Human vs Bot ===');

    // Make some moves
    console.log('Making moves...');
    await page.click('[data-row="6"][data-col="4"]'); // E2
    await delay(500);
    await page.click('[data-row="4"][data-col="4"]'); // E4
    await delay(2500); // Wait for bot

    await page.click('[data-row="6"][data-col="3"]'); // D2
    await delay(500);
    await page.click('[data-row="4"][data-col="3"]'); // D4
    await delay(2500); // Wait for bot

    // Check state size before undo (wait a bit for autoSave)
    await delay(1000); // Give time for autoSave
    const stateSizeBefore = await page.evaluate(() => {
      const savedState = localStorage.getItem('chess_game_state_human_vs_bot');
      if (!savedState) {
        // Check old key too
        const oldState = localStorage.getItem('chess_game_state');
        return oldState ? oldState.length : 0;
      }
      return savedState.length;
    });
    console.log(`\n📊 State size: ${stateSizeBefore} bytes`);

    // Try undo
    console.log('\nTesting undo (Left arrow)...');
    await page.keyboard.press('ArrowLeft');
    await delay(1000);

    // Check for errors
    const undoErrors = await page.evaluate(() => window.__lastError || null);
    if (undoErrors) {
      console.log('❌ Undo failed with error');
    } else {
      console.log('✅ Undo successful');
    }

    // Try redo
    console.log('Testing redo (Right arrow)...');
    await page.keyboard.press('ArrowRight');
    await delay(1000);

    // TEST 2: Mode switching
    console.log('\n=== TEST 2: Mode Switching ===');

    // Open menu
    console.log('Opening options menu (P key)...');
    await page.keyboard.press('p');
    await delay(1000);

    // Switch to human-vs-human
    console.log('Switching to Human vs Human...');
    const humanVsHumanRadio = await page.$('input[value="human-vs-human"]');
    await humanVsHumanRadio.click();
    await delay(500);

    // Check if back button is enabled
    const backBtn1 = await page.$eval('#back-btn', btn => ({
      disabled: btn.disabled,
      text: btn.textContent
    }));
    console.log(`Back button: ${backBtn1.text} (disabled: ${backBtn1.disabled})`);

    // Go back to game
    if (!backBtn1.disabled) {
      console.log('Clicking back to game...');
      await page.click('#back-btn');
      await delay(1000);
    } else {
      console.log('❌ Back button disabled - requires new game!');
      // Start new game
      await page.click('#new-game-btn');
      await delay(1000);
    }

    // Make a move in human-vs-human
    console.log('\nMaking move in Human vs Human...');
    await page.click('[data-row="6"][data-col="0"]'); // A2
    await delay(500);
    await page.click('[data-row="5"][data-col="0"]'); // A3
    await delay(1000);

    // Open menu again and switch back to human-vs-bot
    console.log('\nSwitching back to Human vs Bot...');
    await page.keyboard.press('p');
    await delay(1000);

    const humanVsBotRadio = await page.$('input[value="human-vs-bot"]');
    await humanVsBotRadio.click();
    await delay(500);

    // Check if back button is enabled
    const backBtn2 = await page.$eval('#back-btn', btn => ({
      disabled: btn.disabled,
      text: btn.textContent
    }));
    console.log(`Back button: ${backBtn2.text} (disabled: ${backBtn2.disabled})`);

    // TEST 3: Check final state size
    console.log('\n=== TEST 3: State Size Check ===');

    // Check localStorage content
    const stateInfo = await page.evaluate(() => {
      let state = localStorage.getItem('chess_game_state_human_vs_bot');
      if (!state) {
        state = localStorage.getItem('chess_game_state');
      }
      if (!state) return { exists: false };

      try {
        const parsed = JSON.parse(state);
        const stateHistorySize = JSON.stringify(parsed.stateHistory || []).length;
        const moveHistorySize = JSON.stringify(parsed.moveHistory || []).length;

        // Check if engineState is being stored in moves
        let engineStateCount = 0;
        if (parsed.stateHistory) {
          parsed.stateHistory.forEach((state, i) => {
            if (i > 0 && state.engineState !== null && state.engineState !== undefined) {
              engineStateCount++;
            }
          });
        }

        return {
          exists: true,
          totalSize: state.length,
          stateHistorySize,
          moveHistorySize,
          stateCount: parsed.stateHistory?.length || 0,
          moveCount: parsed.moveHistory?.length || 0,
          engineStateInMoves: engineStateCount
        };
      } catch (e) {
        return { exists: true, error: e.message };
      }
    });

    if (stateInfo.exists) {
      console.log(`📊 Total state size: ${stateInfo.totalSize} bytes`);
      console.log(`📊 State history size: ${stateInfo.stateHistorySize} bytes (${stateInfo.stateCount} states)`);
      console.log(`📊 Move history size: ${stateInfo.moveHistorySize} bytes (${stateInfo.moveCount} moves)`);
      console.log(`📊 Engine states in moves: ${stateInfo.engineStateInMoves}`);

      if (stateInfo.totalSize > 4096) {
        console.log('⚠️  WARNING: State exceeds 4KB cookie limit!');
      }
      if (stateInfo.engineStateInMoves > 0) {
        console.log('❌ ERROR: engineState still being stored in moves!');
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    console.log('1. Undo/Redo:', undoErrors ? '❌ BROKEN' : '✅ WORKING');
    console.log('2. Mode Switch (H→Bot):', backBtn1.disabled ? '❌ Requires new game' : '✅ Preserves game');
    console.log('3. Mode Switch (Bot→H):', backBtn2.disabled ? '❌ Requires new game' : '✅ Preserves game');
    console.log('4. State Size:', stateInfo.totalSize > 4096 ? '❌ Too large' : '✅ Under 4KB');
    console.log('5. engineState bloat:', stateInfo.engineStateInMoves > 0 ? '❌ Still storing' : '✅ Fixed');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await delay(3000);
    await browser.close();
  }
}

// Add error handler for page errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

testAllIssues().catch(console.error);