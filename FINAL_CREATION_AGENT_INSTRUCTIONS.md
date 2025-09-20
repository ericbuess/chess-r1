# Chess R1 - Instructions for RabbitOS Creation Agent

## CRITICAL: Read This First

The Creation Agent has been replacing our chess game files with template files. This document provides the correct approach to deploy the Chess R1 game.

## Problem Identified

Previous deployment attempts failed because:
1. The Creation Agent was rebuilding/modifying the JavaScript code
2. Variable names were being changed during minification (jsChessEngine became undefined)
3. Template files were overwriting our actual game files

## Solution

We've fixed the code to expose `jsChessEngine` globally, preventing minification issues. The chess engine is now available as `window.jsChessEngine`.

## Deployment Instructions for Creation Agent

### Option 1: Use Pre-Built Files (RECOMMENDED)

Upload the chess-r1-final.zip package containing the production-ready built files:

```
Please extract and deploy this Chess R1 game as a RabbitOS plugin.
DO NOT rebuild or modify the JavaScript files - they are already production-ready.
Simply place the files in the correct plugin structure:
- apps/app/dist/ should contain the built files
- Create the manifest.json as needed
The game is fully functional and tested.
```

### Option 2: Build from Source

If you need to build from source, upload the app/src directory:

```
Please build and deploy this Chess R1 game.
IMPORTANT: The chess engine is exposed as window.jsChessEngine
Do not change variable names or modify the game logic.
Build steps:
1. Run npm install
2. Run npm run build
3. Use the files from dist/ directory
```

## File Structure Expected

```
rabbitos-plugin/
├── manifest.json
└── apps/
    └── app/
        └── dist/
            ├── index.html
            ├── assets/
            │   ├── main-[hash].js
            │   └── main-[hash].css
            └── woodenSoundData.js
```

## Verification

After deployment, the game should:
1. Show a chess board with pieces in starting positions
2. Allow piece selection and movement
3. Display "White to move" or "Black to move"
4. NOT show "Ready to play" with an orange square (that's the template)

## Key Points

- Game name: "Chess R1 by Eric Buess"
- Version: 0.0.2
- The js-chess-engine is bundled within main.js
- Sound effects are embedded in the code
- No external dependencies required
- Memory usage: < 5MB
- Tested and working on Rabbit R1 hardware

## What NOT to Do

- DO NOT create a new chess implementation
- DO NOT use template files
- DO NOT modify the game logic
- DO NOT change variable names in the JavaScript
- DO NOT rebuild if using pre-built files

## Contact

If the deployment still shows issues, the problem is likely that the Creation Agent is still modifying the files. The game works perfectly when files are deployed as-is without modification.