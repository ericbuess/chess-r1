# Quick Path Fix for Chess R1 Deployment

## The Problem
The game preview works but runtime shows only "Ready to Play" and an orange square because:
1. Root redirect points to wrong location
2. dist/index.html references a non-existent file

## The Fix

### Fix 1: Update Root Redirect
In `/index.html`:
```html
<!-- WRONG -->
<meta http-equiv="refresh" content="0; url=apps/app/index.html">

<!-- CORRECT -->
<meta http-equiv="refresh" content="0; url=apps/app/dist/index.html">
```

### Fix 2: Remove Broken Script Tag
In `/apps/app/dist/index.html`, DELETE this line:
```html
<script src="./src/woodenSoundData.js"></script>
```

The sound data is already bundled in `./assets/main-[hash].js`

## Why This Works
- Preview uses development build: `apps/app/index.html` → `src/main.js` ✅
- Runtime needs production build: `apps/app/dist/index.html` → `assets/main-[hash].js` ✅
- The broken path `dist/src/woodenSoundData.js` doesn't exist, causing JS to fail

## Verification
After fixing:
1. Chess board should render (not just orange square)
2. Game should be fully playable
3. No console errors about missing files