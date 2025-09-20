# 🐰 RABBIT R1 CREATION AGENT INSTRUCTIONS

**CRITICAL: READ THIS ENTIRE FILE BEFORE MAKING ANY CHANGES**

## ⚠️ CRITICAL CONVERSION INSTRUCTIONS

**YOUR TASK**: Convert this web app into an R1 plugin WITHOUT modifying the source code.

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

1. **Install dependencies**:
   ```bash
   cd apps/app
   npm install
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Copy sound data to dist**:
   ```bash
   cp src/woodenSoundData.js dist/
   ```

4. **Deploy the dist folder** to your R1 plugin system

## ⚠️ CRITICAL RULES

1. **DO NOT modify any game logic** - it's fully tested and working
2. **DO NOT remove protective comments** from source files
3. **DO NOT change ES6 imports** - uses js-chess-engine from npm
4. **DO NOT modify chess engine** - uses proven js-chess-engine library
5. **ONLY update paths** if your build system requires it

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
  - Long press PTT → New game
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
| PTT long press | `longPressStart/End` | New game |

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

### Build Output
- [ ] `dist/index.html` exists
- [ ] `dist/assets/main-*.js` created (minified)
- [ ] `dist/assets/main-*.css` created (minified)
- [ ] `dist/woodenSoundData.js` copied
- [ ] Total dist size < 200KB

### Build Log
- [ ] No errors during `npm install`
- [ ] No errors during `npm run build`
- [ ] Vite reports successful build

## 📊 REQUIRED: Report Status to User

**After conversion, report:**

```
✅ RABBITOS PLUGIN CONVERSION STATUS
=====================================
Source Files: [PRESERVED/MODIFIED]
Build Status: [SUCCESS/FAILED]
File Integrity: X/6 files verified
Build Size: XXX KB
Errors: [None/List any errors]
Warnings: [None/List any warnings]

Ready for R1 deployment: [YES/NO]
```

## 🎯 YOUR ONLY TASK

1. Take these source files AS-IS
2. Build them with Vite
3. Verify file integrity
4. Report conversion status
5. DO NOT modify the chess game code

The app is COMPLETE and TESTED. Just build and deploy it!

---

**Creation Agent**: This is a finished, production-ready chess game. Your role is to BUILD and REPORT status only, not to modify or enhance. All R1 integration is already complete. The chess engine uses the npm package js-chess-engine via ES6 import.