# Chess R1 Project - Claude Instructions

## 🎯 SINGLE SOURCE OF TRUTH PRINCIPLE

**CRITICAL ARCHITECTURAL RULE**: js-chess-engine is the ONLY source of truth for:
- Chess rules and move validation
- Game state (check, checkmate, stalemate)
- Legal moves calculation
- Bot move generation

**NEVER** create custom chess logic that duplicates engine functionality:
- ❌ Don't write custom check/checkmate detection
- ❌ Don't implement custom move validation
- ❌ Don't maintain duplicate game state
- ✅ Always delegate to `this.engine` for chess logic
- ✅ UI code should only handle display, not chess rules

**Why This Matters**: Duplicate logic causes state conflicts, bugs, and maintenance nightmares. Let the proven chess engine handle ALL chess logic.

## 📁 Project Structure

- **Main App**: `/Users/ericbuess/Projects/chess-r1/app`
- **Source**: `/app/src/main.js`
- **Dev Server**: Port 5187
- **Viewport**: 240x320 (Rabbit R1 dimensions)

## 🚀 Rabbit R1 Deployment

**CRITICAL**: Use RABBITOS.md for all plugin creation. This file contains the unified, proven approach.

**Key Discovery**: RabbitOS Creation Agent expects SOURCE files, not built dist files.
- Provide source structure with `/src/` paths
- Let the Agent handle the build process
- See RABBITOS.md for complete instructions

**NEVER prepare the final Rabbit package until user explicitly says:**
- "Prepare the Rabbit package"
- "Create the upload package"
- "Ready for Rabbit upload"
- Or similar explicit approval

## 📊 Performance Requirements

**Target Performance:**
- Bot response time: < 2 seconds ✅
- Undo/redo operation: < 5ms ✅
- Move validation: Instant (<10ms) ✅
- Memory usage: < 5MB for R1 constraints ✅
- Chess rules compliance: 100% ✅

## 🎮 Features

- **Game Modes**: Human vs Bot, Human vs Human
- **Bot Difficulties**: Ella (Normal), Evy (Hard), Emmy (Harder), Asa (Hardest)
- **Save/Restore**: Game state persists across sessions
- **Undo/Redo**: Full move history support
- **Keyboard Shortcuts**:
  - **P**: Options menu
  - **Left Arrow**: Undo move
  - **Right Arrow**: Redo move

## 💬 Dialogue System

**Filler-First Approach**: Most moves show simple filler phrases ("Hmm...", "...", "*thinking*") with special commentary reserved for key moments.

**Probability Distribution**:
- **Key Moments** (0% filler): Checkmate, checks, queen captures, game end
- **Minor Events** (85% filler): Other captures, castling, special moves
- **Regular Moves** (95% filler): Standard piece movements

**Features**:
- Tracks last 5 fillers to avoid repetition
- Dialogue frequency: 1-3 moves between dialogues (controlled by dialogueManager)
- Three bot personalities + royal king personalities for Human vs Human
- Context-aware selection based on game phase and momentum