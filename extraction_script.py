#!/usr/bin/env python3
"""
Comprehensive Claude Code Change Extraction Script for Chess R1 Project

Extracts ALL code changes from Claude session logs between:
- START: September 18, 2025 at 6:40 PM
- END: September 19, 2025 early morning when bot names were changed to "Ella, Evy, Emmy, Asa"

CRITICAL: This script finds EVERY Edit/MultiEdit/Write operation with exact before/after code.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pathlib import Path
import glob

class ClaudeCodeExtractor:
    def __init__(self):
        self.start_time = datetime(2025, 9, 18, 18, 40, 0, tzinfo=timezone.utc)  # 6:40 PM
        self.end_time = datetime(2025, 9, 19, 18, 0, 0, tzinfo=timezone.utc)    # Extended to capture all of Sep 19

        self.patches = []
        self.files_modified = set()

        # Claude logs directory
        self.claude_dir = "/Users/ericbuess/.claude/projects/-Users-ericbuess-Projects-chess-r1"

    def parse_timestamp(self, timestamp_str: str) -> Optional[datetime]:
        """Parse ISO timestamp from Claude logs"""
        try:
            return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        except:
            return None

    def is_in_time_range(self, timestamp_str: str) -> bool:
        """Check if timestamp is in our target range"""
        dt = self.parse_timestamp(timestamp_str)
        return dt and self.start_time <= dt <= self.end_time

    def extract_tool_use_operations(self, message_content: Any, timestamp: str, context: str = "") -> List[Dict[str, Any]]:
        """Extract tool_use operations from message content"""
        operations = []

        if isinstance(message_content, list):
            for item in message_content:
                if isinstance(item, dict) and item.get('type') == 'tool_use':
                    tool_name = item.get('name', '')
                    tool_input = item.get('input', {})

                    if tool_name in ['Edit', 'MultiEdit', 'Write']:
                        file_path = tool_input.get('file_path', 'unknown')

                        if tool_name == 'Edit':
                            old_code = tool_input.get('old_string', '')
                            new_code = tool_input.get('new_string', '')

                            operations.append({
                                'timestamp': timestamp,
                                'file': file_path,
                                'operation': 'Edit',
                                'old_code': old_code,
                                'new_code': new_code,
                                'context': context,
                                'tool_id': item.get('id', '')
                            })

                        elif tool_name == 'MultiEdit':
                            edits = tool_input.get('edits', [])
                            for edit in edits:
                                old_code = edit.get('old_string', '')
                                new_code = edit.get('new_string', '')

                                operations.append({
                                    'timestamp': timestamp,
                                    'file': file_path,
                                    'operation': 'MultiEdit',
                                    'old_code': old_code,
                                    'new_code': new_code,
                                    'context': context,
                                    'tool_id': item.get('id', '')
                                })

                        elif tool_name == 'Write':
                            new_code = tool_input.get('content', '')

                            operations.append({
                                'timestamp': timestamp,
                                'file': file_path,
                                'operation': 'Write',
                                'old_code': '',  # Write creates/overwrites entire file
                                'new_code': new_code,
                                'context': context,
                                'tool_id': item.get('id', '')
                            })

        return operations

    def extract_edit_operations(self, content: str, timestamp: str, context: str = "") -> List[Dict[str, Any]]:
        """Extract Edit tool operations with old_string and new_string (fallback method)"""
        operations = []

        # Pattern for Edit tool with old_string and new_string
        edit_pattern = r'"old_string":\s*"([^"]*(?:\\.[^"]*)*)"[^}]*"new_string":\s*"([^"]*(?:\\.[^"]*)*)"[^}]*"file_path":\s*"([^"]*)"'
        matches = re.findall(edit_pattern, content, re.DOTALL)

        for old_code, new_code, file_path in matches:
            # Unescape JSON strings
            old_code = old_code.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t')
            new_code = new_code.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t')

            operations.append({
                'timestamp': timestamp,
                'file': file_path,
                'operation': 'Edit',
                'old_code': old_code,
                'new_code': new_code,
                'context': context
            })

        return operations

    def extract_multiedit_operations(self, content: str, timestamp: str, context: str = "") -> List[Dict[str, Any]]:
        """Extract MultiEdit tool operations"""
        operations = []

        # Pattern for MultiEdit with edits array
        multiedit_pattern = r'"file_path":\s*"([^"]*)"[^}]*"edits":\s*\[(.*?)\]'
        file_matches = re.findall(multiedit_pattern, content, re.DOTALL)

        for file_path, edits_content in file_matches:
            # Extract individual edits
            edit_pattern = r'\{"old_string":\s*"([^"]*(?:\\.[^"]*)*)"[^}]*"new_string":\s*"([^"]*(?:\\.[^"]*)*)"[^}]*\}'
            edit_matches = re.findall(edit_pattern, edits_content)

            for old_code, new_code in edit_matches:
                # Unescape JSON strings
                old_code = old_code.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t')
                new_code = new_code.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t')

                operations.append({
                    'timestamp': timestamp,
                    'file': file_path,
                    'operation': 'MultiEdit',
                    'old_code': old_code,
                    'new_code': new_code,
                    'context': context
                })

        return operations

    def extract_write_operations(self, content: str, timestamp: str, context: str = "") -> List[Dict[str, Any]]:
        """Extract Write tool operations"""
        operations = []

        # Pattern for Write tool
        write_pattern = r'"file_path":\s*"([^"]*)"[^}]*"content":\s*"([^"]*(?:\\.[^"]*)*)"'
        matches = re.findall(write_pattern, content, re.DOTALL)

        for file_path, new_content in matches:
            # Unescape JSON strings
            new_content = new_content.replace('\\"', '"').replace('\\n', '\n').replace('\\t', '\t')

            operations.append({
                'timestamp': timestamp,
                'file': file_path,
                'operation': 'Write',
                'old_code': '',  # Write creates/overwrites entire file
                'new_code': new_content,
                'context': context
            })

        return operations

    def extract_code_from_response(self, content: str, timestamp: str) -> List[Dict[str, Any]]:
        """Extract code snippets from assistant responses"""
        code_changes = []

        # Look for code blocks that show before/after changes
        before_after_pattern = r'```(\w+)?\s*(?:// Before|// Old|// Original)?\s*(.*?)```\s*(?:.*?)\s*```(\w+)?\s*(?:// After|// New|// Updated)?\s*(.*?)```'
        matches = re.findall(before_after_pattern, content, re.DOTALL | re.IGNORECASE)

        for lang1, old_code, lang2, new_code in matches:
            if old_code.strip() and new_code.strip() and old_code.strip() != new_code.strip():
                code_changes.append({
                    'timestamp': timestamp,
                    'file': 'unknown',  # Will need to infer from context
                    'operation': 'CodeBlock',
                    'old_code': old_code.strip(),
                    'new_code': new_code.strip(),
                    'context': 'Manual code comparison'
                })

        return code_changes

    def find_target_features(self, content: str) -> List[str]:
        """Find mentions of target features"""
        found_features = []

        target_patterns = [
            r"save.*restore.*cookies",
            r"orange.*spinner.*removal",
            r"bot.*difficulty.*change",
            r"back.*to.*game.*button",
            r"bot.*names.*(Ella|Evy|Emmy|Asa)",
            r"(Ella|Evy|Emmy|Asa)",
            r"autoSave.*calls",
            r"async.*await.*fixes",
            r"localStorage.*cookie",
            r"bot.*move.*failed",
            r"saveGameState",
            r"restoreGameState",
            r"difficulty.*tracking",
            r"cookie.*functions",
            r"hardest.*difficulty"
        ]

        for pattern in target_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                found_features.append(pattern)

        return found_features

    def process_jsonl_file(self, file_path: str) -> int:
        """Process a single JSONL file and extract code changes"""
        changes_found = 0

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    try:
                        entry = json.loads(line.strip())

                        timestamp = entry.get('timestamp', '')
                        if not self.is_in_time_range(timestamp):
                            continue

                        # Get message content
                        message = entry.get('message', {})
                        if isinstance(message, dict):
                            content_list = message.get('content', [])

                            # First, try to extract tool_use operations directly
                            tool_ops = self.extract_tool_use_operations(content_list, timestamp, f"Line {line_num}")

                            for op in tool_ops:
                                # Look for key features in the operation content
                                combined_content = op['old_code'] + ' ' + op['new_code']
                                features = self.find_target_features(combined_content)
                                if features:
                                    op['features'] = features

                                self.patches.append(op)
                                self.files_modified.add(op['file'])
                                changes_found += 1

                            # Also parse text content for additional patterns
                            if isinstance(content_list, list):
                                for content_item in content_list:
                                    if isinstance(content_item, dict):
                                        content = content_item.get('text', '')
                                    else:
                                        content = str(content_item)

                                    # Extract various types of operations (fallback)
                                    edit_ops = self.extract_edit_operations(content, timestamp, f"Line {line_num}")
                                    multiedit_ops = self.extract_multiedit_operations(content, timestamp, f"Line {line_num}")
                                    write_ops = self.extract_write_operations(content, timestamp, f"Line {line_num}")
                                    code_ops = self.extract_code_from_response(content, timestamp)

                                    all_ops = edit_ops + multiedit_ops + write_ops + code_ops

                                    for op in all_ops:
                                        # Look for key features
                                        features = self.find_target_features(content)
                                        if features:
                                            op['features'] = features

                                        self.patches.append(op)
                                        self.files_modified.add(op['file'])
                                        changes_found += 1

                            elif isinstance(content_list, str):
                                # Handle direct string content
                                content = content_list
                                edit_ops = self.extract_edit_operations(content, timestamp, f"Line {line_num}")
                                multiedit_ops = self.extract_multiedit_operations(content, timestamp, f"Line {line_num}")
                                write_ops = self.extract_write_operations(content, timestamp, f"Line {line_num}")

                                all_ops = edit_ops + multiedit_ops + write_ops

                                for op in all_ops:
                                    features = self.find_target_features(content)
                                    if features:
                                        op['features'] = features

                                    self.patches.append(op)
                                    self.files_modified.add(op['file'])
                                    changes_found += 1

                    except json.JSONDecodeError:
                        continue
                    except Exception as e:
                        print(f"Error processing line {line_num} in {file_path}: {e}")
                        continue

        except Exception as e:
            print(f"Error reading {file_path}: {e}")

        return changes_found

    def run_extraction(self) -> Dict[str, Any]:
        """Run the complete extraction process"""
        print("🔍 Starting comprehensive Claude code change extraction...")
        print(f"📅 Time range: {self.start_time} to {self.end_time}")

        # Find all JSONL files in the target date range
        jsonl_files = glob.glob(os.path.join(self.claude_dir, "*.jsonl"))

        target_files = []
        for file_path in jsonl_files:
            stat = os.stat(file_path)
            file_time = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)

            # Include files modified within our time range or slightly before
            expanded_start = datetime(2025, 9, 18, 12, 0, 0, tzinfo=timezone.utc)  # Start earlier to catch session starts
            expanded_end = datetime(2025, 9, 19, 18, 0, 0, tzinfo=timezone.utc)   # End later to catch session ends

            if expanded_start <= file_time <= expanded_end:
                target_files.append(file_path)

        print(f"📁 Found {len(target_files)} potential log files to analyze")

        total_changes = 0
        for file_path in target_files:
            print(f"🔄 Processing: {os.path.basename(file_path)}")
            changes = self.process_jsonl_file(file_path)
            total_changes += changes
            print(f"   └── Found {changes} code changes")

        print(f"\n✅ Extraction complete!")
        print(f"📊 Total patches found: {len(self.patches)}")
        print(f"📝 Files modified: {len(self.files_modified)}")

        # Sort patches by timestamp
        self.patches.sort(key=lambda x: x['timestamp'])

        # Create summary
        summary = {
            "total_patches": len(self.patches),
            "files_modified": list(self.files_modified),
            "time_range": {
                "start": self.start_time.isoformat(),
                "end": self.end_time.isoformat()
            },
            "extraction_metadata": {
                "log_files_processed": len(target_files),
                "target_features_found": len([p for p in self.patches if 'features' in p])
            }
        }

        result = {
            "patches": self.patches,
            "summary": summary
        }

        return result

def main():
    """Main execution function"""
    extractor = ClaudeCodeExtractor()
    result = extractor.run_extraction()

    # Save results
    output_file = "/Users/ericbuess/Projects/chess-r1/all_patches_extracted.json"

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"💾 Results saved to: {output_file}")

        # Print summary
        summary = result['summary']
        print(f"\n📋 EXTRACTION SUMMARY:")
        print(f"   • Total patches: {summary['total_patches']}")
        print(f"   • Files modified: {len(summary['files_modified'])}")
        print(f"   • Target features found: {summary['extraction_metadata']['target_features_found']}")
        print(f"   • Log files processed: {summary['extraction_metadata']['log_files_processed']}")

        if summary['files_modified']:
            print(f"\n📁 Modified files:")
            for file_path in sorted(summary['files_modified']):
                count = len([p for p in result['patches'] if p['file'] == file_path])
                print(f"   • {file_path} ({count} changes)")

        return True

    except Exception as e:
        print(f"❌ Error saving results: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)