# Dialogue System Update Plan: Filler-First Approach

## 🎯 Objective
Transform the dialogue system from showing special phrases on every move to primarily using filler phrases, with special commentary reserved for key moments or random minor events.

## 📊 Current State Analysis

### Existing Filler Phrases
- **White King**: 30+ fillers including "Hm", "Indeed", "*adjusts crown*", Monty Python refs
- **Black King**: 45+ fillers including "...", "Mmm", "*shadows swirl*", dark themes
- **Bot Evy**: 50+ Gen Z fillers like "No cap", "Fr fr", "*sips espresso*"
- **Bot Emmy**: 45+ silly fillers like "Holy guacamole", "*twiddles thumbs*"
- **Bot Asa**: 40+ technical fillers like "Processing...", "*beep boop*"

### Current Behavior
- Dialogue shown on EVERY move
- Special phrases used for all categorized events
- No probability-based selection
- dialogueManager exists but not effectively utilized

## 🎲 New Probability System

### Event Classification
```javascript
const eventImportance = {
  // KEY MOMENTS (100% special dialogue)
  keyMoments: [
    'checkmate', 'humanCheck', 'botCheck', 'inCheck',
    'capturedQueen', 'promotion', 'gameEnd', 'resignation'
  ],

  // MINOR EVENTS (15% special, 85% filler)
  minorEvents: [
    'capturedPawn', 'capturedKnight', 'capturedBishop',
    'capturedRook', 'castling', 'enPassant', 'sacrifice',
    'brilliantMove', 'opening'
  ],

  // REGULAR MOVES (5% special, 95% filler)
  regularMoves: [
    'pawnMove', 'knightMove', 'bishopMove', 'rookMove',
    'queenMove', 'kingMove', 'middleGame', 'endgame',
    'winning', 'losing', 'tidesTurning'
  ]
};
```

### Dialogue Selection Logic
```javascript
function shouldUseFiller(category) {
  if (keyMoments.includes(category)) return false;
  if (minorEvents.includes(category)) return Math.random() > 0.15;
  return Math.random() > 0.05; // 95% filler for regular moves
}
```

## 🔧 Implementation Steps

### 1. Update main.js
- Modify `showBotDialogue()` to check probabilities
- Add `getEventImportance()` function
- Implement `selectDialogueWithProbability()` method
- Track last 5 filler phrases to avoid repetition

### 2. Enhance Filler Variety
- Add ultra-short fillers: ".", "...", "!", "?"
- Add more actions: "*thinking*", "*pondering*", "*calculating*"
- Ensure 60+ unique fillers per personality

### 3. Dialogue Frequency Adjustment
- Remove forceShow for non-key moments
- Use dialogueManager properly (1-3 moves between dialogues)
- Key moments always override frequency limits

### 4. Update Each Personality
- **White King**: More "Hm", "Indeed", less Shakespeare
- **Black King**: More "...", "*shadows*", less dramatic speech
- **Evy**: More "mhm", "bet", less full sentences
- **Emmy**: More "*giggles*", "ooh", less idioms
- **Asa**: More "Processing...", "*beep*", less facts

## 📈 Expected Dialogue Distribution

### Typical 40-Move Game
- **Moves 1-10 (Opening)**: 80% filler, 20% commentary
- **Moves 11-30 (Middle)**: 90% filler, 10% commentary
- **Moves 31-40 (Endgame)**: 70% filler, 30% commentary
- **Special Events**: 100% appropriate commentary

### Example Sequence
```
Move 1: e4 → "Hm..."
Move 2: e5 → "..."
Move 3: Nf3 → "*adjusts crown*"
Move 4: Nc6 → (no dialogue - frequency control)
Move 5: Bb5 → "Interesting..."
Move 6: a6 → (no dialogue)
Move 7: Bxc6 → "A knight falls! For the realm!" (15% chance triggered)
Move 8: dxc6 → "..."
Move 9: O-O → "*royal wave*"
Move 10: Nf6 → (no dialogue)
```

## 🧪 Testing Plan

1. **Opening Test**: Play 10 opening moves, verify mostly fillers
2. **Quiet Position**: Make 20 quiet moves, expect 90%+ fillers
3. **Tactical Sequence**: Force captures/checks, verify appropriate mix
4. **Endgame**: Test mate sequences, ensure key moments get commentary
5. **Repetition Check**: Verify no filler repeats within 5 moves

## 📝 Success Metrics

- ✅ 85-95% of regular moves show filler phrases
- ✅ 100% of key moments show special dialogue
- ✅ No filler repetition within 5-move window
- ✅ Natural conversation flow maintained
- ✅ Personality consistency preserved
- ✅ Performance unchanged (<10ms selection time)

## 🚀 Implementation Priority

1. **Phase 1**: Core probability system in main.js
2. **Phase 2**: Update bot dialogue selection
3. **Phase 3**: Update human v human dialogues
4. **Phase 4**: Test and refine probabilities
5. **Phase 5**: Add more filler variety if needed

## 💡 Key Insights

The goal is to make the chess game feel more natural, where the AI/characters mostly observe quietly with small reactions ("hmm", "...", "*thinking*"), but come alive with personality during important moments. This creates better pacing and makes special commentary more impactful when it does appear.