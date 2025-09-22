#!/bin/bash

# Chess R1 Deployment Script
# Creates a clean source package for RabbitOS Creation Agent

echo "🐰 Chess R1 Source Package Script v0.0.2"
echo "========================================="

# Check we're in the right directory
if [ ! -f "app/src/main.js" ]; then
    echo "Error: Must run from chess-r1 project root"
    exit 1
fi

# Clean up any old packages
rm -rf rabbitos-plugin chess-r1-source-*.zip 2>/dev/null

# Create RabbitOS plugin structure
echo "Step 1: Creating RabbitOS plugin structure..."
mkdir -p rabbitos-plugin/apps/app

# Copy source files (not dist!)
echo "Step 2: Copying source files..."
cp -r app/index.html rabbitos-plugin/apps/app/
cp -r app/package.json rabbitos-plugin/apps/app/
cp -r app/vite.config.js rabbitos-plugin/apps/app/
cp -r app/src rabbitos-plugin/apps/app/

# Add RABBITOS.md to root of package
echo "Step 3: Adding RABBITOS.md instructions..."
cp RABBITOS.md rabbitos-plugin/

# Create the deployment package
echo "Step 4: Creating deployment package..."
cd rabbitos-plugin
zip -r ../chess-r1-source-v0.0.2.zip . -x "*.DS_Store" "*/node_modules/*" "*/dist/*"
cd ..

# Clean up temp directory
rm -rf rabbitos-plugin

echo "✅ Source package created successfully!"
echo ""
echo "📦 Package: chess-r1-source-v0.0.2.zip"
echo "📁 Structure:"
echo "   └── RABBITOS.md (Creation Agent instructions)"
echo "   └── apps/app/"
echo "       ├── index.html"
echo "       ├── package.json (includes js-chess-engine dependency)"
echo "       ├── vite.config.js"
echo "       └── src/"
echo "           ├── main.js (imports js-chess-engine via ES6)"
echo "           ├── style.css"
echo "           ├── woodenSoundData.js"
echo "           ├── chess-worker-inline.js"
echo "           └── lib/"
echo "               ├── device-controls.js"
echo "               ├── flutter-channel.js"
echo "               └── ui-design.js"
echo ""
echo "Ready for Creation Agent!"