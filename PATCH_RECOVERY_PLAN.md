# Patch Recovery Plan - Chess R1

## Critical Patches to Apply and Verify

### ✅ Completed Patches
- [x] Bot names in HTML (Eric, Emmy, Asa, Bayes)
- [x] hideOptionsMenu bot initialization
- [x] confirmNewGame bot first move logic

### 🔧 Patches to Apply

#### 1. Fix setHumanColor - stateHistory to moveHistory
- [ ] Apply patch to line 751
- [ ] Change: `this.stateHistory && this.stateHistory.length > 1`
- [ ] To: `this.moveHistory && this.moveHistory.length > 0`
- [ ] Test: Start game, make moves, change color, check "Back" button disables
- [ ] Verify with Puppeteer

#### 2. Fix setBotDifficulty - stateHistory to moveHistory
- [ ] Apply patch to line 765
- [ ] Change: `this.stateHistory && this.stateHistory.length > 1`
- [ ] To: `this.moveHistory && this.moveHistory.length > 0`
- [ ] Test: Start game, make moves, change difficulty, check "Back" button disables
- [ ] Verify with Puppeteer

#### 3. Remove duplicate setBotDifficulty function
- [ ] Remove lines 775-783 (duplicate function)
- [ ] Verify only one setBotDifficulty remains
- [ ] Test still works

#### 4. Fix cookie persistence
- [ ] Remove debug logging from getCookie/setCookie
- [ ] Test save/restore actually persists after refresh
- [ ] Verify with Puppeteer that cookies are saved and loaded

#### 5. Verify all features
- [ ] Bot names show as Eric, Emmy, Asa, Bayes
- [ ] Orange spinner appears when bot thinking
- [ ] Save/restore works across page refresh
- [ ] Button disables when settings changed mid-game
- [ ] Bot plays first when human is black

## Puppeteer Test Checklist

### Test 1: Button Disable on Color Change
```javascript
// 1. Start game
// 2. Make a move (E2-E4)
// 3. Open options (press P)
// 4. Change color to black
// 5. Verify button text changes and is disabled
```

### Test 2: Button Disable on Difficulty Change
```javascript
// 1. Start game
// 2. Make a move
// 3. Open options
// 4. Change difficulty
// 5. Verify button text changes and is disabled
```

### Test 3: Cookie Persistence
```javascript
// 1. Make moves
// 2. Check cookies exist
// 3. Refresh page
// 4. Verify game state restored
```

### Test 4: Bot Names
```javascript
// 1. Open options
// 2. Check difficulty radio labels
// 3. Verify: Eric, Emmy, Asa, Bayes
```

### Test 5: Orange Spinner
```javascript
// 1. Make a move
// 2. Check for .bot-thinking-spinner element
// 3. Verify CSS shows inline-block, 3vw size
```

## Commit After Each Working Patch

```bash
git add -A && git commit -m "Fix: [specific fix]"
git push origin dev
```