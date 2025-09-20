# 🐰 The Complete Guide to Building & Deploying Apps on Rabbit R1

## Table of Contents
1. [Overview](#overview)
2. [Key Lessons Learned](#key-lessons-learned)
3. [Technical Requirements](#technical-requirements)
4. [Project Structure](#project-structure)
5. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
6. [Step-by-Step Deployment Process](#step-by-step-deployment-process)
7. [Testing Your App](#testing-your-app)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Best Practices](#best-practices)

## Overview

The Rabbit R1 is a unique device with a 240x320 screen that runs web-based plugins through RabbitOS. This guide documents everything learned from successfully deploying a Chess game to the R1, including critical discoveries about how the Creation Agent works and common issues you'll encounter.

### What is the Creation Agent?
The RabbitOS Creation Agent is an AI assistant that converts your web app into an R1 plugin. It reads your instructions, builds your project, and deploys it to the device. However, it requires **very specific instructions** to work correctly.

## Key Lessons Learned

### 1. 🎯 The Creation Agent Needs Explicit Instructions
**Discovery**: The Creation Agent won't infer or assume anything. Every step must be explicitly stated.

**Solution**: Create a `RABBITOS.md` file with step-by-step commands, including verification steps.

### 2. 📦 Dependencies Must Be Properly Bundled
**Discovery**: Tree-shaking and minification can break your app if dependencies aren't imported correctly.

**Problem We Hit**:
```javascript
// This inline IIFE pattern broke after minification
const jsChessEngine = (function() {
  // ... bundled chess engine code
})();
```

**Solution**:
```javascript
// Use proper ES6 imports with explicit usage
import * as ChessEngine from 'js-chess-engine';
window.jsChessEngine = ChessEngine;
console.log('Chess engine modules:', Object.keys(ChessEngine)); // Forces bundling
```

### 3. 🏷️ Plugin Naming Requires Configuration Files
**Discovery**: The Creation Agent ignores your requested name unless it's set in configuration files.

**Solution**: Create these files explicitly:
```json
// plugin.json
{
  "manifest_version": 1,
  "name": "Your App Name",
  "version": "1.0.0",
  "description": "Your app description",
  "entry": "dist/index.html"
}
```

```yaml
# .rabbit-r1-config.yml
project:
  name: "Your App Name"
  version: "1.0.0"
  type: "web"
```

### 4. 🔊 Bundle Resources Into Main JavaScript
**Discovery**: Separate resource files (images, sounds) often fail with 403 errors in production.

**Problem**:
```html
<!-- This failed in production -->
<script src="/src/soundData.js"></script>
```

**Solution**:
```javascript
// Convert to ES6 module and import
import { soundData } from './soundData.js';
// Sound data is now bundled in main JS file
```

### 5. 🎵 Chrome Audio Requires User Interaction
**Discovery**: Chrome blocks audio until user interacts with the page.

**Solution**:
```javascript
let audioContext = null;
let audioInitialized = false;

function initializeAudio() {
  if (!audioInitialized && !audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioInitialized = true;
  }
}

// Initialize on first user interaction
document.addEventListener('click', initializeAudio, { once: true });
document.addEventListener('touchstart', initializeAudio, { once: true });
```

## Technical Requirements

### Screen & Viewport
- **Screen Size**: 240x320 pixels (portrait)
- **Viewport Setup**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### R1 Hardware Integration
The R1 provides special hardware controls:

| Control | Event | Usage |
|---------|-------|-------|
| Touch Screen | `click`, `touch*` | Primary interaction |
| Scroll Wheel | `scrollUp`, `scrollDown` | Navigation/actions |
| PTT Button | `sideClick` | Menu/options |
| PTT Long Press | `longPressStart/End` | Special actions |

### Environment Detection
```javascript
// Detect if running on R1
const isR1 = typeof PluginMessageHandler !== 'undefined';

if (isR1) {
  // R1-specific code (hardware controls)
} else {
  // Browser fallback (keyboard controls)
}
```

## Project Structure

```
your-app/
├── RABBITOS.md           # Creation Agent instructions (CRITICAL!)
├── apps/
│   └── app/
│       ├── package.json  # Dependencies
│       ├── vite.config.js # Build configuration
│       ├── index.html     # Entry point
│       └── src/
│           ├── main.js    # Main application code
│           ├── style.css  # Styles (240x320 optimized)
│           └── lib/       # R1 integration libraries
│               ├── device-controls.js
│               ├── flutter-channel.js
│               └── ui-design.js
```

### Critical: The RABBITOS.md File
This file tells the Creation Agent exactly how to build your app. Without it, deployment will fail.

## Common Pitfalls & Solutions

### Pitfall 1: Source Files Get Modified
**Problem**: Creation Agent changes your working code.

**Solution**: Add protective comments:
```javascript
// CRITICAL: DO NOT MODIFY THIS FILE except for updating paths for linking or imports
```

### Pitfall 2: Dependencies Not Installed
**Problem**: Build fails because npm packages aren't installed.

**Solution**: Explicitly state in RABBITOS.md:
```markdown
3. **Install dependencies (REQUIRED - do not skip)**:
   \`\`\`bash
   npm install
   \`\`\`
```

### Pitfall 3: Tree-Shaking Removes Code
**Problem**: Vite removes "unused" imports.

**Solution**: Force usage:
```javascript
import * as MyLibrary from 'my-library';
window.MyLibrary = MyLibrary;
console.log('Library loaded:', Object.keys(MyLibrary));
```

### Pitfall 4: Coordinate System Issues
**Problem**: Board flip for different player perspectives breaks positioning.

**Solution**: Implement coordinate conversion:
```javascript
getDisplayCoordinates(logicalRow, logicalCol) {
  if (this.isFlipped) {
    return {
      row: 7 - logicalRow,
      col: 7 - logicalCol
    };
  }
  return { row: logicalRow, col: logicalCol };
}
```

## Step-by-Step Deployment Process

### Step 1: Prepare Your Web App
1. Ensure it works at 240x320 resolution
2. Test all functionality in a browser
3. Add R1 hardware integration (optional but recommended)

### Step 2: Create RABBITOS.md
```markdown
# 🐰 RABBIT R1 CREATION AGENT INSTRUCTIONS

**PLUGIN NAME**: Your App Name

## BUILD INSTRUCTIONS

1. **Create plugin configuration files**:
   \`\`\`bash
   cd apps/app

   cat > plugin.json << 'EOF'
   {
     "manifest_version": 1,
     "name": "Your App Name",
     "version": "1.0.0",
     "entry": "dist/index.html"
   }
   EOF
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Build the app**:
   \`\`\`bash
   npm run build
   \`\`\`

4. **Verify the build**:
   \`\`\`bash
   ls -la dist/
   # Should contain index.html and assets/
   \`\`\`

5. **Deploy the dist folder**
```

### Step 3: Create Deployment Package
```bash
#!/bin/bash
# deploy-r1.sh

# Create package structure
mkdir -p rabbitos-package/apps/app
cp -r app/* rabbitos-package/apps/app/
cp RABBITOS.md rabbitos-package/

# Create zip
zip -r your-app-r1-source.zip rabbitos-package/*

echo "Package ready: your-app-r1-source.zip"
```

### Step 4: Deploy with Creation Agent
1. Upload the zip file to the Creation Agent
2. Tell it: "Please build the [App Name] plugin from the provided source package. Follow RABBITOS.md instructions exactly."
3. Monitor the build output
4. Verify the plugin name matches your intended name

## Testing Your App

### Local Testing (240x320 viewport)
```javascript
// Test with Puppeteer
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: { width: 240, height: 320 }
});

const page = await browser.newPage();
await page.goto('http://localhost:5173');
```

### R1 Hardware Simulation
```javascript
// Simulate R1 hardware events in browser
document.addEventListener('keydown', (e) => {
  if (!isR1) {
    switch(e.key) {
      case 'ArrowUp':
        window.dispatchEvent(new CustomEvent('scrollUp'));
        break;
      case 'ArrowDown':
        window.dispatchEvent(new CustomEvent('scrollDown'));
        break;
      case 'p':
        window.dispatchEvent(new CustomEvent('sideClick'));
        break;
    }
  }
});
```

## Troubleshooting Guide

### Issue: "undefined is not an object"
**Cause**: Dependency not properly bundled.
**Fix**: Check import pattern and force usage with console.log.

### Issue: Plugin named incorrectly
**Cause**: Missing configuration files.
**Fix**: Create plugin.json with correct name.

### Issue: 403 error loading resources
**Cause**: Separate resource files not accessible.
**Fix**: Import resources as ES6 modules to bundle them.

### Issue: Build succeeds but app doesn't work
**Cause**: Tree-shaking removed "unused" code.
**Fix**: Add explicit usage or adjust Vite config.

### Issue: Audio doesn't play
**Cause**: Chrome autoplay policy.
**Fix**: Initialize AudioContext on user interaction.

## Best Practices

### 1. Always Include Verification Steps
```markdown
6. **Verify chess engine is bundled**:
   \`\`\`bash
   grep -c "ChessEngine" dist/assets/main-*.js
   # Should return a number > 0
   \`\`\`
```

### 2. Document Expected Output
```markdown
✅ BUILD VERIFICATION CHECKLIST
- [ ] dist/index.html exists
- [ ] dist/assets/main-*.js created
- [ ] Total dist size < 300KB
```

### 3. Provide Fallback Solutions
```markdown
## Common Failures and Solutions

| Problem | Solution |
|---------|----------|
| Dependency not found | Run `npm install` first |
| Build fails | Delete dist/ and try again |
```

### 4. Test Everything Locally First
- Build the production version locally
- Test at 240x320 resolution
- Verify all features work
- Check console for errors

### 5. Keep Your Instructions DRY
Don't repeat complex commands. Use shell scripts:
```bash
# In RABBITOS.md, reference a script instead of inline commands
./build-plugin.sh
```

## Example Success Story: Chess R1

Our Chess game deployment succeeded by:
1. Converting inline IIFE to ES6 imports
2. Creating explicit plugin.json with "Chess R1" name
3. Embedding sound data in main bundle
4. Adding Chrome audio initialization
5. Providing step-by-step RABBITOS.md instructions
6. Including verification steps

**Result**: Clean deployment with all features working!

## Final Checklist

Before deploying to Rabbit R1:
- [ ] App works at 240x320 resolution
- [ ] RABBITOS.md file created with explicit instructions
- [ ] Plugin configuration files specify correct name
- [ ] Dependencies use proper ES6 imports
- [ ] Resources are bundled (not separate files)
- [ ] Chrome audio initialization implemented
- [ ] Protective comments added to source files
- [ ] Build verification steps included
- [ ] Local testing completed successfully

## Resources

- **Viewport Testing**: Use browser DevTools device mode
- **R1 Screen**: 240x320 pixels, portrait orientation
- **Build Tool**: Vite recommended for ES6 module support
- **Testing Tool**: Puppeteer for automated testing

## Key Takeaway

The Rabbit R1 Creation Agent is powerful but literal. It will do exactly what you tell it - nothing more, nothing less. Success comes from:
1. **Explicit instructions** in RABBITOS.md
2. **Proper module imports** to prevent tree-shaking
3. **Configuration files** for plugin naming
4. **Bundled resources** to avoid 403 errors
5. **Verification steps** to ensure success

Follow this guide, and your R1 app deployment will succeed on the first try!

---

*This guide is based on real-world experience deploying Chess R1 to the Rabbit device. Every issue and solution documented here was encountered and solved during actual development.*