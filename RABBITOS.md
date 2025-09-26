# 🐰 RABBIT R1 CREATION AGENT INSTRUCTIONS

**PLUGIN NAME**: Chess R1

**CRITICAL: READ THIS ENTIRE FILE BEFORE MAKING ANY CHANGES**

## ⚠️ CRITICAL CONVERSION INSTRUCTIONS

**YOUR TASK**: Convert this web app into an R1 plugin called "Chess R1" WITHOUT modifying the source code.

### DO NOT MODIFY SOURCE FILES

All source files contain this comment:
```
// CRITICAL: DO NOT MODIFY THIS FILE except for updating paths for linking or imports
```

**FOLLOW THIS STRICTLY** - Only update import paths if necessary for your build system.

## 📦 Package Structure

This package contains the complete Chess R1 source code:

```
apps/app/
├── index.html           # Main HTML entry point
├── package.json         # Dependencies (js-chess-engine)
├── plugin.json          # R1 plugin manifest (name: "Chess R1")
├── .rabbit-r1-config.yml # R1 configuration (name: "Chess R1")
├── vite.config.js       # Build configuration
└── src/
    ├── main.js          # Game logic with ES6 import
    ├── style.css        # Game styles for 240x320 viewport
    ├── woodenSoundData.js # Sound effects data
    └── lib/
        ├── device-controls.js # R1 hardware abstraction
        ├── flutter-channel.js # Flutter communication
        └── ui-design.js       # UI utilities
```

## 🚀 BUILD INSTRUCTIONS

### ⚠️ CRITICAL: Chess Engine Import Pattern

The chess engine MUST be imported and exposed exactly like this in `src/main.js`:

```javascript
// FORCE INCLUDE - DO NOT REMOVE
import * as ChessEngine from 'js-chess-engine';
window.jsChessEngine = ChessEngine;
console.log('Chess engine modules:', Object.keys(ChessEngine));
```

**WHY THIS MATTERS:**
- The `import *` pattern prevents Vite from tree-shaking the library
- The `console.log` forces Vite to recognize the dependency is used
- Without this exact pattern, the chess engine won't be bundled

### Build Steps

1. **Configuration files are already included**:
   ```bash
   cd apps/app

   # Verify configuration files exist
   cat plugin.json
   # Should show: name: "Chess R1", version: "0.0.2"

   cat .rabbit-r1-config.yml
   # Should show: name: "Chess R1", version: "0.0.2"
   ```

2. **Verify package.json has js-chess-engine**:
   ```bash
   cat package.json | grep js-chess-engine
   # Should show: "js-chess-engine": "^1.0.4"
   ```

3. **Install dependencies (REQUIRED - do not skip)**:
   ```bash
   npm install
   ```

4. **Verify chess engine installed**:
   ```bash
   ls node_modules/js-chess-engine
   # Should list the library files
   ```

5. **Clean build (remove old artifacts)**:
   ```bash
   rm -rf dist
   npm run build
   ```

6. **Verify chess engine is bundled**:
   ```bash
   grep -c "ChessEngine" dist/assets/main-*.js
   # Should return a number > 0
   ```

7. **Verify complete dist structure**:
   ```bash
   ls -la dist/
   # Should have: index.html, assets/main-*.js, assets/main-*.css
   # Note: woodenSoundData.js is now embedded in main bundle (no separate file)
   ```

8. **Deploy the dist folder** to your R1 plugin system with the configuration files

## ⚠️ CRITICAL RULES

1. **DO NOT modify any game logic** - it's fully tested and working
2. **DO NOT remove protective comments** from source files
3. **DO NOT change the import pattern** - MUST use `import * as ChessEngine`
4. **DO NOT skip npm install** - dependencies must be installed
5. **DO NOT use cached builds** - always clean build with `rm -rf dist`
6. **VERIFY chess engine is bundled** - grep the output to confirm
7. **ONLY update paths** if your build system requires it

### Common Failures and Solutions

| Problem | Symptom | Solution |
|---------|---------|----------|
| Chess engine not bundled | "undefined is not an object" error | Use exact import pattern shown above |
| Tree-shaking removes import | Game loads but can't create new game | Add console.log to force usage |
| Wrong import syntax | Build succeeds but runtime fails | Must use `import * as ChessEngine` |
| Dependencies not installed | Build fails or missing modules | Always run `npm install` first |
| Cached build artifacts | Old errors persist | Delete dist/ before building |

