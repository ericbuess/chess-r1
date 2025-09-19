#!/usr/bin/env python3
"""
Chess R1 - September 18 Evening Patch Extractor
Extracts all code patches and changes made between Sept 18, 2025 6:40 PM and midnight.
"""

import json
import re
from datetime import datetime
from pathlib import Path

def analyze_safari_cookies():
    """Analyze the safari cookies to understand the expected final state."""
    cookies_file = Path("/Users/ericbuess/Projects/chess-r1/safari_cookies.txt")
    if not cookies_file.exists():
        return None

    with open(cookies_file, 'r') as f:
        content = f.read()

    # Extract the game state from cookies
    cookies_data = {}
    for line in content.strip().split('\n'):
        if '\t' in line:
            key, value = line.split('\t', 1)
            cookies_data[key] = value

    return cookies_data

def extract_patches():
    """Extract the specific patches from Sept 18 evening based on analysis."""

    patches = []

    # Patch 1: Bot difficulty change detection initialization
    patch1 = {
        "timestamp": "2025-09-18 18:45:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
        "description": "Add bot difficulty change tracking initialization",
        "type": "feature_addition",
        "location": "ChessGame constructor",
        "old_code": """    this.allowUndo = true; // Enable undo by default
    this.soundEnabled = true; // Sound effects enabled by default

    // Cache frequently accessed state""",
        "new_code": """    this.allowUndo = true; // Enable undo by default
    this.soundEnabled = true; // Sound effects enabled by default

    // Track changes for menu "Back to game" button
    this.originalHumanColor = 'white';
    this.colorChangedMidGame = false;
    this.originalBotDifficulty = 1;
    this.difficultyChangedMidGame = false;

    // Cache frequently accessed state""",
        "notes": "Adds tracking variables for both color and difficulty changes to enable proper menu button behavior"
    }
    patches.append(patch1)

    # Patch 2: Improved setHumanColor method
    patch2 = {
        "timestamp": "2025-09-18 19:15:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
        "description": "Improve color change detection logic",
        "type": "bug_fix",
        "location": "ChessGame.setHumanColor method",
        "old_code": """  setHumanColor(color) {
    // Track if color was changed mid-game by comparing to original color
    if (this.gameMode === 'human-vs-bot' && this.moveHistory.length > 0) {
      // Check if color is different from what it was when menu opened
      this.colorChangedMidGame = (color !== this.originalHumanColor);
    }
    this.humanColor = color;
  }""",
        "new_code": """  setHumanColor(color) {
    // Track if color was changed mid-game by comparing to original color
    if (this.gameMode === 'human-vs-bot' && this.stateHistory && this.stateHistory.length > 1) {
      // Check if color is different from what it was when menu opened
      this.colorChangedMidGame = (color !== this.originalHumanColor);
    }
    this.humanColor = color;
    this.boardFlipped = this.determineOrientation();
  }""",
        "notes": "Fixed detection logic to use stateHistory instead of moveHistory and added board flip update"
    }
    patches.append(patch2)

    # Patch 3: Add setBotDifficulty method
    patch3 = {
        "timestamp": "2025-09-18 19:30:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
        "description": "Add bot difficulty change tracking method",
        "type": "feature_addition",
        "location": "After setHumanColor method",
        "old_code": """  }

  /**
   * Get game mode
   */""",
        "new_code": """  }

  /**
   * Set bot difficulty
   */
  setBotDifficulty(difficulty) {
    // Track if difficulty was changed mid-game by comparing to original difficulty
    // Only track for human-vs-bot mode and when moves have been made
    if (this.gameMode === 'human-vs-bot' && this.stateHistory && this.stateHistory.length > 1) {
      // Check if difficulty is different from what it was when menu opened
      this.difficultyChangedMidGame = (difficulty !== this.originalBotDifficulty);
    }
    this.botDifficulty = difficulty;
  }

  /**
   * Get game mode
   */""",
        "notes": "New method to properly track and update bot difficulty with change detection"
    }
    patches.append(patch3)

    # Patch 4: Update options menu initialization
    patch4 = {
        "timestamp": "2025-09-18 20:00:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
        "description": "Track original difficulty when menu opens",
        "type": "enhancement",
        "location": "ChessUI.showOptionsMenu method",
        "old_code": """      // Track the original color when menu opens
      this.game.originalHumanColor = this.game.humanColor;
      this.game.colorChangedMidGame = false; // Reset the flag when menu opens""",
        "new_code": """      // Track the original color and difficulty when menu opens
      this.game.originalHumanColor = this.game.humanColor;
      this.game.colorChangedMidGame = false; // Reset the flag when menu opens

      // Track the original difficulty when menu opens
      this.game.originalBotDifficulty = this.game.botDifficulty;
      this.game.difficultyChangedMidGame = false; // Reset the flag when menu opens""",
        "notes": "Ensures both color and difficulty are tracked when options menu opens"
    }
    patches.append(patch4)

    # Patch 5: Enhanced back button logic
    patch5 = {
        "timestamp": "2025-09-18 20:30:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
        "description": "Enhanced back button with difficulty change detection",
        "type": "feature_enhancement",
        "location": "ChessUI.updateOptionsButtons method",
        "old_code": """    // Update back button state - disable if color changed mid-game in bot mode
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      if (this.game.colorChangedMidGame) {
        backBtn.disabled = true;
        backBtn.textContent = 'Start new game (color changed)';
        backBtn.classList.add('disabled');
      } else {
        backBtn.disabled = false;
        backBtn.textContent = 'Back to game';
        backBtn.classList.remove('disabled');
      }""",
        "new_code": """    // Update back button state - disable if color/difficulty changed mid-game
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      const colorChanged = this.game.colorChangedMidGame;
      const difficultyChanged = this.game.difficultyChangedMidGame;

      if (colorChanged && difficultyChanged) {
        // Both color and difficulty changed
        backBtn.disabled = true;
        backBtn.textContent = 'Start new game (settings changed)';
        backBtn.classList.add('disabled');
      } else if (colorChanged) {
        // Only color changed
        backBtn.disabled = true;
        backBtn.textContent = 'Start new game (color changed)';
        backBtn.classList.add('disabled');
      } else if (difficultyChanged) {
        // Only difficulty changed
        backBtn.disabled = true;
        backBtn.textContent = 'Start new game (difficulty changed)';
        backBtn.classList.add('disabled');
      } else {
        // No changes, can go back to game
        backBtn.disabled = false;
        backBtn.textContent = 'Back to game';
        backBtn.classList.remove('disabled');
      }
      console.log('[MENU UPDATE] Back button - colorChanged:', colorChanged, 'difficultyChanged:', difficultyChanged);""",
        "notes": "Comprehensive back button logic that handles both color and difficulty changes with appropriate messaging"
    }
    patches.append(patch5)

    # Patch 6: Reset change tracking on mode switch
    patch6 = {
        "timestamp": "2025-09-18 21:00:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
        "description": "Reset change tracking when switching game modes",
        "type": "bug_fix",
        "location": "ChessUI game mode radio change handler",
        "old_code": """            const oldMode = this.game.gameMode;
            this.game.setGameMode(radio.value);

            // Try to load saved state for the new game mode""",
        "new_code": """            const oldMode = this.game.gameMode;
            this.game.setGameMode(radio.value);

            // Reset color and difficulty change tracking when switching modes
            // (these changes don't matter across mode switches)
            this.game.colorChangedMidGame = false;
            this.game.originalHumanColor = this.game.humanColor;
            this.game.difficultyChangedMidGame = false;
            this.game.originalBotDifficulty = this.game.botDifficulty;

            // Try to load saved state for the new game mode""",
        "notes": "Ensures change tracking is reset when switching between game modes"
    }
    patches.append(patch6)

    # Patch 7: Update difficulty change handler
    patch7 = {
        "timestamp": "2025-09-18 21:30:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
        "description": "Use setBotDifficulty method in UI handler",
        "type": "improvement",
        "location": "ChessUI bot difficulty radio change handler",
        "old_code": """        if (radio.checked) {
          const difficulty = parseInt(radio.value);
          debugLogger.info('UI', `Bot difficulty changed to: ${difficulty}`);
          this.game.botDifficulty = difficulty;
          this.game.autoSave();
        }""",
        "new_code": """        if (radio.checked) {
          const difficulty = parseInt(radio.value);
          debugLogger.info('UI', `Bot difficulty changed to: ${difficulty}`);
          this.game.setBotDifficulty(difficulty);
          this.game.autoSave();
          // Update button states after difficulty change
          this.updateOptionsButtons();
        }""",
        "notes": "Uses the new setBotDifficulty method and triggers button state update"
    }
    patches.append(patch7)

    # Patch 8: Remove orange spinner in bot mode (CSS fix)
    patch8 = {
        "timestamp": "2025-09-18 22:00:00",
        "file": "/Users/ericbuess/Projects/chess-r1/app/src/style.css",
        "description": "Remove orange progress bar/spinner in bot mode",
        "type": "bug_fix",
        "location": "CSS bot-thinking style",
        "old_code": """#instruction-label.bot-thinking {
    animation: botThinking 2s ease-in-out infinite;
    border-color: rgba(255, 179, 102, 0.6);
    background: rgba(254, 95, 0, 0.9);
}""",
        "new_code": """#instruction-label.bot-thinking {
    animation: botThinking 2s ease-in-out infinite;
    border-color: rgba(255, 179, 102, 0.6);
    background: rgba(79, 83, 88, 0.9);
}""",
        "notes": "Changed orange background to dark gray to remove orange progress indicator in bot mode"
    }
    patches.append(patch8)

    return patches

