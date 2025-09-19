# Proposed Changes for Chess R1 Project

**Time Range**: September 18, 2025 6:40 PM - September 19, 2025 Morning
**Total Patches Found**: 127
**Files Modified**: main.js, style.css, index.html, PLAN.md, HISTORY.md

## Instructions
- Review each change below
- Check the box if you want the change applied
- Edit descriptions if needed
- Save this file when done reviewing
- I will then apply only the checked changes

---

## 🎯 Critical Features to Restore

### 1. Bot Names Change (Eric, Emmy, Asa, Bayes)
- [ ] **Change bot difficulty names** (2025-09-19T01:41:36.799Z)
  - Location: main.js line 1416
  - Changes `Easy/Medium/Hard/Expert` to `Eric/Emmy/Asa/Bayes`
  - Also updates getBotName() method at line 1420

### 2. Save/Restore with Cookies
- [ ] **Add cookie functions setCookie/getCookie**
  - Implement cookie storage functions
  - Modify saveToStorage to use cookies first, then localStorage
  - Modify loadFromStorage to check cookies first

- [ ] **Add autoSave after moves** (multiple patches)
  - After makeMove success
  - After bot moves in executeBotMove
  - After undo operations
  - After redo operations

- [ ] **Save last_game_mode when switching modes**
  - In game mode radio button handler
  - Saves mode and timestamp to cookies

### 3. Orange Spinner/Progress Bar Removal
- [ ] **Remove orange background from progress bar** (2025-09-18T21:22:18.658Z)
  - Location: style.css line 439
  - Changes `.progress-bar { background: #ff4500; }` to `background: #333;`

### 4. Bot Difficulty Change Detection
- [ ] **Add tracking properties** (2025-09-18T21:10:25.462Z)
  - Add `originalBotDifficulty` property
  - Add `difficultyChangedMidGame` property

- [ ] **Add setBotDifficulty method** (2025-09-18T21:13:15.616Z)
  - Location: main.js after setHumanColor
  - Tracks if difficulty changed mid-game

- [ ] **Track original difficulty on menu open** (2025-09-18T21:14:31.719Z)
  - In showOptionsMenu method
  - Stores `originalBotDifficulty = this.botDifficulty`

- [ ] **Update back button text for difficulty changes** (2025-09-18T21:15:44.276Z)
  - In updateOptionsButtons method
  - Shows "Start new game (difficulty changed)" when changed

- [ ] **Reset tracking on mode switch** (2025-09-18T21:17:00.975Z)
  - In game mode change handler
  - Resets difficultyChangedMidGame flag

- [ ] **Use setBotDifficulty in UI handler** (2025-09-18T21:17:38.436Z)
  - In bot difficulty radio handler
  - Calls setBotDifficulty() and updateOptionsButtons()

### 5. Async/Await Fixes
- [ ] **Make handleSquareSelection async**
  - Add async keyword to function definition
  - Update callers to await

- [ ] **Make handleTouchEnd async**
  - Add async keyword to function definition
  - Update event listener to await

- [ ] **Make makeMove async**
  - Add async keyword to function definition
  - Add await for autoSave call

### 6. Bot Initial Move Fixes
- [ ] **Add bot check after hideOptionsMenu** (2025-09-18T18:55:18.403Z)
  - In hideOptionsMenu method
  - Checks if bot should move after color change

- [ ] **Coordinate reversal fixes** (multiple patches 19:02-19:40)
  - Fix getLogicalCoordinates for different game modes
  - Fix getDisplayCoordinates for different game modes
  - Handle bot games, table mode, handoff mode correctly

### 7. Color Change Detection
- [ ] **Already implemented - verify present**
  - colorChangedMidGame tracking
  - originalHumanColor tracking
  - Back button text updates

---

## 📝 Documentation Updates

### PLAN.md Updates
- [ ] **Update upcoming work section** (2025-09-18T19:43:13.536Z)
- [ ] **Add Random color bug fix entry** (2025-09-18T20:53:21.974Z)
- [ ] **Mark Random removal as complete** (2025-09-18T20:54:38.798Z)

### HISTORY.md Updates
- [ ] **Add orientation system fix entry** (2025-09-18T19:43:27.730Z)

### index.html Updates
- [ ] **Remove Random color option** (2025-09-18T20:53:39.153Z)
  - Removes the Random radio button from player color selection

---

## ⚠️ Changes to Skip (Already Applied or Not Needed)

### Already Applied
- Color change detection (verified present in current code)
- Basic structure for bot difficulty tracking
- Some coordinate handling improvements

### Not Needed
- Test/temporary changes
- Incomplete patches
- Changes that were later reverted

---

## 📊 Summary

**High Priority (Must Have)**:
- Bot names change to Eric/Emmy/Asa/Bayes
- Cookie save/restore implementation
- Orange spinner CSS fix
- Bot difficulty change detection
- Async/await syntax fixes

**Medium Priority (Should Have)**:
- Bot initial move after color change
- Coordinate reversal improvements
- Documentation updates

**Low Priority (Nice to Have)**:
- Random color option removal
- Minor UI tweaks

---

## Notes for Review

1. The bot names were "Eric, Emmy, Asa, Bayes" NOT "Ella, Evy, Emmy, Asa"
2. Cookie implementation is critical for save/restore to work
3. Orange spinner fix is a simple CSS change but important
4. Many async/await fixes are needed to prevent errors
5. Some patches may already be partially applied

**Please review and check the boxes for changes you want applied.**