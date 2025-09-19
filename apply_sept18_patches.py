#!/usr/bin/env python3
"""
Apply September 18 evening patches to main.js
"""

import json
from pathlib import Path

def apply_patches():
    # Load patches
    patches_file = Path("/Users/ericbuess/Projects/chess-r1/sept18_evening_patches.json")
    with open(patches_file, 'r') as f:
        data = json.load(f)

    patches = data['patches']

    print(f"Applying {len(patches)} patches...")

    # Group patches by file
    files_to_patch = {}
    for patch in patches:
        file_path = patch['file']
        if file_path not in files_to_patch:
            files_to_patch[file_path] = []
        files_to_patch[file_path].append(patch)

    # Apply patches to each file
    for file_path, file_patches in files_to_patch.items():
        file_obj = Path(file_path)
        print(f"\nPatching {file_obj.name} with {len(file_patches)} patches...")

        # Read current file content
        with open(file_obj, 'r') as f:
            content = f.read()

        # Apply each patch to this file
        for patch in file_patches:
            if patch['old_code'] in content:
                content = content.replace(patch['old_code'], patch['new_code'])
                print(f"✓ Applied: {patch['description']}")
            else:
                print(f"⚠ Skipped: {patch['description']} (code not found)")

        # Write back to file
        with open(file_obj, 'w') as f:
            f.write(content)

    print("\nAll patches applied successfully!")

if __name__ == "__main__":
    apply_patches()
