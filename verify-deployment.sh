#!/bin/bash

echo "🔍 Verifying Chess R1 Deployment..."
echo "=================================="

# Check main.js
if [ -f "src/main.js" ]; then
    LINES=$(wc -l < src/main.js)
    echo "✓ main.js found: $LINES lines"

    if [ $LINES -lt 4000 ]; then
        echo "❌ ERROR: main.js only has $LINES lines (should be ~4195)"
        echo "   This appears to be the wrong file!"
        exit 1
    fi

    if grep -q "class ChessGame" src/main.js; then
        echo "✓ ChessGame class found"
    else
        echo "❌ ERROR: ChessGame class not found"
        exit 1
    fi

    if grep -q "class ChessUI" src/main.js; then
        echo "✓ ChessUI class found"
    else
        echo "❌ ERROR: ChessUI class not found"
        exit 1
    fi

    if grep -q "Ella.*Evy.*Emmy.*Asa" src/main.js; then
        echo "✓ Bot difficulties found (Ella, Evy, Emmy, Asa)"
    else
        echo "❌ ERROR: Bot difficulties missing"
        exit 1
    fi
else
    echo "❌ ERROR: src/main.js not found"
    exit 1
fi

# Check style.css
if [ -f "src/style.css" ]; then
    LINES=$(wc -l < src/style.css)
    echo "✓ style.css found: $LINES lines"

    if [ $LINES -lt 1000 ]; then
        echo "❌ ERROR: style.css only has $LINES lines (should be ~1036)"
        exit 1
    fi
else
    echo "❌ ERROR: src/style.css not found"
    exit 1
fi

# Check woodenSoundData.js
if [ -f "src/woodenSoundData.js" ]; then
    echo "✓ woodenSoundData.js found"
else
    echo "❌ ERROR: src/woodenSoundData.js MISSING - This is required!"
    exit 1
fi

# Check library files
for lib in device-controls.js flutter-channel.js ui-design.js; do
    if [ -f "src/lib/$lib" ]; then
        echo "✓ lib/$lib found"
    else
        echo "❌ ERROR: lib/$lib not found"
        exit 1
    fi
done

echo ""
echo "=================================="
echo "✅ All verification checks passed!"
echo "This is the correct Chess R1 deployment."
echo ""
echo "If you see a different version with:"
echo "- Only ~774 lines in main.js"
echo "- Missing bot difficulties"
echo "- Missing woodenSoundData.js"
echo "Then the wrong files were deployed!"