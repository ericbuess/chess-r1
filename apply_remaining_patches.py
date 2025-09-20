#!/usr/bin/env python3
"""
Apply all remaining patches that haven't been applied yet
"""

import json
import os
import sys

def apply_remaining_patches():
    # Load extracted patches
    with open('/Users/ericbuess/Projects/chess-r1/all_patches_extracted.json') as f:
        data = json.load(f)

    # List of missing patch timestamps from verification
    missing_timestamps = [
        '2025-09-18T22:06:56.174Z',
        '2025-09-18T22:14:06.093Z',
        '2025-09-18T22:21:25.505Z',
        '2025-09-18T22:21:41.176Z',  # Multiple patches at this timestamp
        '2025-09-18T22:27:54.308Z',
        '2025-09-18T22:28:09.996Z',
        '2025-09-19T13:26:23.530Z',  # Multiple patches at this timestamp
        '2025-09-19T13:34:15.724Z',
        '2025-09-19T01:32:36.605Z',  # CSS patch
        '2025-09-19T01:42:11.651Z',  # CSS patch
    ]

    # Load files
    main_js_path = '/Users/ericbuess/Projects/chess-r1/app/src/main.js'
    style_css_path = '/Users/ericbuess/Projects/chess-r1/app/src/style.css'

    with open(main_js_path, 'r') as f:
        main_js_content = f.read()

    with open(style_css_path, 'r') as f:
        style_css_content = f.read()

    patches_applied = 0
    patches_skipped = 0

    for patch in data['patches']:
        timestamp = patch.get('timestamp')

        # Check if this is a missing patch
        if timestamp in missing_timestamps:
            file_path = patch.get('file', '')
            old_code = patch.get('old_code', '')
            new_code = patch.get('new_code', '')

            if not old_code or not new_code:
                patches_skipped += 1
                continue

            # Determine which file to update
            if 'main.js' in file_path:
                if old_code in main_js_content:
                    main_js_content = main_js_content.replace(old_code, new_code, 1)
                    patches_applied += 1
                    print(f"✅ Applied patch {timestamp} to main.js")
                elif new_code in main_js_content:
                    patches_skipped += 1
                    print(f"⏭️  Patch {timestamp} already applied to main.js")
                else:
                    print(f"⚠️  Could not apply {timestamp} - old code not found in main.js")

            elif 'style.css' in file_path:
                if old_code in style_css_content:
                    style_css_content = style_css_content.replace(old_code, new_code, 1)
                    patches_applied += 1
                    print(f"✅ Applied patch {timestamp} to style.css")
                elif new_code in style_css_content:
                    patches_skipped += 1
                    print(f"⏭️  Patch {timestamp} already applied to style.css")
                else:
                    print(f"⚠️  Could not apply {timestamp} - old code not found in style.css")

    # Save updated files
    if patches_applied > 0:
        with open(main_js_path, 'w') as f:
            f.write(main_js_content)
        with open(style_css_path, 'w') as f:
            f.write(style_css_content)

        print(f"\n✅ Successfully applied {patches_applied} patches")
        print(f"⏭️  Skipped {patches_skipped} patches (already applied)")
        return True
    else:
        print(f"\n⚠️  No new patches applied")
        return False

if __name__ == "__main__":
    success = apply_remaining_patches()
    sys.exit(0 if success else 1)