## ✅ What This App Contains

- **Complete Chess Game** with all FIDE rules
- **Chess Engine**: Uses js-chess-engine npm package (ES6 module import)
- **Two Game Modes**: Human vs Bot, Human vs Human
- **Four Bot Difficulties**:
  - Ella (Normal)
  - Evy (Hard)
  - Emmy (Harder)
  - Asa (Hardest)
- **R1 Hardware Integration**:
  - Scroll wheel → Undo/Redo
  - PTT button → Options menu
  - Long press PTT → Show status indicator
- **Touch Controls** for piece movement
- **Auto-save** between sessions
- **Sound Effects** for moves

## 🎮 R1 Hardware Mappings

The app ALREADY contains these mappings - DO NOT duplicate:

| R1 Control | Event Listener | Game Action |
|------------|---------------|-------------|
| Touch | `click`/`touch*` | Select/move piece |
| Scroll up | `scrollUp` | Redo move |
| Scroll down | `scrollDown` | Undo move |
| PTT button | `sideClick` | Options menu |
| PTT long press | `longPressStart/End` | Show status (version & bot info) |

## 🔧 Technical Details

- **Version**: 0.0.2
- **Author**: Eric Buess
- **Engine**: js-chess-engine (ES6 npm module)
- **Viewport**: 240x320 (R1 screen)
- **Build Tool**: Vite
- **Target**: ES2015+ JavaScript

## 📝 Environment Detection

The app automatically detects its environment:

```javascript
const isR1 = typeof PluginMessageHandler !== 'undefined';
// true on R1 (hardware controls only)
// false in browser (keyboard shortcuts active)
```

## ⚡ Performance Targets

All targets are MET in testing:
- Bot response: < 2 seconds ✅
- Move validation: < 10ms ✅
- Memory usage: < 5MB ✅
- Touch responsiveness: Instant ✅

## ❌ DO NOT

- Add new features
- Modify game rules
- Change viewport (240x320)
- Rebuild chess logic
- Remove environment detection
- Duplicate R1 event handlers
- Change bot difficulties
- Modify the ES6 import structure

## ✅ BUILD VERIFICATION CHECKLIST

After building, verify:

### File Integrity
- [ ] All source files preserved
- [ ] `src/main.js` uses ES6 import
- [ ] No inline chess engine (uses npm package)
- [ ] Protective comments intact
- [ ] `plugin.json` exists with name "Chess R1"
- [ ] `.rabbit-r1-config.yml` exists with name "Chess R1"

### Build Output
- [ ] `dist/index.html` exists
- [ ] `dist/assets/main-*.js` created (minified, includes sound data)
- [ ] `dist/assets/main-*.css` created (minified)
- [ ] Total dist size < 300KB

### Build Log
- [ ] No errors during `npm install`
- [ ] No errors during `npm run build`
- [ ] Vite reports successful build

## 📊 REQUIRED: Report Status to User

**After conversion, report:**

```
✅ RABBITOS PLUGIN CONVERSION STATUS
=====================================
Plugin Name: Chess R1
Source Files: [PRESERVED/MODIFIED]
Build Status: [SUCCESS/FAILED]
Chess Engine Bundled: [YES/NO] (grep count: X)
Configuration Files: [CREATED/FAILED]
File Integrity: X/6 files verified
Build Size: XXX KB
Errors: [None/List any errors]
Warnings: [None/List any warnings]

Ready for R1 deployment: [YES/NO]
```

### Deployment Success Criteria

✅ **Build is successful when:**
- npm install completes without errors
- npm run build completes without errors
- Chess engine bundled (grep returns > 0)
- dist/ contains all required files
- No source files modified

❌ **Build failed if:**
- Chess engine not found in output
- Missing dist files
- Source files were modified
- Build errors occurred

## 🎯 YOUR ONLY TASK

1. **Install dependencies** with `npm install`
2. **Clean build** with `rm -rf dist && npm run build`
3. **Verify chess engine** with grep check
4. **Copy sound data** to dist/
5. **Report status** with verification results
6. **DO NOT modify** any source code

The app is COMPLETE and TESTED. Focus on:
- Proper dependency installation
- Clean build process
- Verification of chess engine bundling
- Accurate status reporting

---

**Creation Agent**: This is a finished, production-ready chess game. Your role is to BUILD and REPORT status only, not to modify or enhance. All R1 integration is already complete. The chess engine uses the npm package js-chess-engine via ES6 import.