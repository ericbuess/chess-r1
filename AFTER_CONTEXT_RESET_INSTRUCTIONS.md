# Instructions After Context Reset

## FIRST: READ THESE FILES IN ORDER
1. **Read THIS file completely** - AFTER_CONTEXT_RESET_INSTRUCTIONS.md
2. **Read PROPOSED_CHANGES.md** - See what user checked
3. **Keep all_patches_extracted.json open** - Has exact code changes

## Current Situation
You've been working on restoring the Chess R1 project after a git loss. The user has reviewed and approved changes in PROPOSED_CHANGES.md.

## Your Task
Apply the CHECKED changes from PROPOSED_CHANGES.md to the codebase.

## Critical Files You Need

1. **PROPOSED_CHANGES.md** - Contains user's checkboxes for what to apply
2. **all_patches_extracted.json** - Contains the EXACT code changes with timestamps
3. **extraction_script.py** - Can re-extract if needed
4. **verification_script.py** - Can verify what's already applied

## How to Apply Patches

### Step 1: Read PROPOSED_CHANGES.md
```bash
cat PROPOSED_CHANGES.md | grep -A 3 "^\- \[x\]"
```
This shows only the CHECKED items the user wants applied.

### Step 2: For Each Checked Item

1. **Bot Names Change (Eric, Emmy, Asa, Bayes)**
   - Find in all_patches_extracted.json: timestamp "2025-09-19T01:41:36.799Z"
   - Location: main.js line ~1416
   - Change: `1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert'`
   - To: `1: 'Eric', 2: 'Emmy', 3: 'Asa', 4: 'Bayes'`
   - Also update getBotName() method

2. **Cookie Functions Implementation**
   - Search all_patches_extracted.json for "setCookie" and "getCookie"
   - These need to be ADDED (not found in extraction, user said they were there)
   - Add before saveToStorage function:
   ```javascript
   function setCookie(name, value, days = 365) {
     const expires = new Date();
     expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
     const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
     document.cookie = `${name}=${encodeURIComponent(stringValue)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
   }

   function getCookie(name) {
     const nameEQ = name + "=";
     const cookies = document.cookie.split(';');
     for (let i = 0; i < cookies.length; i++) {
       let c = cookies[i].trim();
       if (c.indexOf(nameEQ) === 0) {
         const value = decodeURIComponent(c.substring(nameEQ.length));
         try { return JSON.parse(value); } catch { return value; }
       }
     }
     return null;
   }
   ```
   - Modify saveToStorage to try cookies BEFORE localStorage
   - Modify loadFromStorage to try cookies BEFORE localStorage

3. **Orange Spinner Fix**
   - Find in all_patches_extracted.json: timestamp "2025-09-18T21:22:18.658Z"
   - File: style.css line ~439
   - Change: `.progress-bar { background: #ff4500; }`
   - To: `.progress-bar { background: #333; }`

4. **Bot Difficulty Tracking**
   - Multiple patches between 21:10-21:17 on Sept 18
   - Add properties: originalBotDifficulty, difficultyChangedMidGame
   - Add setBotDifficulty() method
   - Update showOptionsMenu to track original
   - Update updateOptionsButtons for button text
   - Update radio handlers to use setBotDifficulty

5. **Async/Await Fixes**
   - Make these functions async:
     - handleSquareSelection
     - handleTouchEnd
     - makeMove
   - Update their callers to await them
   - Add autoSave() calls after moves/undo/redo

6. **Bot Initial Move Fix**
   - Find timestamp "2025-09-18T18:55:18.403Z"
   - Add checkInitialBotTurn() call in hideOptionsMenu

7. **Coordinate Reversal Fixes**
   - Multiple patches 19:02-19:40 on Sept 18
   - Update getLogicalCoordinates and getDisplayCoordinates
   - Handle different game modes properly

## How to Find Exact Code in JSON

Use Python to extract specific patches:
```python
import json
with open('all_patches_extracted.json') as f:
    data = json.load(f)

# Find by timestamp
target_time = "2025-09-19T01:41:36.799Z"
for patch in data['patches']:
    if patch['timestamp'] == target_time:
        print(f"File: {patch['file']}")
        print(f"Old: {patch['old_code']}")
        print(f"New: {patch['new_code']}")
```

## Verification After Each Change

After applying each patch:
1. Check syntax: `node -c app/src/main.js`
2. Run verification: `python3 verification_script.py`
3. Commit after each successful patch

## Order of Application

1. First: Async/await fixes (prevents syntax errors)
2. Second: Cookie functions (enables save/restore)
3. Third: Bot names (most visible change)
4. Fourth: Orange spinner CSS
5. Fifth: Bot difficulty tracking
6. Sixth: Coordinate fixes
7. Last: Bot initial move fix

## Important Notes

- The user wants ONLY checked items from PROPOSED_CHANGES.md
- Bot names are "Eric, Emmy, Asa, Bayes" NOT "Ella, Evy, Emmy, Asa"
- Cookie implementation is CRITICAL for save/restore
- Many patches may be partially applied - use verification_script.py
- Commit and push after each successful patch group

## If You Get Stuck

1. Run: `python3 extraction_script.py` to re-extract patches
2. Run: `python3 verification_script.py` to see what's missing
3. Check git log: `git log --oneline -20` to see recent commits
4. The user's main complaint: save/restore doesn't work, bot names wrong

## DO NOT

- Make fresh changes not in the patches
- Skip the cookie implementation
- Change bot names to anything other than Eric/Emmy/Asa/Bayes
- Apply unchecked items from PROPOSED_CHANGES.md

Start by reading PROPOSED_CHANGES.md to see what's checked!