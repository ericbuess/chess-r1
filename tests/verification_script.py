#!/usr/bin/env python3
"""
Verification Script for Chess R1 Code Changes

Compares current main.js with extracted patches to identify:
1. Which patches are already applied in current code
2. Which patches are missing or partially applied
3. Potential conflicts or inconsistencies

This helps verify the completeness of code recovery.
"""

import json
import os
import re
import sys
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import difflib

class CodeVerifier:
    def __init__(self, patches_file: str, main_js_path: str):
        self.patches_file = patches_file
        self.main_js_path = main_js_path

        self.patches = []
        self.current_code = ""

        self.applied_patches = []
        self.missing_patches = []
        self.partial_patches = []

    def load_patches(self) -> bool:
        """Load extracted patches from JSON file"""
        try:
            with open(self.patches_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.patches = data.get('patches', [])
                print(f"✅ Loaded {len(self.patches)} patches from {self.patches_file}")
                return True
        except Exception as e:
            print(f"❌ Error loading patches: {e}")
            return False

    def load_current_code(self) -> bool:
        """Load current main.js content"""
        try:
            with open(self.main_js_path, 'r', encoding='utf-8') as f:
                self.current_code = f.read()
                print(f"✅ Loaded current code from {self.main_js_path} ({len(self.current_code)} chars)")
                return True
        except Exception as e:
            print(f"❌ Error loading current code: {e}")
            return False

    def normalize_code(self, code: str) -> str:
        """Normalize code for comparison by removing extra whitespace"""
        # Remove leading/trailing whitespace from each line
        lines = [line.strip() for line in code.split('\n')]
        # Remove empty lines
        lines = [line for line in lines if line]
        # Join back
        return '\n'.join(lines)

    def find_code_in_current(self, search_code: str, context_lines: int = 3) -> List[Tuple[int, str]]:
        """Find occurrences of code in current file with line numbers"""
        if not search_code.strip():
            return []

        search_normalized = self.normalize_code(search_code)
        current_lines = self.current_code.split('\n')

        matches = []

        # Try exact match first
        if search_code in self.current_code:
            # Find line number
            for i, line in enumerate(current_lines):
                if search_code in line:
                    matches.append((i + 1, line))

        # Try normalized match
        if not matches:
            current_normalized = self.normalize_code(self.current_code)
            if search_normalized in current_normalized:
                matches.append((0, "Found in normalized content"))

        # Try partial matches (80% similarity)
        if not matches:
            for i, line in enumerate(current_lines):
                similarity = difflib.SequenceMatcher(None, search_normalized, self.normalize_code(line)).ratio()
                if similarity > 0.8:
                    matches.append((i + 1, line))

        return matches

    def check_patch_applied(self, patch: Dict[str, Any]) -> Dict[str, Any]:
        """Check if a specific patch is applied"""
        result = {
            'patch': patch,
            'status': 'unknown',
            'old_code_found': False,
            'new_code_found': False,
            'old_code_locations': [],
            'new_code_locations': [],
            'confidence': 0.0,
            'notes': []
        }

        old_code = patch.get('old_code', '').strip()
        new_code = patch.get('new_code', '').strip()

        if not old_code and not new_code:
            result['status'] = 'empty'
            result['notes'].append("Both old and new code are empty")
            return result

        # Check for old code (shouldn't be present if patch is applied)
        if old_code:
            old_matches = self.find_code_in_current(old_code)
            result['old_code_found'] = len(old_matches) > 0
            result['old_code_locations'] = old_matches

        # Check for new code (should be present if patch is applied)
        if new_code:
            new_matches = self.find_code_in_current(new_code)
            result['new_code_found'] = len(new_matches) > 0
            result['new_code_locations'] = new_matches

        # Determine status
        if old_code and new_code:
            if not result['old_code_found'] and result['new_code_found']:
                result['status'] = 'applied'
                result['confidence'] = 0.9
                result['notes'].append("Old code not found, new code found - patch appears applied")
            elif result['old_code_found'] and not result['new_code_found']:
                result['status'] = 'not_applied'
                result['confidence'] = 0.9
                result['notes'].append("Old code found, new code not found - patch not applied")
            elif not result['old_code_found'] and not result['new_code_found']:
                result['status'] = 'unknown'
                result['confidence'] = 0.1
                result['notes'].append("Neither old nor new code found - unclear status")
            elif result['old_code_found'] and result['new_code_found']:
                result['status'] = 'partial'
                result['confidence'] = 0.5
                result['notes'].append("Both old and new code found - possible partial application")
        elif new_code and not old_code:
            # Write operation or addition
            if result['new_code_found']:
                result['status'] = 'applied'
                result['confidence'] = 0.8
                result['notes'].append("New code found - addition/write appears applied")
            else:
                result['status'] = 'not_applied'
                result['confidence'] = 0.8
                result['notes'].append("New code not found - addition/write not applied")
        elif old_code and not new_code:
            # Deletion
            if not result['old_code_found']:
                result['status'] = 'applied'
                result['confidence'] = 0.8
                result['notes'].append("Old code not found - deletion appears applied")
            else:
                result['status'] = 'not_applied'
                result['confidence'] = 0.8
                result['notes'].append("Old code found - deletion not applied")

        return result

    def verify_all_patches(self) -> Dict[str, Any]:
        """Verify all patches against current code"""
        print("🔍 Starting patch verification...")

        verification_results = []
        status_counts = {
            'applied': 0,
            'not_applied': 0,
            'partial': 0,
            'unknown': 0,
            'empty': 0
        }

        # Filter patches for main.js
        main_js_patches = [p for p in self.patches if 'main.js' in p.get('file', '')]
        other_patches = [p for p in self.patches if 'main.js' not in p.get('file', '')]

        print(f"📝 Found {len(main_js_patches)} patches for main.js")
        print(f"📝 Found {len(other_patches)} patches for other files")

        # Verify main.js patches
        for i, patch in enumerate(main_js_patches, 1):
            print(f"🔄 Verifying patch {i}/{len(main_js_patches)}: {patch.get('operation', 'Unknown')} at {patch.get('timestamp', 'Unknown time')}")

            result = self.check_patch_applied(patch)
            verification_results.append(result)

            status = result['status']
            status_counts[status] += 1

            if status == 'applied':
                self.applied_patches.append(result)
            elif status == 'not_applied':
                self.missing_patches.append(result)
            elif status == 'partial':
                self.partial_patches.append(result)

        # Create summary
        summary = {
            'total_patches_checked': len(main_js_patches),
            'status_counts': status_counts,
            'confidence_score': sum(r['confidence'] for r in verification_results) / len(verification_results) if verification_results else 0,
            'main_js_patches': len(main_js_patches),
            'other_file_patches': len(other_patches),
            'verification_timestamp': os.path.getctime(self.main_js_path)
        }

        result = {
            'summary': summary,
            'verification_results': verification_results,
            'applied_patches': self.applied_patches,
            'missing_patches': self.missing_patches,
            'partial_patches': self.partial_patches,
            'other_file_patches': other_patches
        }

        return result

    def find_critical_missing_features(self, verification_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify critical missing features from the target list"""
        critical_features = [
            "saveGameState",
            "restoreGameState",
            "autoSave",
            "Ella, Evy, Emmy, Asa",
            "difficulty tracking",
            "back to game button"
        ]

        missing_critical = []

        for patch_result in verification_result['missing_patches']:
            patch = patch_result['patch']
            features = patch.get('features', [])

            # Check if this patch contains critical features
            for feature in critical_features:
                if any(feature.lower() in f.lower() for f in features):
                    missing_critical.append({
                        'feature': feature,
                        'patch': patch,
                        'timestamp': patch.get('timestamp'),
                        'old_code': patch.get('old_code', '')[:200] + "..." if len(patch.get('old_code', '')) > 200 else patch.get('old_code', ''),
                        'new_code': patch.get('new_code', '')[:200] + "..." if len(patch.get('new_code', '')) > 200 else patch.get('new_code', '')
                    })

        return missing_critical

    def generate_report(self, verification_result: Dict[str, Any]) -> str:
        """Generate a human-readable verification report"""
        summary = verification_result['summary']

        report = []
        report.append("=" * 80)
        report.append("CHESS R1 CODE VERIFICATION REPORT")
        report.append("=" * 80)
        report.append("")

        # Summary
        report.append("📊 SUMMARY:")
        report.append(f"   • Total patches checked: {summary['total_patches_checked']}")
        report.append(f"   • Applied patches: {summary['status_counts']['applied']}")
        report.append(f"   • Missing patches: {summary['status_counts']['not_applied']}")
        report.append(f"   • Partial patches: {summary['status_counts']['partial']}")
        report.append(f"   • Unknown status: {summary['status_counts']['unknown']}")
        report.append(f"   • Confidence score: {summary['confidence_score']:.1%}")
        report.append("")

        # Applied patches
        if verification_result['applied_patches']:
            report.append("✅ APPLIED PATCHES:")
            for result in verification_result['applied_patches'][:10]:  # Show first 10
                patch = result['patch']
                report.append(f"   • {patch.get('timestamp', 'Unknown')}: {patch.get('operation', 'Unknown')} - {result['notes'][0] if result['notes'] else 'Applied'}")

            if len(verification_result['applied_patches']) > 10:
                report.append(f"   ... and {len(verification_result['applied_patches']) - 10} more")
            report.append("")

        # Missing patches
        if verification_result['missing_patches']:
            report.append("❌ MISSING PATCHES:")
            for result in verification_result['missing_patches']:
                patch = result['patch']
                report.append(f"   • {patch.get('timestamp', 'Unknown')}: {patch.get('operation', 'Unknown')}")
                if patch.get('features'):
                    report.append(f"     Features: {', '.join(patch['features'])}")
                if patch.get('new_code'):
                    preview = patch['new_code'][:100].replace('\n', ' ')
                    report.append(f"     Code: {preview}...")
                report.append("")

        # Critical missing features
        critical_missing = self.find_critical_missing_features(verification_result)
        if critical_missing:
            report.append("🚨 CRITICAL MISSING FEATURES:")
            for item in critical_missing:
                report.append(f"   • {item['feature']} (from {item['timestamp']})")
                report.append(f"     Code preview: {item['new_code'][:150]}...")
                report.append("")

        # Partial patches
        if verification_result['partial_patches']:
            report.append("⚠️  PARTIAL PATCHES (need investigation):")
            for result in verification_result['partial_patches']:
                patch = result['patch']
                report.append(f"   • {patch.get('timestamp', 'Unknown')}: {patch.get('operation', 'Unknown')}")
                report.append(f"     Status: {result['notes'][0] if result['notes'] else 'Partial'}")
                report.append("")

        # Other files
        if verification_result['other_file_patches']:
            report.append("📁 OTHER FILES WITH PATCHES:")
            file_counts = {}
            for patch in verification_result['other_file_patches']:
                file_path = patch.get('file', 'unknown')
                file_counts[file_path] = file_counts.get(file_path, 0) + 1

            for file_path, count in sorted(file_counts.items()):
                report.append(f"   • {file_path}: {count} patches")
            report.append("")

        report.append("=" * 80)

        return "\n".join(report)

def main():
    """Main execution function"""
    patches_file = "/Users/ericbuess/Projects/chess-r1/all_patches_extracted.json"
    main_js_path = "/Users/ericbuess/Projects/chess-r1/app/src/main.js"

    if not os.path.exists(patches_file):
        print(f"❌ Patches file not found: {patches_file}")
        print("   Please run extraction_script.py first")
        return False

    if not os.path.exists(main_js_path):
        print(f"❌ Main.js file not found: {main_js_path}")
        return False

    verifier = CodeVerifier(patches_file, main_js_path)

    # Load data
    if not verifier.load_patches():
        return False

    if not verifier.load_current_code():
        return False

    # Run verification
    verification_result = verifier.verify_all_patches()

    # Generate and save report
    report = verifier.generate_report(verification_result)

    report_file = "/Users/ericbuess/Projects/chess-r1/verification_report.txt"
    try:
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"💾 Verification report saved to: {report_file}")
    except Exception as e:
        print(f"❌ Error saving report: {e}")

    # Save detailed results
    results_file = "/Users/ericbuess/Projects/chess-r1/verification_results.json"
    try:
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(verification_result, f, indent=2, ensure_ascii=False)
        print(f"💾 Detailed results saved to: {results_file}")
    except Exception as e:
        print(f"❌ Error saving detailed results: {e}")

    # Print summary
    print("\n" + report)

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)