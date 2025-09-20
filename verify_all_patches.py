#!/usr/bin/env python3
"""
Verify ALL patches from all_patches_extracted.json are correctly applied
"""

import json
import os
import sys

def main():
    # Load all patches
    with open('/Users/ericbuess/Projects/chess-r1/all_patches_extracted.json') as f:
        data = json.load(f)

    # Group patches by file
    patches_by_file = {}
    for patch in data['patches']:
        file_path = patch.get('file', 'unknown')
        if file_path not in patches_by_file:
            patches_by_file[file_path] = []
        patches_by_file[file_path].append(patch)

    # Track verification
    total_patches = len(data['patches'])
    applied_count = 0
    missing_count = 0
    partial_count = 0

    print(f"📊 Total Patches in Extract: {total_patches}")
    print(f"📁 Files Modified: {len(patches_by_file)}")
    print()

    # Focus on main.js and style.css patches
    critical_files = [
        '/Users/ericbuess/Projects/chess-r1/app/src/main.js',
        '/Users/ericbuess/Projects/chess-r1/app/src/style.css'
    ]

    missing_patches = []

    for file_path in critical_files:
        if file_path in patches_by_file or any(file_path.endswith(os.path.basename(k)) for k in patches_by_file.keys()):
            # Find patches for this file
            file_patches = []
            for key in patches_by_file:
                if file_path.endswith(os.path.basename(key)):
                    file_patches = patches_by_file[key]
                    break

            if not file_patches:
                continue

            print(f"🔍 Checking {os.path.basename(file_path)}: {len(file_patches)} patches")

            # Load current file content
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    current_content = f.read()

                for patch in file_patches:
                    timestamp = patch.get('timestamp', 'Unknown')
                    old_code = patch.get('old_code', '')
                    new_code = patch.get('new_code', '')

                    # Check if new code exists in file
                    if new_code and new_code.strip() in current_content:
                        applied_count += 1
                        print(f"  ✅ {timestamp[:19]} - Applied")
                    elif old_code and old_code.strip() in current_content:
                        missing_count += 1
                        print(f"  ❌ {timestamp[:19]} - NOT APPLIED (old code still present)")
                        missing_patches.append({
                            'file': file_path,
                            'timestamp': timestamp,
                            'preview': new_code[:100] if new_code else 'No new code'
                        })
                    else:
                        # Can't determine status
                        partial_count += 1
                        print(f"  ⚠️  {timestamp[:19]} - Unknown status")

    print()
    print("=" * 60)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"✅ Applied: {applied_count}")
    print(f"❌ Not Applied: {missing_count}")
    print(f"⚠️  Unknown: {partial_count}")

    if missing_patches:
        print()
        print("🚨 MISSING CRITICAL PATCHES:")
        for mp in missing_patches[:10]:  # Show first 10
            print(f"  • {mp['timestamp']} in {os.path.basename(mp['file'])}")
            print(f"    Preview: {mp['preview']}...")

    # Save missing patches for application
    if missing_patches:
        with open('/Users/ericbuess/Projects/chess-r1/missing_patches.json', 'w') as f:
            json.dump(missing_patches, f, indent=2)
        print(f"\n💾 Saved {len(missing_patches)} missing patches to missing_patches.json")

    return missing_count == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)