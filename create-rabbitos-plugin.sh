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

# Update version in index.html if present
sed -i '' 's/v0\.0\.1/v0.0.2/g' rabbitos-plugin/apps/app/index.html

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
echo "Generated project ID: $(cat .project-name)"
cd ../../..

# Create package
cd rabbitos-plugin
zip -r ../chess-r1-v0.0.2-plugin.zip .
cd ..

echo "✅ Plugin package created: chess-r1-v0.0.2-plugin.zip"
echo "Ready for upload to RabbitOS Creation Agent"
echo ""
echo "Instructions for Creation Agent:"
echo "--------------------------------"
echo "Please deploy Chess R1 by Eric Buess v0.0.2 to the Rabbit R1 device."
echo ""
echo "IMPORTANT: This package contains SOURCE files, not built files."
echo "- apps/app/src/ contains all source code"
echo "- apps/app/index.html references /src/ paths"
echo "- Just extract and deploy as-is"
echo ""
echo "The game uses:"
echo "- Scroll wheel: Undo/Redo moves"
echo "- PTT button: Options menu"
echo "- Touch: Piece selection"
echo "- Long press: New game"