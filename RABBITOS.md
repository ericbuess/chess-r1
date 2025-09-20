# RabbitOS Plugin Guide - Chess R1 by Eric Buess

## 🎯 Key Discovery: Source-Based Deployment Works

**CRITICAL INSIGHT**: The RabbitOS Creation Agent expects SOURCE files, not pre-built dist files. The working structure provides source files with absolute paths (`/src/`) and lets the Agent handle the build process.

## ✅ Working Plugin Structure

```
chess-r1-plugin/
├── index.html                    # Root redirect to apps/app/index.html
└── apps/
    └── app/
        ├── .project-name         # 13-char unique identifier
        ├── package.json          # Minimal Vite setup
        ├── vite.config.js        # base: './' for relative paths
        ├── index.html            # App entry with /src/ paths
        └── src/                  # SOURCE FILES (not built)
            ├── main.js          # Complete game (~4195 lines)
            ├── style.css        # R1-optimized styles
            ├── woodenSoundData.js
            └── lib/
                ├── device-controls.js
                ├── flutter-channel.js
                └── ui-design.js
```

## 📦 Creating the Plugin Package

### Step 1: Prepare Source Structure
```bash
# Create plugin directory
mkdir -p rabbitos-plugin/apps/app/src/lib

# Copy source files (not built files!)
cp -r app/src/* rabbitos-plugin/apps/app/src/
cp app/index.html rabbitos-plugin/apps/app/
cp app/package.json rabbitos-plugin/apps/app/
cp app/vite.config.js rabbitos-plugin/apps/app/
```

### Step 2: Update index.html Paths
The app's `index.html` should use absolute paths:
```html
<link rel="stylesheet" href="/src/style.css" />
<script type="module" src="/src/main.js"></script>
<script src="/src/woodenSoundData.js"></script>
```

### Step 3: Create Root Redirect
Create `rabbitos-plugin/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chess R1 by Eric Buess</title>
    <meta http-equiv="refresh" content="0; url=apps/app/index.html">
</head>
<body>
    <p>Loading Chess R1...</p>
</body>
</html>
```

### Step 4: Generate Project ID
```bash
cd rabbitos-plugin/apps/app
echo $(head -c 13 /dev/urandom | base64 | tr -d '\n' | tr '+/' 'ab') > .project-name
```

### Step 5: Package for Upload
```bash
cd rabbitos-plugin
zip -r ../chess-r1-v0.0.2-plugin.zip .
```

## 📝 Instructions for RabbitOS Creation Agent

When uploading to the Creation Agent, use these instructions:

```
Please deploy Chess R1 by Eric Buess v0.0.2 to the Rabbit R1 device.

IMPORTANT: This package contains SOURCE files, not built files. The structure is:
- apps/app/src/ contains all source code
- apps/app/index.html references /src/ paths
- No dist folder is needed or provided

Just extract and deploy as-is. The app uses:
- Scroll wheel: Undo/Redo moves
- PTT button: Options menu
- Touch: Piece selection
- Long press: New game

The game is ready to run with the provided source structure.
```

## ⚠️ Common Issues & Solutions

### Issue: 404 Errors
**Cause**: Files placed at wrong directory level
**Solution**: Ensure index.html is at `apps/app/index.html` and source files are in `apps/app/src/`

### Issue: Build Failures
**Cause**: Agent trying to build when not needed
**Solution**: Emphasize that SOURCE files are ready to run as-is

### Issue: Path Errors
**Cause**: Relative vs absolute path confusion
**Solution**: Use `/src/` paths in HTML, let Agent handle conversion

## 🔧 Technical Details

### Package.json (Minimal)
```json
{
  "name": "chess-r1-by-eric-buess",
  "version": "0.0.2",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.20"
  }
}
```

### Vite Config
```javascript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### Required Modifications to main.js
1. ✅ Remove all console.log statements (already done)
2. ✅ Remove keyboard 'P' handler (already done)
3. ✅ Ensure debugLogger is no-op (already done)
4. ✅ Bundle js-chess-engine directly (already done)

## 📊 Validation Checklist

Before creating plugin package:
- [ ] Source files in `apps/app/src/` (not dist/)
- [ ] index.html uses `/src/` paths
- [ ] No console.log statements
- [ ] .project-name file exists
- [ ] Version shows 0.0.2
- [ ] Root redirect exists
- [ ] No .git or .md files (except this guide)

## 🚀 Quick Conversion Command

For future conversions from browser app to plugin:

```bash
# Run this from chess-r1 root
./create-rabbitos-plugin.sh
```

This script (create below) automates the entire process.

## 🛠️ Automation Script

Create `create-rabbitos-plugin.sh`:
```bash
#!/bin/bash

# Chess R1 to RabbitOS Plugin Converter
echo "Creating RabbitOS plugin package..."

# Clean up old plugin
rm -rf rabbitos-plugin
rm -f chess-r1-v*.zip

# Create structure
mkdir -p rabbitos-plugin/apps/app/src/lib

# Copy source files (not built!)
cp -r app/src/* rabbitos-plugin/apps/app/src/
cp app/index.html rabbitos-plugin/apps/app/
cp app/package.json rabbitos-plugin/apps/app/
cp app/vite.config.js rabbitos-plugin/apps/app/

# Update version in package.json
sed -i '' 's/"version": ".*"/"version": "0.0.2"/' rabbitos-plugin/apps/app/package.json

# Create root redirect
cat > rabbitos-plugin/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chess R1 by Eric Buess</title>
    <meta http-equiv="refresh" content="0; url=apps/app/index.html">
</head>
<body>
    <p>Loading Chess R1...</p>
</body>
</html>
EOF

# Generate project ID
cd rabbitos-plugin/apps/app
echo $(head -c 13 /dev/urandom | base64 | tr -d '\n' | tr '+/' 'ab') > .project-name
cd ../../..

# Create package
cd rabbitos-plugin
zip -r ../chess-r1-v0.0.2-plugin.zip .
cd ..

echo "✅ Plugin package created: chess-r1-v0.0.2-plugin.zip"
echo "Ready for upload to RabbitOS Creation Agent"
```

## 📚 Key Learnings

1. **Source > Built**: Creation Agent prefers source files
2. **Absolute Paths**: Use `/src/` in HTML, Agent converts
3. **Simple Structure**: Avoid complex dist builds
4. **Minimal Dependencies**: Only Vite needed
5. **Let Agent Build**: Don't pre-build, let Agent handle it

## 🎮 Game Features

- **Modes**: Human vs Bot (4 difficulties), Human vs Human
- **Controls**: Touch, scroll wheel, PTT button
- **Persistence**: Auto-save/restore game state
- **Optimized**: 240x320 display, < 5MB memory
- **Version**: 0.0.2 Production Ready

---

**Remember**: When in doubt, provide SOURCE files with `/src/` paths and let the Creation Agent handle the rest. This approach has proven successful where dist-based deployments failed.