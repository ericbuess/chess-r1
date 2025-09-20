# RabbitOS Plugin Conversion Guide

This guide documents how to convert the browser-based Chess R1 app to a RabbitOS plugin format.

## Quick Conversion Steps

If you need to convert the latest browser app to a RabbitOS plugin:

```bash
# 1. Ensure you're on dev branch with latest changes
git checkout dev

# 2. Run the conversion (Claude can do this automatically)
# The conversion creates a rabbitos-plugin/ subdirectory with the transformed files
```

## Directory Structure Transformation

### From Browser App:
```
chess-r1/
├── app/
│   ├── src/
│   │   ├── main.js
│   │   ├── style.css
│   │   ├── woodenSoundData.js
│   │   └── lib/
│   │       ├── device-controls.js
│   │       ├── flutter-channel.js
│   │       └── ui-design.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
├── CLAUDE.md
└── PLAN.md
```

### To RabbitOS Plugin:
```
rabbitos-plugin/
├── index.html                    # Top-level redirect
└── apps/
    └── app/
        ├── .project-name         # Unique 13-char identifier
        ├── build.sh              # Build automation script
        ├── package.json          # Minimal dependencies
        ├── vite.config.js        # base: './' for relative paths
        ├── index.html            # App entry point
        ├── src/                  # Source files (unchanged structure)
        │   ├── main.js          # With modifications (see below)
        │   ├── style.css
        │   ├── woodenSoundData.js
        │   └── lib/
        │       ├── device-controls.js
        │       ├── flutter-channel.js
        │       └── ui-design.js
        └── dist/                 # Built output
            ├── index.html
            ├── assets/
            │   ├── main-[hash].js
            │   └── main-[hash].css
            ├── icon.png          # 240x240 chess icon
            └── screenshot.jpg    # Game preview
```

## File Modifications

### 1. Remove Documentation Files
- ❌ Remove `README.md`
- ❌ Remove `CLAUDE.md`
- ❌ Remove `PLAN.md`
- ❌ Remove `.env` files
- ✅ Keep `RABBITOS_CONVERSION.md` (this file) in root for reference

### 2. Create Top-Level Redirect
Create `rabbitos-plugin/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chess R1</title>
    <meta http-equiv="refresh" content="0; url=apps/app/dist/index.html">
</head>
<body>
    <p>If you are not redirected automatically, follow this
    <a href="apps/app/dist/index.html">link</a>.</p>
</body>
</html>
```

### 3. Update vite.config.js
```javascript
// Change base path from absolute to relative
export default defineConfig({
  base: './',  // CRITICAL: Was '/', now './'
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
```

### 4. Update package.json
```json
{
  "name": "chess-r1-by-eric-buess",
  "version": "0.0.2",  // Update version
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.20"
  }
  // Note: js-chess-engine is bundled in main.js, not a dependency
}
```

### 5. Modify main.js

#### Remove Keyboard 'P' Handler
```javascript
// REMOVE this block:
document.addEventListener('keydown', (event) => {
  if (event.key === 'p' || event.key === 'P') {
    document.getElementById('sideButton')?.click();
  }
});

// The PTT/side button handler remains:
window.addEventListener('sideClick', () => {
  document.getElementById('sideButton')?.click();
});
```

#### Ensure No Console Logging
- All `console.log`, `console.error`, `console.warn` should already be removed
- `debugLogger` should be no-op functions

### 6. Create Build Script
Create `rabbitos-plugin/apps/app/build.sh`:
```bash
#!/bin/bash

# Generate unique project identifier
PROJECT_NAME=$(head -c 13 /dev/urandom | base64 | tr -d '\n' | tr '+/' 'ab')
echo "$PROJECT_NAME" > .project-name

# Install dependencies
npm install

# Build the project
npm run build

# Fix paths to be relative (critical for plugin)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  find dist -name "*.html" -exec sed -i '' 's|href="/|href="./|g' {} \;
  find dist -name "*.html" -exec sed -i '' 's|src="/|src="./|g' {} \;
  find dist -name "*.js" -exec sed -i '' 's|from "/|from "./|g' {} \;
else
  # Linux
  find dist -name "*.html" -exec sed -i 's|href="/|href="./|g' {} \;
  find dist -name "*.html" -exec sed -i 's|src="/|src="./|g' {} \;
  find dist -name "*.js" -exec sed -i 's|from "/|from "./|g' {} \;
fi

echo "Build complete for RabbitOS plugin"
```

### 7. Create .project-name File
Generate a unique 13-character identifier:
```bash
head -c 13 /dev/urandom | base64 | tr -d '\n' | tr '+/' 'ab' > .project-name
```

## Assets Required

### icon.png (240x240)
- Chess piece icon (king or board)
- PNG format, transparent background preferred
- Will be displayed in R1 plugin menu

### screenshot.jpg
- Game screenshot showing the chess board
- JPEG format
- Shows the game in action

## Input Handling Notes

### R1 Hardware Inputs
- **Scroll Wheel**: Already handled by `device-controls.js`
  - `scrollUp` event → Redo move
  - `scrollDown` event → Undo move
- **PTT/Side Button**: Opens options menu
  - `sideClick` event → Toggle options
- **Long Press**: New game
  - `longPressEnd` event → Start new game
- **Touch**: Piece selection and movement

### No Keyboard Shortcuts in Plugin
- Remove all keyboard event handlers except those needed for development
- R1 doesn't have a keyboard, only hardware buttons

## Build & Deployment Process

1. **Development Testing**:
   ```bash
   cd rabbitos-plugin/apps/app
   npm run dev
   # Test at http://localhost:5173 with 240x320 viewport
   ```

2. **Build for Production**:
   ```bash
   cd rabbitos-plugin/apps/app
   chmod +x build.sh
   ./build.sh
   ```

3. **Create Plugin Package**:
   ```bash
   cd rabbitos-plugin
   zip -r ../chess-r1-plugin.zip .
   ```

4. **Upload to RabbitOS Creation Agent**:
   - Upload the `chess-r1-plugin.zip` file
   - The agent should be able to unzip and deploy without modifications

## Validation Checklist

Before creating the plugin package:

- [ ] All paths are relative (no leading `/`)
- [ ] No console.log statements in code
- [ ] No documentation files (*.md) except this guide
- [ ] PTT button opens menu (not keyboard 'P')
- [ ] Has `.project-name` file with 13-char ID
- [ ] Has `build.sh` script with path fixes
- [ ] Has `icon.png` and `screenshot.jpg` in dist/
- [ ] `package.json` has minimal dependencies
- [ ] `vite.config.js` has `base: './'`
- [ ] Top-level `index.html` redirects to `apps/app/dist/index.html`
- [ ] Version bumped appropriately

## Important Notes

1. **Path Requirements**: All asset paths MUST be relative. The build script fixes this automatically.

2. **Dependencies**: The plugin should have minimal dependencies. js-chess-engine is bundled directly in main.js.

3. **Memory Constraints**: The plugin must work within R1's memory limits (< 5MB).

4. **No Git Directory**: The plugin package should not include `.git` directory.

5. **Testing**: Always test the built plugin by opening `dist/index.html` directly in a browser with a 240x320 viewport.

## Automated Conversion

Claude can perform this conversion automatically by:
1. Reading this guide
2. Creating the `rabbitos-plugin/` directory structure
3. Copying and transforming files according to the rules above
4. Building the plugin
5. Creating the zip package

Just ask: "Convert the chess app to RabbitOS plugin format using RABBITOS_CONVERSION.md"