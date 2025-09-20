# Chess R1 - Development Plan

## Current Issue: Production Build Fails

### Problem
The production build crashes with "Cannot read properties of undefined (reading 'Game')" even though:
- Dev server works perfectly
- All code references have been changed to `window.jsChessEngine.Game`
- The minified code contains the correct references

### Root Cause
Minification/bundling creates an execution order issue where something tries to use jsChessEngine before it's initialized.

### Fix Required
1. [ ] Ensure jsChessEngine is initialized before any class definitions
2. [ ] Add defensive checks in ChessGame constructor
3. [ ] Consider wrapping chess engine initialization in an IIFE
4. [ ] Test production build with Puppeteer to verify fix

## Directory Structure
- `/app` - Main application source and build
- `/rabbitos-plugin` - Deployment package structure for Rabbit R1
- No other directories or test files needed

## Key Files
- `app/src/main.js` - Main application code
- `app/dist/` - Production build output
- `rabbitos-plugin/apps/app/dist/` - Deployment package location