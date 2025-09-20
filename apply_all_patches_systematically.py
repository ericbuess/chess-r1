#!/usr/bin/env python3
"""
Systematically apply ALL patches from all_patches_extracted.json
This is a deterministic application - no creative solutions, just apply exact patches
"""

import json
import os
import sys

def main():
    # Load all patches
    with open('/Users/ericbuess/Projects/chess-r1/all_patches_extracted.json', 'r') as f:
        data = json.load(f)

    # Load current files
    main_js_path = '/Users/ericbuess/Projects/chess-r1/app/src/main.js'
    style_css_path = '/Users/ericbuess/Projects/chess-r1/app/src/style.css'

    with open(main_js_path, 'r') as f:
        main_js_content = f.read()

    with open(style_css_path, 'r') as f:
        style_css_content = f.read()

    # Track statistics
    total_patches = len(data['patches'])
    applied_count = 0
    already_applied = 0
    failed_count = 0
    skipped_count = 0

    print(f"📊 Processing {total_patches} patches from extraction")
    print("=" * 60)

    # Process each patch
    for i, patch in enumerate(data['patches'], 1):
        timestamp = patch.get('timestamp', 'Unknown')
        file_path = patch.get('file', '')
        old_code = patch.get('old_code', '')
        new_code = patch.get('new_code', '')

        # Skip patches without proper code
        if not new_code or not old_code:
            skipped_count += 1
            print(f"⏭️  [{i:3}/{total_patches}] {timestamp[:19]} - No code to apply")
            continue

        # Determine which file to update
        if 'main.js' in file_path:
            # Check if patch is already applied
            if new_code in main_js_content:
                already_applied += 1
                print(f"✓  [{i:3}/{total_patches}] {timestamp[:19]} - Already in main.js")
            elif old_code in main_js_content:
                # Apply the patch
                main_js_content = main_js_content.replace(old_code, new_code, 1)
                applied_count += 1
                print(f"✅ [{i:3}/{total_patches}] {timestamp[:19]} - APPLIED to main.js")
            else:
                # Neither old nor new code found - might be a different version
                failed_count += 1
                print(f"⚠️  [{i:3}/{total_patches}] {timestamp[:19]} - Cannot locate in main.js")
                print(f"    Looking for: {old_code[:50]}...")

        elif 'style.css' in file_path:
            # Check if patch is already applied
            if new_code in style_css_content:
                already_applied += 1
                print(f"✓  [{i:3}/{total_patches}] {timestamp[:19]} - Already in style.css")
            elif old_code in style_css_content:
                # Apply the patch
                style_css_content = style_css_content.replace(old_code, new_code, 1)
                applied_count += 1
                print(f"✅ [{i:3}/{total_patches}] {timestamp[:19]} - APPLIED to style.css")
            else:
                # Neither old nor new code found
                failed_count += 1
                print(f"⚠️  [{i:3}/{total_patches}] {timestamp[:19]} - Cannot locate in style.css")

        elif 'index.html' in file_path:
            # Load index.html if needed
            index_html_path = '/Users/ericbuess/Projects/chess-r1/app/index.html'
            if os.path.exists(index_html_path):
                with open(index_html_path, 'r') as f:
                    index_html_content = f.read()

                if new_code in index_html_content:
                    already_applied += 1
                    print(f"✓  [{i:3}/{total_patches}] {timestamp[:19]} - Already in index.html")
                elif old_code in index_html_content:
                    index_html_content = index_html_content.replace(old_code, new_code, 1)
                    applied_count += 1
                    print(f"✅ [{i:3}/{total_patches}] {timestamp[:19]} - APPLIED to index.html")
                    # Save index.html
                    with open(index_html_path, 'w') as f:
                        f.write(index_html_content)
                else:
                    failed_count += 1
                    print(f"⚠️  [{i:3}/{total_patches}] {timestamp[:19]} - Cannot locate in index.html")
        else:
            skipped_count += 1
            print(f"⏭️  [{i:3}/{total_patches}] {timestamp[:19]} - Unknown file: {file_path}")

    # Save updated files
    print("\n" + "=" * 60)
    print("💾 Saving updated files...")

    with open(main_js_path, 'w') as f:
        f.write(main_js_content)
    print(f"   ✅ Saved main.js")

    with open(style_css_path, 'w') as f:
        f.write(style_css_content)
    print(f"   ✅ Saved style.css")

    # Final summary
    print("\n" + "=" * 60)
    print("📊 FINAL SUMMARY")
    print("=" * 60)
    print(f"✅ Newly Applied: {applied_count}")
    print(f"✓  Already Applied: {already_applied}")
    print(f"⚠️  Failed to Apply: {failed_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"📋 Total Patches: {total_patches}")

    if failed_count > 0:
        print(f"\n⚠️  Warning: {failed_count} patches could not be applied")
        print("These may require manual review or the code has changed significantly")

    if applied_count > 0:
        print(f"\n✅ Successfully applied {applied_count} new patches!")
        print("Please test the application to verify all features are working")
    else:
        print(f"\n✓ All applicable patches were already applied")

    return applied_count > 0 or failed_count == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)