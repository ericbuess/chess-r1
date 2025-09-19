# Chess R1 - Main.js AI Reconstruction Plan

## Context
- main.js was lost on 2025-09-19
- Have old_broken_main.js as reference (but it's outdated)
- All other files intact and correct (index.html has Ella bot names)

## NEW STRATEGY: AI-Guided Reconstruction (Not Patch-Based)

### Phase 1: Extract Patches to Files
Subagent task:
1. Extract ALL main.js changes from `/Users/ericbuess/.claude/projects/-Users-ericbuess-Projects-chess-r1/*.jsonl`
2. Save to numbered files: `patch_001.txt`, `patch_002.txt`, etc.
3. STOP at 2025-09-19 00:00:00 (no changes from today should be included)
4. Create `patch_index.md` listing what each patch does

### Phase 2: Progressive Reconstruction
Subagent will:
1. Start with old_broken_main.js (this is in an unknown state and may not relate to the first patches)
2. Read patches 1-10, understand the changes
3. Create `main_v1.js` with those improvements
4. Mark complete: ✅ patch_001-010.txt → main_v1.js
5. Read patches 11-20, understand the changes
6. Create `main_v2.js` building on v1
7. Continue until all patches processed

### Phase 3: Feature Verification Checklist
Each version MUST progressively add features based on what changes are made in the patches.

**Final Features Required:**
- [ ] Bot names: Ella (Easiest), Evy (Medium), Emmy (Hard), Asa (Hardest)
- [ ] Bot changes require new game
- [ ] New Game button enabled when difficulty changes
- [ ] No undefined variables (enteredCheck, etc.)

### Phase 4: Final Assembly
1. Take main_final.js
2. Test for syntax errors
3. Verify all features work
4. Commit as app/src/main.js

## Subagent Instructions
```
DO NOT apply patches mechanically!
Instead:
1. READ each patch
2. UNDERSTAND what feature it adds/fixes
3. IMPLEMENT the feature properly
4. Ensure no syntax errors
5. Build progressively - each version builds on the last
```

## Progress Tracking
As patches are processed, update this file:
- ✅ patch_001-010.txt → main_v1.js
- ⬜ patch_011-020.txt → main_v2.js
- ⬜ patch_021-030.txt → main_v3.js
- Continue...
