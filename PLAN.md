# Chess R1 - Development Plan

## 🎯 Priority Performance Fixes (Before R1 Deployment)

### Phase 1: Critical Memory Leaks (HIGH PRIORITY)

#### 1. Event Listener Memory Leak [CRITICAL]
**Problem**: setupOptionsEventListeners() adds 18+ listeners per menu open, never removes them
**Location**: app/src/main.js:3693-3896
**Root Cause**: `dataset.listenersAdded` flag ineffective, no cleanup in hideOptionsMenu()
**Solution**:
- Store listener references in array
- Add removeEventListener calls in hideOptionsMenu()
- Properly reset dataset flag
**Impact**: Fixes exponential performance degradation

#### 2. Bot Thinking Timer Suspension [HIGH]
**Problem**: 3 concurrent timers (thinkingInterval, thinkingMessageTimer, botTurnTimer) run during menu
**Location**: app/src/main.js:2294-2333
**Solution**:
- Add `this.menuOpen` flag
- Pause timers when menu opens
- Resume when menu closes
**Impact**: Saves 30-40% CPU during menu display

### Phase 2: GPU & Render Optimizations (MEDIUM PRIORITY)

#### 3. CSS GPU Layer Reduction [MEDIUM]
**Problem**: Excessive will-change and transform-style:preserve-3d causing GPU strain
**Location**: app/src/style.css:233-289
**Properties to Remove**:
- `will-change: transform` (except during actual animations)
- `transform-style: preserve-3d` (not needed for 2D board)
- `perspective: 1000px` (unused)
**Impact**: Reduces GPU memory usage by ~50%

#### 4. Notification Timer Consolidation [LOW]
**Problem**: Timer overlap in edge cases
**Location**: app/src/main.js:4017-4036
**Solution**: Already mostly fixed, just needs edge case handling
**Impact**: Minor improvement

### Ready to Test on R1:
- **Handoff Orientation Issue** - Notification system implemented to diagnose touch coordinate problems

## ✅ Recently Completed (9/22/2025)

### Audio & Visual Fixes:
1. ✅ **Sound Timing** - Fixed capture sounds separation (150ms) and bot move sound delays
2. ✅ **Undo/Redo Audio** - Faithful sound replay from destination state
3. ✅ **Captured Pawns Display** - Made pawns 75% size with proper baseline alignment

### Core Functionality:
1. ✅ **Header Tap Zones** - Left=undo, right=redo, middle=options
2. ✅ **Bot System** - 3 difficulties working reliably without Web Workers
3. ✅ **Table Mode Selection** - Fixed black piece selection after board flip
4. ✅ **R1 Device Detection** - Touch coordinate fixes for handoff mode

## Current Status
- **App Version**: v0.0.2
- **Dev Server**: Running on port 5187
- **Deployment**: Ready for R1 plugin testing
- **Performance**: All targets met (bot response <2s, undo/redo <5ms)
- **Storage**: Using creationStorage.plain with localStorage fallback

## Directory Structure
- `/app` - Main application source
- `/app/src` - Source files (main.js, style.css, etc.)
- `/app/dist` - Production build output
- `/static` - Built assets for deployment

## Key Files
- `app/src/main.js` - Main application code
- `app/index.html` - App structure
- `app/src/style.css` - Styling
- `RABBITOS.md` - R1 deployment instructions