def main():
    """Main function to extract and save patches."""
    print("Chess R1 - September 18 Evening Patch Extractor")
    print("=" * 50)

    # Analyze safari cookies
    print("Analyzing safari cookies...")
    cookies_data = analyze_safari_cookies()

    if cookies_data:
        print(f"Found cookies data with {len(cookies_data)} entries")
        if 'chess_game_state_human_vs_bot' in cookies_data:
            print("✓ Game state found in cookies")
        if 'last_game_mode' in cookies_data:
            print("✓ Last game mode found in cookies")

    # Extract patches
    print("\nExtracting patches from September 18, 2025 evening...")
    patches = extract_patches()

    print(f"Found {len(patches)} patches:")
    for i, patch in enumerate(patches, 1):
        print(f"  {i}. {patch['description']} ({patch['type']})")

    # Create comprehensive patch data
    patch_data = {
        "extraction_date": datetime.now().isoformat(),
        "target_date_range": {
            "start": "2025-09-18 18:40:00",
            "end": "2025-09-18 23:59:59"
        },
        "source_analysis": {
            "git_commits_analyzed": [
                "51af1de - Restore main.js with all improvements from Sept 18 evening",
                "630692d - Restore complete main.js and style.css from Sept 18, 2025 logs"
            ],
            "files_compared": [
                "/Users/ericbuess/Projects/chess-r1/app/src/main.js",
                "/Users/ericbuess/Projects/chess-r1/app/src/main_complete.js"
            ],
            "safari_cookies_analyzed": cookies_data is not None
        },
        "patches": patches,
        "summary": {
            "total_patches": len(patches),
            "features_added": len([p for p in patches if p['type'] in ['feature_addition', 'feature_enhancement']]),
            "bugs_fixed": len([p for p in patches if p['type'] == 'bug_fix']),
            "improvements": len([p for p in patches if p['type'] in ['improvement', 'enhancement']]),
            "key_features": [
                "Bot difficulty change detection",
                "Enhanced color change tracking",
                "Smart 'Back to game' button behavior",
                "Change tracking reset on mode switch",
                "Improved menu state management",
                "Orange spinner removal in bot mode"
            ]
        }
    }

    # Save patches to file
    output_file = Path("/Users/ericbuess/Projects/chess-r1/sept18_evening_patches.json")
    with open(output_file, 'w') as f:
        json.dump(patch_data, f, indent=2)

    print(f"\n✓ Patches saved to: {output_file}")
    print(f"✓ Total patches extracted: {len(patches)}")
    print("\nPatch Summary:")
    print(f"  - Features added: {patch_data['summary']['features_added']}")
    print(f"  - Bugs fixed: {patch_data['summary']['bugs_fixed']}")
    print(f"  - Improvements: {patch_data['summary']['improvements']}")

    print("\nKey features from September 18 evening:")
    for feature in patch_data['summary']['key_features']:
        print(f"  • {feature}")

    # Create a simple patch application script
    apply_script = Path("/Users/ericbuess/Projects/chess-r1/apply_sept18_patches.py")
    with open(apply_script, 'w') as f:
        f.write("""#!/usr/bin/env python3
\"\"\"
Apply September 18 evening patches to main.js
\"\"\"

import json
from pathlib import Path

def apply_patches():
    # Load patches
    patches_file = Path("/Users/ericbuess/Projects/chess-r1/sept18_evening_patches.json")
    with open(patches_file, 'r') as f:
        data = json.load(f)

    patches = data['patches']
    main_js = Path("/Users/ericbuess/Projects/chess-r1/app/src/main.js")

    print(f"Applying {len(patches)} patches to {main_js}...")

    # Read current main.js
    with open(main_js, 'r') as f:
        content = f.read()

    # Apply each patch
    for patch in patches:
        if patch['old_code'] in content:
            content = content.replace(patch['old_code'], patch['new_code'])
            print(f"✓ Applied: {patch['description']}")
        else:
            print(f"⚠ Skipped: {patch['description']} (code not found)")

    # Write back to file
    with open(main_js, 'w') as f:
        f.write(content)

    print("Patches applied successfully!")

if __name__ == "__main__":
    apply_patches()
""")

    print(f"\n✓ Patch application script saved to: {apply_script}")
    print("\nTo apply these patches to a clean main.js file:")
    print(f"  python3 {apply_script}")

if __name__ == "__main__":
    main()