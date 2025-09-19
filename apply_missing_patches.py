#!/usr/bin/env python3
"""
Apply all missing patches from verification report
"""

import json
import os
import sys

def apply_patches():
    # Missing patch timestamps from verification report
    missing_timestamps = [
        '2025-09-18T21:27:06.972Z',
        '2025-09-18T21:27:18.918Z',
        '2025-09-18T21:27:33.606Z',
        '2025-09-18T22:06:36.809Z',
        '2025-09-18T22:06:44.505Z',
        '2025-09-18T22:07:30.382Z',
        '2025-09-18T22:07:42.403Z',
        '2025-09-18T22:13:24.075Z',
        '2025-09-18T22:13:41.540Z',
        '2025-09-18T22:13:57.952Z',
        '2025-09-18T22:15:17.986Z',
        '2025-09-18T22:15:55.944Z',
        '2025-09-18T22:16:08.787Z',
        '2025-09-18T22:20:28.255Z',
        '2025-09-18T22:24:52.055Z',
        '2025-09-18T22:40:20.103Z',
        '2025-09-18T23:38:43.199Z',
        '2025-09-18T23:38:53.142Z',
        '2025-09-19T01:20:24.191Z',
        '2025-09-19T01:20:44.214Z',
        '2025-09-19T01:33:18.115Z',
    ]

    # Load patches
    with open('/Users/ericbuess/Projects/chess-r1/all_patches_extracted.json') as f:
        data = json.load(f)

    # Load current main.js
    main_js_path = '/Users/ericbuess/Projects/chess-r1/app/src/main.js'
    with open(main_js_path, 'r') as f:
        current_code = f.read()

    patches_applied = 0
    patches_skipped = 0
    patches_failed = 0

    for timestamp in missing_timestamps:
        # Find patch with this timestamp
        patch_found = None
        for patch in data['patches']:
            if patch.get('timestamp') == timestamp and 'main.js' in patch.get('file', ''):
                patch_found = patch
                break

        if not patch_found:
            print(f"⚠️  Patch not found for timestamp: {timestamp}")
            continue

        old_code = patch_found.get('old_code', '')
        new_code = patch_found.get('new_code', '')

        if not old_code or not new_code:
            print(f"⚠️  Empty patch at {timestamp}")
            patches_skipped += 1
            continue

        # Check if old code exists in file
        if old_code in current_code:
            # Apply the patch
            current_code = current_code.replace(old_code, new_code, 1)
            patches_applied += 1
            print(f"✅ Applied patch from {timestamp}")
        elif new_code in current_code:
            # Already applied
            patches_skipped += 1
            print(f"⏭️  Patch from {timestamp} already applied")
        else:
            # Can't find old code
            patches_failed += 1
            print(f"❌ Failed to apply patch from {timestamp} - old code not found")
            print(f"   Old code preview: {old_code[:100]}...")

    # Save the updated file
    if patches_applied > 0:
        with open(main_js_path, 'w') as f:
            f.write(current_code)
        print(f"\n📊 Summary:")
        print(f"   • Patches applied: {patches_applied}")
        print(f"   • Patches skipped: {patches_skipped}")
        print(f"   • Patches failed: {patches_failed}")
        print(f"\n💾 Saved updated main.js")
        return True
    else:
        print(f"\n📊 No patches applied")
        print(f"   • Patches skipped: {patches_skipped}")
        print(f"   • Patches failed: {patches_failed}")
        return False

if __name__ == "__main__":
    success = apply_patches()
    sys.exit(0 if success else 1)