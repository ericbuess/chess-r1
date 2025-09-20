#!/bin/bash

# RabbitOS Plugin Build Script for Chess R1
# This script prepares the app for deployment as a RabbitOS plugin

echo "Building Chess R1 for RabbitOS..."

# Generate unique project identifier (13 characters)
PROJECT_NAME=$(head -c 13 /dev/urandom | base64 | tr -d '\n' | tr '+/' 'ab' | cut -c 1-13)
echo "$PROJECT_NAME" > .project-name
echo "Project ID: $PROJECT_NAME"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Fix paths to be relative (critical for plugin compatibility)
echo "Converting paths to relative..."

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  find dist -name "*.html" -exec sed -i '' 's|href="/|href="./|g' {} \;
  find dist -name "*.html" -exec sed -i '' 's|src="/|src="./|g' {} \;
  find dist -name "*.js" -exec sed -i '' 's|from "/|from "./|g' {} \;
  find dist -name "*.js" -exec sed -i '' 's|import("/|import("./|g' {} \;
  # Fix CSS imports in JS files
  find dist -name "*.js" -exec sed -i '' 's|"/assets/|"./assets/|g' {} \;
else
  # Linux
  find dist -name "*.html" -exec sed -i 's|href="/|href="./|g' {} \;
  find dist -name "*.html" -exec sed -i 's|src="/|src="./|g' {} \;
  find dist -name "*.js" -exec sed -i 's|from "/|from "./|g' {} \;
  find dist -name "*.js" -exec sed -i 's|import("/|import("./|g' {} \;
  # Fix CSS imports in JS files
  find dist -name "*.js" -exec sed -i 's|"/assets/|"./assets/|g' {} \;
fi

# Copy assets if they exist in src but not in dist
if [ -f "../../icon.png" ] && [ ! -f "dist/icon.png" ]; then
  cp ../../icon.png dist/
fi

if [ -f "../../screenshot.jpg" ] && [ ! -f "dist/screenshot.jpg" ]; then
  cp ../../screenshot.jpg dist/
fi

echo ""
echo "✅ Build complete for RabbitOS plugin!"
echo "📁 Output directory: dist/"
echo "🆔 Project ID: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "1. Test locally by opening dist/index.html in browser"
echo "2. Create plugin package: cd ../.. && zip -r chess-r1-plugin.zip ."
echo "3. Upload to RabbitOS Creation Agent"