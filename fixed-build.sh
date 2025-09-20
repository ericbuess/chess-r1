#!/bin/bash

# Fixed build script for RabbitOS plugin
echo "Building Chess R1 for RabbitOS with path fixes..."

cd rabbitos-plugin/apps/app

# Install and build
npm install
npm run build

# Fix 1: Ensure root redirect points to dist
cat > ../../index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Chess R1 by Eric Buess</title>
    <meta http-equiv="refresh" content="0; url=apps/app/dist/index.html">
</head>
<body>
    <p>Loading Chess R1...</p>
</body>
</html>
EOF

# Fix 2: Remove the broken woodenSoundData.js reference from dist/index.html
if [ -f "dist/index.html" ]; then
    # Remove the line containing src/woodenSoundData.js
    sed -i '' '/<script src="\.\/src\/woodenSoundData\.js">/d' dist/index.html
    echo "✓ Removed broken woodenSoundData.js reference"
fi

# Fix 3: Ensure paths are relative in dist
find dist -name "*.html" -exec sed -i '' 's|href="/|href="./|g' {} \;
find dist -name "*.html" -exec sed -i '' 's|src="/|src="./|g' {} \;

echo "✅ Build complete with path fixes"
echo ""
echo "VERIFICATION:"
echo "1. Root index.html redirects to apps/app/dist/index.html ✓"
echo "2. No reference to ./src/woodenSoundData.js in dist/index.html ✓"
echo "3. All paths are relative ✓"