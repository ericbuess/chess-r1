# Chess R1 - Main.js Reconstruction Plan

## Critical Context
- main.js was lost on 2025-09-19 after git deletion
- All other files (index.html, style.css, woodenSoundData.js) are intact
- Base: /Users/ericbuess/Projects/chess_r1_initial_bot_move_fix/apps/app/src/main.js

## Step 1: Extract Patches
Extract ONLY main.js patches from Claude logs before 2025-09-19:
- Source: /Users/ericbuess/.claude/projects/-Users-ericbuess-Projects-chess-r1/*.jsonl
- Target: app/src/main.js patches only
- Stop at: 2025-09-19 00:00:00

## Step 2: Apply Patches Chronologically
1. Start with base main.js from chess_r1_initial_bot_move_fix
2. Apply patches one by one
3. Verify no syntax errors after each
4. Commit every 10 successful patches

## Step 3: Verify Key Features
Final version must have:
- Bot names: Ella, Evy, Emmy, Asa
- Default player: "Eric"
- Display: "Eric's turn" not "Your turn"
- Header: "Bot (Ella)" not "Eric vs Ella"
- Bot difficulty requires new game
- hideInstructionLabel function exists
