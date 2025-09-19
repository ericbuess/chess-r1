# Chess R1 Project - Claude Instructions

## 🎯 SINGLE SOURCE OF TRUTH PRINCIPLE

**CRITICAL ARCHITECTURAL RULE**: js-chess-engine is the ONLY source of truth for:
- Chess rules and move validation
- Game state (check, checkmate, stalemate)
- Legal moves calculation
- Bot move generation

**NEVER** create custom chess logic that duplicates engine functionality:
- ❌ Don't write custom check/checkmate detection
- ❌ Don't implement custom move validation
- ❌ Don't maintain duplicate game state
- ✅ Always delegate to `this.engine` for chess logic
- ✅ UI code should only handle display, not chess rules

**Why This Matters**: Duplicate logic causes state conflicts, bugs, and maintenance nightmares. Let the proven chess engine handle ALL chess logic.

## 🚫 CRITICAL: NO PUPPETEER - MONITORING ONLY

**ABSOLUTE RULE**: NEVER use Puppeteer to directly interact with the browser or test the application.

### Why No Puppeteer
1. **Context Preservation**: Using subagents for monitoring preserves your main context for analysis
2. **Real Testing**: User performs real interactions, you observe and analyze
3. **No Test Complexity**: Avoid brittle test scripts that break with UI changes
4. **Trust Issues**: Don't claim things work based on automated tests - only real user verification counts

### Monitoring-Only Approach
**DO:**
- ✅ Use subagents with Task tool to check BrowserTools logs
- ✅ Monitor what the user does via console logs
- ✅ Analyze patterns and issues from logs
- ✅ Suggest what the user should test
- ✅ Wait for user confirmation before marking complete

**DON'T:**
- ❌ Never use Puppeteer to click, type, or navigate
- ❌ Never create automated test scripts
- ❌ Never directly interact with the page
- ❌ Never claim something works without user confirmation

### BrowserTools Monitoring Setup

#### Step 1: Start Dev Server
```bash
cd /Users/ericbuess/Projects/chess-r1/app
npm run dev  # Runs on port 5177
```

#### Step 2: Start BrowserTools Server
```bash
npx @agentdeskai/browser-tools-server --port 3025 &
# Save the process ID for monitoring
```

#### Step 3: User Opens Chrome
The user will:
1. Open Chrome and navigate to the app
2. Open DevTools (F12) for BrowserTools extension
3. Keep DevTools open for monitoring

#### Step 4: Monitor with Subagents
```javascript
// Use Task tool to preserve context:
Task(
  description: "Monitor browser logs",
  subagent_type: "general-purpose",
  prompt: "Check BrowserTools server output for chess game logs, errors, and state changes. Look for patterns in [UNDO], [REDO], [TEST], move operations, and any errors."
)
```

### Important Chrome Settings
- **DevTools**: Must be open for BrowserTools extension to work
- **Tabs**: Keep only one tab open (extension requirement)
- **Network tab**: Disable cache for fresh loads
- **Console**: Monitor for errors and custom logs

## 📋 CRITICAL: Two-Tier Verification System

**NEVER claim something is complete without user verification!**

### Verification Levels

#### Level 1: Claude Checkpoint ⚪
```markdown
- [ ] ⚪ Implement feature/fix (Claude believes complete)
```
This means: "I've made changes that should address this"

#### Level 2: User Verified ✅
```markdown
- [x] ✅ Feature confirmed working by user
```
This means: "User has tested and confirmed it works"

### IMPORTANT: Completion Protocol

**After completing any task:**
1. Mark it as `[ ] ⚪` in PLAN.md
2. **Explicitly tell the user** at the end of your message:
   - What was completed
   - What specific tests they should run
   - Ask: "Please verify this works as expected"
3. **After user confirms**, mark as `[x] ✅`
4. **Move to HISTORY.md** with date and verification notes

### Documentation Rules

**ONLY TWO DOCUMENTATION FILES:**
1. **PLAN.md** - Current work and upcoming tasks
2. **HISTORY.md** - Completed and verified work

**STRICT WORKFLOW:**
1. Add task to PLAN.md as `[ ]` (pending)
2. Work on task, mark as `[ ] ⚪` (Claude complete)
3. User tests and confirms
4. Mark as `[x] ✅` (user verified)
5. ONLY THEN move to HISTORY.md with date and verification notes

**NEVER:**
- Create analysis files (analysis.md, findings.md, etc.)
- Create test files (test-results.md, etc.)
- Mark as complete without user verification
- Move to HISTORY without user confirmation

### Example Plan Entry
```markdown
## Current Sprint
- [ ] Fix undo/redo state management
  - [ ] ⚪ Identify issue with state branching
  - [ ] ⚪ Implement fix for state truncation
  - [ ] User verification: Test sequence E2-E4, F2-F4, undo, D2-D4
- [x] ✅ Add keyboard shortcut for PTT (verified 9/15)
```

## 🧠 CRITICAL: Code Analysis Before Editing

**ALWAYS ULTRATHINK AND USE INDEX-ANALYZER BEFORE CODE CHANGES**

Before making ANY code changes:
1. **ULTRATHINK** - Deep analysis of the problem and solution
2. **USE INDEX-ANALYZER SUBAGENT** - Map all related code areas
3. **Plan comprehensively** - Document approach in PLAN.md
4. **Then implement** - Make targeted changes with full context

This prevents:
- Breaking existing functionality
- Missing critical dependencies
- Creating state inconsistencies
- False completion claims

## 🎮 Testing Keyboard Shortcuts

For browser testing (will be removed for R1):
- **P**: Push-To-Talk/Options menu (opens menu with New Game option)
- **Left Arrow**: Undo move
- **Right Arrow**: Redo move

## 📁 Project Structure

- **Main App**: `/Users/ericbuess/Projects/chess-r1/app`
- **Source**: `/app/src/main.js`
- **Dev Server**: Port 5173 (default) or 5174
- **Viewport**: 240x320 (Rabbit R1 dimensions)



## 🚀 Rabbit R1 Deployment

**NEVER prepare the final Rabbit package until user explicitly says:**
- "Prepare the Rabbit package"
- "Create the upload package"
- "Ready for Rabbit upload"
- Or similar explicit approval

The app will be merged by rabbitos creation agent for R1 device.

## 📊 Performance Requirements & Success Metrics

**Target Performance:**
- Bot response time: < 2 seconds ✅
- Undo/redo operation: < 5ms ⚠️ (needs testing)
- Move validation: Instant (<10ms) ✅
- Memory usage: < 5MB for R1 constraints ✅
- Chess rules compliance: 100% ✅

## 🔍 Monitoring Checklist

When user is testing, monitor for:
1. Console errors (red messages)
2. Move execution logs
3. State change logs ([UNDO], [REDO], etc.)
4. Bot thinking/response logs
5. Performance timing logs
6. Any unexpected behavior patterns

Always use subagents to check logs to preserve your context for analysis and planning.

## 💡 Remember

1. **Never use Puppeteer** - Only monitor what user does
2. **Two checkmarks** - Claude complete ⚪ → User verified ✅
3. **Two docs only** - PLAN.md and HISTORY.md
4. **Subagents for logs** - Preserve context while monitoring
5. **User confirms** - Only user can verify something works
6. **Single source** - js-chess-engine handles all chess logic