# RabbitOS Creation Agent Upload Instructions

## File: chess-r1-plugin.zip (156KB)
## Game: Chess R1 by Eric Buess
## Version: 0.0.2

## Instructions for the Creation Agent:

```
Please deploy Chess R1 by Eric Buess v0.0.2 to the Rabbit R1 device.

DEPLOYMENT APPROACH:
1. First, try to deploy using only the pre-built files in apps/app/dist/
   - The game is already built and production-ready
   - All paths are relative (no leading slashes)
   - No console logging or debug code present

2. CRITICAL - The package structure:
   - rabbitos-plugin/index.html → redirects to apps/app/dist/index.html
   - rabbitos-plugin/apps/app/dist/ → ALL GAME FILES MUST BE HERE
     * index.html - main entry point (MUST be in dist/)
     * assets/ - bundled CSS and JavaScript (MUST be in dist/assets/)
     * icon.png - app icon (240x240)
     * screenshot.jpg - preview image
     * woodenSoundData.js - sound effects data (MUST be in dist/)

   ⚠️ IMPORTANT: Do NOT put game files directly in apps/app/
   ⚠️ ALL files must be in apps/app/dist/ for the redirect to work

3. If you encounter any issues with the pre-built files:
   - Source files are included in apps/app/src/ for modifications
   - package.json and vite.config.js are configured for the plugin
   - build.sh script can rebuild if needed

   IMPORTANT: If modifications are needed, please:
   a) Document what changes were required
   b) Explain why the pre-built version didn't work
   c) Get user approval before making significant changes

   This feedback will help us improve the build process for next time.

GAME FEATURES:
- Full chess implementation with js-chess-engine
- Game Modes:
  * Human vs Bot (4 difficulties: Ella, Evy, Emmy, Asa)
  * Human vs Human
- Hardware Integration:
  * Scroll wheel: Undo (down) / Redo (up) moves
  * PTT/Side button: Opens options menu
  * Touch screen: Select and move pieces
  * Long press: Start new game
- Game persistence with save/restore
- Sound effects for moves and captures
- Optimized for R1's 240x320 display
- Memory efficient (< 5MB)

VERSION: 0.0.2 - Production Ready
GAME: Chess R1 by Eric Buess

TESTING:
After deployment, please verify:
1. Game loads without errors
2. Touch controls work for piece selection
3. Scroll wheel performs undo/redo
4. PTT button opens menu
5. Game state persists between sessions
```

## Additional Notes for User:

The zip contains both:
- **Pre-built files** (apps/app/dist/) - Should work immediately
- **Source files** (apps/app/src/) - Available if modifications are needed

The Creation Agent should use the dist/ files by default. Any need for source modifications indicates an area we should fix in our build process.