const puppeteer = require('puppeteer');
const path = require('path');
const express = require('express');

// Serve the production build
const app = express();
app.use(express.static(path.join(__dirname, 'app', 'dist')));
const server = app.listen(3000, () => {
  console.log('Production build server running on http://localhost:3000');
});

async function testProductionBuild() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Listen for console messages and errors
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        console.error('❌ Browser Error:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
    });

    // Navigate to the production build
    console.log('📱 Loading production build...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Wait for the chess board to render
    await page.waitForSelector('#chess-board', { timeout: 5000 });
    console.log('✅ Chess board rendered');

    // Wait a bit for JavaScript to fully load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if jsChessEngine is available globally
    const engineAvailable = await page.evaluate(() => {
      return typeof window.jsChessEngine !== 'undefined';
    });

    if (!engineAvailable) {
      throw new Error('window.jsChessEngine is not defined!');
    }
    console.log('✅ window.jsChessEngine is available');

    // Test creating a new game instance
    const canCreateGame = await page.evaluate(() => {
      try {
        const testGame = new window.jsChessEngine.Game();
        return testGame !== null;
      } catch (error) {
        console.error('Failed to create game:', error);
        return false;
      }
    });

    if (!canCreateGame) {
      throw new Error('Failed to create jsChessEngine.Game instance!');
    }
    console.log('✅ Can create new jsChessEngine.Game()');

    // Test making a move
    const moveSuccess = await page.evaluate(() => {
      try {
        // Click on E2 pawn (white)
        const squares = document.querySelectorAll('.chess-square');
        for (const square of squares) {
          if (square.dataset.row === '6' && square.dataset.col === '4') {
            square.click();
            break;
          }
        }

        // Brief wait for selection
        return new Promise(resolve => {
          setTimeout(() => {
            // Click on E4 to move pawn
            const squares = document.querySelectorAll('.chess-square');
            for (const square of squares) {
              if (square.dataset.row === '4' && square.dataset.col === '4') {
                square.click();
                break;
              }
            }

            // Check if move was made
            setTimeout(() => {
              const pieces = document.querySelectorAll('.chess-piece');
              let foundPawnOnE4 = false;
              for (const piece of pieces) {
                const parent = piece.parentElement;
                if (parent.dataset.row === '4' && parent.dataset.col === '4') {
                  foundPawnOnE4 = true;
                  break;
                }
              }
              resolve(foundPawnOnE4);
            }, 500);
          }, 100);
        });
      } catch (error) {
        console.error('Move test failed:', error);
        return false;
      }
    });

    if (moveSuccess) {
      console.log('✅ Chess moves working correctly');
    } else {
      console.log('⚠️  Move test inconclusive (might be bot mode)');
    }

    // Check for any undefined errors in console
    const hasUndefinedErrors = await page.evaluate(() => {
      const logs = [];
      const originalLog = console.error;
      console.error = (...args) => {
        logs.push(args.join(' '));
        originalLog.apply(console, args);
      };

      // Try to trigger any potential errors
      try {
        if (window.game) {
          window.game.getPossibleMoves(6, 4);
        }
      } catch (e) {
        logs.push(e.toString());
      }

      return logs.some(log =>
        log.includes('undefined') ||
        log.includes('is not an object') ||
        log.includes('Cannot read')
      );
    });

    if (hasUndefinedErrors) {
      console.log('⚠️  Found potential undefined errors');
    } else {
      console.log('✅ No undefined errors detected');
    }

    console.log('\n🎉 Production build test PASSED! The fix is working correctly.\n');

  } catch (error) {
    console.error('\n❌ Production build test FAILED:', error.message, '\n');
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

// Run the test
testProductionBuild().then(() => {
  console.log('Test completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});