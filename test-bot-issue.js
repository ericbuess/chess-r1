// Test script to reproduce the "bot move failed" issue
// Run this in the browser console after the page loads

async function testBotIssue() {
  console.log('=== STARTING BOT ISSUE TEST ===');

  // Wait for game to be ready
  await new Promise(r => setTimeout(r, 1000));

  console.log('Step 1: Making a move (D2-D4)');
  // Simulate clicking D2
  document.querySelector('[data-row="6"][data-col="3"]').click();
  await new Promise(r => setTimeout(r, 500));

  // Simulate clicking D4
  document.querySelector('[data-row="4"][data-col="3"]').click();
  await new Promise(r => setTimeout(r, 500));

  console.log('Step 2: Bot should start thinking...');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Step 3: Press undo to cancel bot thinking');
  // Simulate pressing left arrow (undo)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

  await new Promise(r => setTimeout(r, 1000));

  console.log('Step 4: Make another move (F2-F4)');
  // Simulate clicking F2
  document.querySelector('[data-row="6"][data-col="5"]').click();
  await new Promise(r => setTimeout(r, 500));

  // Simulate clicking F4
  document.querySelector('[data-row="4"][data-col="5"]').click();

  console.log('Step 5: Check if bot moves or shows error');
  console.log('=== TEST COMPLETE - CHECK CONSOLE FOR ERRORS ===');
}

// Instructions for manual testing:
console.log(`
MANUAL TEST STEPS:
1. Move a piece (e.g., D2-D4)
2. While bot is thinking, press Left Arrow to undo
3. Move again (e.g., F2-F4)
4. Watch if bot fails with "bot move failed your turn"

Or run: testBotIssue() to automate the test
`);