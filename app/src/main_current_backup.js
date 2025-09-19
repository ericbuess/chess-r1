// R1 Chess Game
// Two-player chess game with full rule implementation including en passant

// ===========================================
// Simple Console Logging (Production)
// ===========================================

const debugLogger = {
  info: (category, message, data = null) => {
    if (data) console.log(`[${category}] ${message}`, data);
    else console.log(`[${category}] ${message}`);
  },
  warn: (category, message, data = null) => {
    if (data) console.warn(`[${category}] ${message}`, data);
    else console.warn(`[${category}] ${message}`);
  },
  error: (category, message, data = null) => {
    if (data) console.error(`[${category}] ${message}`, data);
    else console.error(`[${category}] ${message}`);
  },
  debug: (category, message, data = null) => {
    if (data) console.log(`[${category}] ${message}`, data);
    else console.log(`[${category}] ${message}`);
  }
};

// Check if running as R1 plugin
if (typeof PluginMessageHandler !== 'undefined') {
  console.log('Running as R1 Creation');
  debugLogger.info('SYSTEM', 'Running as R1 Creation');
} else {
  console.log('Running in browser mode');
  debugLogger.info('SYSTEM', 'Running in browser mode');
}

// ===========================================
// js-chess-engine Library Integration
// ===========================================

// Import js-chess-engine from node_modules
import { Game } from 'js-chess-engine';

// ===========================================
// Game Class
// ===========================================

class ChessGame {
  constructor() {
    debugLogger.info('GAME', 'Initializing new chess game');

    // Initialize the chess engine with starting position
    this.engine = new Game();

    // Initialize our properties
    this.currentPlayer = 'white';
    this.gameState = 'active'; // 'active', 'check', 'checkmate', 'stalemate'
    this.moveHistory = [];

    // UI-related properties
    this.selectedSquare = null;
    this.possibleMoves = [];
    this.boardFlipped = false;
    this.orientationMode = 'handoff'; // 'none', 'table', or 'handoff' for human vs human
    this.gameMode = 'human-vs-bot';
    this.humanColor = 'white';
    this.botDifficulty = 1; // Bot difficulty: 0=random, 1=easy, 2=medium, 3=hard, 4=expert
    this.allowUndo = true; // Enable undo by default
    this.soundEnabled = true; // Sound effects enabled by default

    // Track changes for menu "Back to game" button
    this.originalHumanColor = 'white';
    this.colorChangedMidGame = false;
    this.originalBotDifficulty = 1;
    this.difficultyChangedMidGame = false;

    // Cache frequently accessed state
    this.board = this.engineStateToBoard();

    // Human player name (hardcoded for now)
    this.humanPlayerName = "Eric";

    // Initialize sound management
    this.initializeSounds();

    debugLogger.info('GAME', 'Game initialization complete');
  }

  /**
   * Initialize sounds with simple fallbacks
   */
  initializeSounds() {
    this.sounds = {
      move: null,
      capture: null,
      check: null
    };

    // Try to create audio objects, but don't fail if they don't exist
    try {
      // These would be the actual sound files in a full implementation
      // For now, we'll use simple audio cues or silent operation
      this.sounds.move = new Audio(); // Empty audio object as placeholder
      this.sounds.capture = new Audio();
      this.sounds.check = new Audio();
    } catch (e) {
      debugLogger.info('SOUND', 'Audio not available, running in silent mode');
    }
  }

  /**
   * Play a sound effect if sound is enabled
   */
  playSound(soundType) {
    if (!this.soundEnabled) return;

    try {
      // In a full implementation, we would play actual sound files
      // For now, we'll just log the sound event
      debugLogger.info('SOUND', `Playing ${soundType} sound`);

      // The actual sound playing would happen here:
      // this.sounds[soundType]?.play();
    } catch (e) {
      debugLogger.warn('SOUND', `Failed to play ${soundType} sound:`, e);
    }
  }

  /**
   * Convert the chess engine's internal state to our board representation
   */
  engineStateToBoard() {
    const state = this.engine.exportJson();
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    console.log('[ENGINE->BOARD] Converting engine state');
    console.log('[ENGINE->BOARD] Total pieces in engine:', Object.keys(state.pieces).length);
    console.log('[ENGINE->BOARD] White pawns - E2:', state.pieces['E2'], 'E4:', state.pieces['E4']);
    console.log('[ENGINE->BOARD] Black pawns - E7:', state.pieces['E7'], 'E5:', state.pieces['E5']);

    for (const [square, piece] of Object.entries(state.pieces)) {
      const coords = this.squareToCoords(square);
      const parsedPiece = this.parsePiece(piece);

      // CRITICAL BUG FIX: Skip corrupted pieces that return null
      if (parsedPiece === null) {
        console.error(`[ENGINE->BOARD] Skipping corrupted piece at ${square}:`, piece);
        continue; // Don't place corrupted pieces on board
      }

      board[coords.row][coords.col] = parsedPiece;
      if (square === 'E2' || square === 'E4' || square === 'E7' || square === 'E5') {
        console.log(`[ENGINE->BOARD] Placing ${piece} (${parsedPiece.color} ${parsedPiece.type}) at ${square} -> board[${coords.row}][${coords.col}]`);
      }
    }

    console.log('[ENGINE->BOARD] Board after conversion - [6][4] (e2):', board[6][4], '[4][4] (e4):', board[4][4]);
    return board;
  }

  /**
   * Convert chess square notation to board coordinates
   */
  squareToCoords(square) {
    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    const file = square[0];
    const rank = square[1];

    const col = files.indexOf(file);
    const row = ranks.indexOf(rank);

    return { row, col };
  }

  /**
   * Parse engine piece notation to piece object
   */
  parsePiece(enginePiece) {
    // CRITICAL BUG FIX: Validate input to prevent corruption
    if (typeof enginePiece !== 'string') {
      console.error('[PARSE_PIECE] Invalid piece data:', enginePiece, 'Type:', typeof enginePiece);
      return null; // Return null for invalid pieces to filter them out
    }

    if (enginePiece.length !== 1) {
      console.error('[PARSE_PIECE] Invalid piece notation length:', enginePiece);
      return null;
    }

    const isWhite = enginePiece === enginePiece.toUpperCase();
    const pieceMap = {
      'K': 'king',
      'Q': 'queen',
      'R': 'rook',
      'B': 'bishop',
      'N': 'knight',
      'P': 'pawn'
    };

    const type = pieceMap[enginePiece.toUpperCase()];
    if (!type) {
      console.error('[PARSE_PIECE] Unknown piece type:', enginePiece);
      return null;
    }

    const color = isWhite ? 'white' : 'black';

    return { type, color };
  }

  /**
   * Convert from our UI coordinates to chess notation
   */
  coordinatesToSquare(row, col) {
    const file = String.fromCharCode(65 + col); // 0=A, 1=B, etc.
    const rank = 8 - row; // 0=8, 1=7, etc.
    return file + rank;
  }

  /**
   * Convert from chess notation to our UI coordinates
   */
  squareToCoordinates(square) {
    const file = square.charCodeAt(0) - 65; // A=0, B=1, etc.
    const rank = parseInt(square[1]) - 1;   // 1=0, 2=1, etc.
    return [7 - rank, file]; // Flip rank for display
  }

  /**
   * Get the piece at a specific square
   */
  getPieceAt(square) {
    const [row, col] = this.squareToCoordinates(square);
    return this.board[row][col];
  }

  /**
   * Get all possible moves for current player using the engine
   */
  getAllPossibleMoves() {
    try {
      const moves = this.engine.getMoves();
      debugLogger.debug('MOVES', 'All possible moves:', moves);
      return moves;
    } catch (e) {
      debugLogger.error('MOVES', 'Error getting possible moves:', e);
      return {};
    }
  }

  /**
   * Get possible moves for a piece at a specific square
   */
  getPossibleMovesForSquare(square) {
    const allMoves = this.getAllPossibleMoves();
    return allMoves[square] || [];
  }

  /**
   * Make a move using the engine and update our state
   */
  makeMove(fromSquare, toSquare, promotionPiece = null) {
    debugLogger.info('MOVE', `Attempting move from ${fromSquare} to ${toSquare}`);

    try {
      // Check if this is a valid move first
      const possibleMoves = this.getPossibleMovesForSquare(fromSquare);
      if (!possibleMoves.includes(toSquare)) {
        throw new Error(`Invalid move: ${fromSquare} to ${toSquare}`);
      }

      // Store previous state for potential undo
      const previousConfig = this.engine.exportJson();

      // Check if there's a piece being captured
      const capturedPiece = this.getPieceAt(toSquare);

      // Make the move in the engine
      this.engine.move(fromSquare, toSquare, promotionPiece);

      // Update our board representation
      this.board = this.engineStateToBoard();

      // Update current player
      const gameData = this.engine.exportJson();
      this.currentPlayer = gameData.turn;

      // Update game state
      this.updateGameState();

      // Add to move history
      this.moveHistory.push({
        from: fromSquare,
        to: toSquare,
        piece: this.getPieceAt(toSquare),
        captured: capturedPiece,
        promotion: promotionPiece,
        previousConfig: previousConfig
      });

      // Play appropriate sound
      if (capturedPiece) {
        this.playSound('capture');
      } else {
        this.playSound('move');
      }

      // Check for check and play sound if needed
      if (this.gameState === 'check') {
        this.playSound('check');
      }

      debugLogger.info('MOVE', `Move successful. New player: ${this.currentPlayer}, State: ${this.gameState}`);

      return true;
    } catch (e) {
      debugLogger.error('MOVE', `Move failed: ${e.message}`);
      return false;
    }
  }

  /**
   * Handle bot move logic
   */
  async makeBotMove() {
    if (this.currentPlayer !== this.getBotColor() || this.gameState !== 'active') {
      return false;
    }

    debugLogger.info('BOT', 'Bot thinking...');

    try {
      // Small delay to show "thinking" state
      await new Promise(resolve => setTimeout(resolve, 500));

      // IMPORTANT: aiMove() directly executes the move in the engine!
      // It doesn't just return a move suggestion - it plays it
      // Difficulty: 0 = random, 1 = easy, 2 = medium, 3 = hard, 4 = expert
      const aiMove = this.engine.aiMove(this.botDifficulty);
      console.log('[BOT] AI move EXECUTED by engine:', aiMove);

      // Since the engine already executed the move, we just need to update our UI state
      this.board = this.engineStateToBoard();

      // Update current player
      const gameData = this.engine.exportJson();
      this.currentPlayer = gameData.turn;

      // Update game state
      this.updateGameState();

      // Add to move history if we have the move details
      if (aiMove && typeof aiMove === 'object') {
        const fromSquare = Object.keys(aiMove)[0];
        const toSquare = aiMove[fromSquare];

        if (fromSquare && toSquare) {
          this.moveHistory.push({
            from: fromSquare,
            to: toSquare,
            piece: this.getPieceAt(toSquare),
            captured: null, // We don't have capture info from aiMove
            promotion: null,
            previousConfig: null // We don't have previous config
          });
        }
      }

      // Play move sound
      this.playSound('move');

      // Check for check and play sound if needed
      if (this.gameState === 'check') {
        this.playSound('check');
      }

      debugLogger.info('BOT', `Bot move complete. New state: ${this.gameState}`);
      return true;

    } catch (e) {
      debugLogger.error('BOT', `Bot move failed: ${e.message}`);
      return false;
    }
  }

  /**
   * Update game state based on current position
   */
  updateGameState() {
    try {
      const gameData = this.engine.exportJson();

      if (gameData.checkMate) {
        this.gameState = 'checkmate';
      } else if (gameData.check) {
        this.gameState = 'check';
      } else if (gameData.isFinished) {
        this.gameState = 'stalemate';
      } else {
        this.gameState = 'active';
      }

      debugLogger.debug('STATE', `Game state updated: ${this.gameState}`);
    } catch (e) {
      debugLogger.error('STATE', 'Error updating game state:', e);
    }
  }

  /**
   * Get the color the bot is playing
   */
  getBotColor() {
    return this.humanColor === 'white' ? 'black' : 'white';
  }

  /**
   * Check if it's the bot's turn
   */
  isBotTurn() {
    return this.gameMode === 'human-vs-bot' && this.currentPlayer === this.getBotColor();
  }

  /**
   * Check if it's the human's turn
   */
  isHumanTurn() {
    if (this.gameMode === 'human-vs-human') {
      return true;
    }
    return this.currentPlayer === this.humanColor;
  }

  /**
   * Get current turn display text
   */
  getCurrentTurnText() {
    if (this.gameState === 'checkmate') {
      const winner = this.currentPlayer === 'white' ? 'Black' : 'White';
      return `${winner} wins!`;
    }

    if (this.gameState === 'stalemate') {
      return 'Stalemate - Draw!';
    }

    if (this.gameMode === 'human-vs-bot') {
      if (this.isBotTurn()) {
        return `Bot thinking...`;
      } else {
        return `${this.humanPlayerName}'s turn`;
      }
    } else {
      // Human vs Human mode
      const currentPlayerName = this.currentPlayer === 'white' ? 'White' : 'Black';
      return `${currentPlayerName}'s turn`;
    }
  }

  /**
   * Start a new game
   */
  newGame() {
    debugLogger.info('GAME', 'Starting new game');

    // Reset the engine
    this.engine = new Game();

    // Reset game state
    this.currentPlayer = 'white';
    this.gameState = 'active';
    this.moveHistory = [];
    this.selectedSquare = null;
    this.possibleMoves = [];

    // Update board representation
    this.board = this.engineStateToBoard();

    // Reset the mid-game change tracking
    this.originalHumanColor = this.humanColor;
    this.colorChangedMidGame = false;
    this.originalBotDifficulty = this.botDifficulty;
    this.difficultyChangedMidGame = false;

    debugLogger.info('GAME', 'New game started');
  }

  /**
   * Undo the last move
   */
  undoLastMove() {
    if (!this.allowUndo || this.moveHistory.length === 0) {
      debugLogger.warn('UNDO', 'Cannot undo: no moves to undo or undo disabled');
      return false;
    }

    try {
      const lastMove = this.moveHistory.pop();

      if (lastMove.previousConfig) {
        // Restore the previous engine state
        this.engine.loadJson(lastMove.previousConfig);

        // Update our board representation
        this.board = this.engineStateToBoard();

        // Update current player
        const gameData = this.engine.exportJson();
        this.currentPlayer = gameData.turn;

        // Update game state
        this.updateGameState();

        debugLogger.info('UNDO', `Move undone. Current player: ${this.currentPlayer}`);
        return true;
      } else {
        debugLogger.warn('UNDO', 'Cannot undo: no previous config stored');
        return false;
      }
    } catch (e) {
      debugLogger.error('UNDO', `Undo failed: ${e.message}`);
      return false;
    }
  }

  /**
   * Set human player color
   */
  setHumanColor(color) {
    // Track if color was changed mid-game by comparing to original color
    // Only track for human-vs-bot mode and when moves have been made
    if (this.gameMode === 'human-vs-bot' && this.moveHistory && this.moveHistory.length > 0) {
      // Check if color is different from what it was when menu opened
      this.colorChangedMidGame = (color !== this.originalHumanColor);
    }
    this.humanColor = color;
  }

  /**
   * Set game mode (human-vs-bot or human-vs-human)
   */
  setGameMode(mode) {
    this.gameMode = mode;
    if (mode === 'human-vs-human') {
      this.boardFlipped = false; // Reset board orientation for human vs human
    }
  }

  /**
   * Set board orientation mode for human vs human
   */
  setOrientationMode(mode) {
    this.orientationMode = mode;
    // Update board flip based on orientation and current player
    this.updateBoardOrientation();
  }

  /**
   * Update board orientation based on current settings
   */
  updateBoardOrientation() {
    if (this.gameMode === 'human-vs-human') {
      if (this.orientationMode === 'handoff') {
        // In handoff mode, flip board so current player is always at bottom
        this.boardFlipped = (this.currentPlayer === 'black');
      } else if (this.orientationMode === 'table') {
        // In table mode, never flip (both players see from white's perspective)
        this.boardFlipped = false;
      } else {
        // 'none' mode - no automatic flipping
        this.boardFlipped = false;
      }
    } else {
      // Human vs Bot mode
      // Flip board if human is playing black
      this.boardFlipped = (this.humanColor === 'black');
    }
  }

  /**
   * Set bot difficulty
   */
  setBotDifficulty(difficulty) {
    // Track if difficulty was changed mid-game by comparing to original difficulty
    // Only track for human-vs-bot mode and when moves have been made
    if (this.gameMode === 'human-vs-bot' && this.moveHistory && this.moveHistory.length > 0) {
      // Check if difficulty is different from what it was when menu opened
      this.difficultyChangedMidGame = (difficulty !== this.originalBotDifficulty);
    }
    this.botDifficulty = difficulty;
  }

  /**
   * Set undo allowance
   */
  setAllowUndo(allow) {
    this.allowUndo = allow;
  }

  /**
   * Set sound enabled state
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  /**
   * Get game state for UI
   */
  getGameState() {
    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameState: this.gameState,
      selectedSquare: this.selectedSquare,
      possibleMoves: this.possibleMoves,
      moveHistory: this.moveHistory,
      boardFlipped: this.boardFlipped,
      gameMode: this.gameMode,
      humanColor: this.humanColor,
      botDifficulty: this.botDifficulty,
      allowUndo: this.allowUndo,
      soundEnabled: this.soundEnabled,
      orientationMode: this.orientationMode,
      isBotTurn: this.isBotTurn(),
      isHumanTurn: this.isHumanTurn()
    };
  }

  /**
   * Export game state for saving
   */
  exportForSaving() {
    return {
      engineState: this.engine.exportJson(),
      gameSettings: {
        gameMode: this.gameMode,
        humanColor: this.humanColor,
        botDifficulty: this.botDifficulty,
        allowUndo: this.allowUndo,
        soundEnabled: this.soundEnabled,
        orientationMode: this.orientationMode
      },
      moveHistory: this.moveHistory,
      currentPlayer: this.currentPlayer,
      gameState: this.gameState
    };
  }

  /**
   * Import game state from saved data
   */
  importFromSaved(savedData) {
    try {
      // Restore engine state
      this.engine.loadJson(savedData.engineState);

      // Restore game settings
      if (savedData.gameSettings) {
        this.gameMode = savedData.gameSettings.gameMode || 'human-vs-bot';
        this.humanColor = savedData.gameSettings.humanColor || 'white';
        this.botDifficulty = savedData.gameSettings.botDifficulty || 1;
        this.allowUndo = savedData.gameSettings.allowUndo !== undefined ? savedData.gameSettings.allowUndo : true;
        this.soundEnabled = savedData.gameSettings.soundEnabled !== undefined ? savedData.gameSettings.soundEnabled : true;
        this.orientationMode = savedData.gameSettings.orientationMode || 'handoff';
      }

      // Restore other state
      this.moveHistory = savedData.moveHistory || [];
      this.currentPlayer = savedData.currentPlayer || 'white';
      this.gameState = savedData.gameState || 'active';

      // Update derived state
      this.board = this.engineStateToBoard();
      this.updateBoardOrientation();

      // Reset selection
      this.selectedSquare = null;
      this.possibleMoves = [];

      debugLogger.info('SAVE', 'Game state imported successfully');
      return true;
    } catch (e) {
      debugLogger.error('SAVE', 'Failed to import game state:', e);
      return false;
    }
  }

  /**
   * Save game state to storage
   */
  autoSave() {
    try {
      const saveData = this.exportForSaving();
      const key = `chess-r1-save-${this.gameMode}`;

      if (typeof Storage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(saveData));
        debugLogger.debug('SAVE', `Game auto-saved to ${key}`);
      } else if (typeof creationStorage !== 'undefined') {
        // For Rabbit R1 environment
        creationStorage.setItem(key, JSON.stringify(saveData));
        debugLogger.debug('SAVE', `Game auto-saved to creationStorage ${key}`);
      } else {
        debugLogger.warn('SAVE', 'No storage available for auto-save');
      }
    } catch (e) {
      debugLogger.error('SAVE', 'Auto-save failed:', e);
    }
  }

  /**
   * Load game state from storage
   */
  autoLoad() {
    try {
      const key = `chess-r1-save-${this.gameMode}`;
      let savedData = null;

      if (typeof Storage !== 'undefined') {
        const saved = localStorage.getItem(key);
        if (saved) {
          savedData = JSON.parse(saved);
          debugLogger.debug('SAVE', `Game loaded from localStorage ${key}`);
        }
      } else if (typeof creationStorage !== 'undefined') {
        // For Rabbit R1 environment
        const saved = creationStorage.getItem(key);
        if (saved) {
          savedData = JSON.parse(saved);
          debugLogger.debug('SAVE', `Game loaded from creationStorage ${key}`);
        }
      }

      if (savedData) {
        return this.importFromSaved(savedData);
      } else {
        debugLogger.info('SAVE', 'No saved game found');
        return false;
      }
    } catch (e) {
      debugLogger.error('SAVE', 'Auto-load failed:', e);
      return false;
    }
  }

  /**
   * Clear saved game data
   */
  clearSave() {
    try {
      const key = `chess-r1-save-${this.gameMode}`;

      if (typeof Storage !== 'undefined') {
        localStorage.removeItem(key);
        debugLogger.debug('SAVE', `Cleared localStorage ${key}`);
      } else if (typeof creationStorage !== 'undefined') {
        // For Rabbit R1 environment
        creationStorage.removeItem(key);
        debugLogger.debug('SAVE', `Cleared creationStorage ${key}`);
      }
    } catch (e) {
      debugLogger.error('SAVE', 'Clear save failed:', e);
    }
  }

  /**
   * Get bot difficulty text
   */
  getBotDifficultyText() {
    const difficulties = {
      0: 'Random',
      1: 'Ella',
      2: 'Evy',
      3: 'Emmy',
      4: 'Asa'
    };
    return difficulties[this.botDifficulty] || 'Ella';
  }

  /**
   * Get color options for UI
   */
  getColorOptions() {
    return [
      { value: 'white', label: 'White' },
      { value: 'black', label: 'Black' }
    ];
  }

  /**
   * Get difficulty options for UI
   */
  getDifficultyOptions() {
    return [
      { value: 0, label: 'Random' },
      { value: 1, label: 'Ella (Easiest)' },
      { value: 2, label: 'Evy (Medium)' },
      { value: 3, label: 'Emmy (Hard)' },
      { value: 4, label: 'Asa (Hardest)' }
    ];
  }

  /**
   * Get game mode options for UI
   */
  getGameModeOptions() {
    return [
      { value: 'human-vs-bot', label: 'Human vs Bot' },
      { value: 'human-vs-human', label: 'Human vs Human' }
    ];
  }

  /**
   * Get orientation mode options for UI
   */
  getOrientationModeOptions() {
    return [
      { value: 'none', label: 'Fixed (White bottom)' },
      { value: 'table', label: 'Table (Both see white bottom)' },
      { value: 'handoff', label: 'Handoff (Flip for turns)' }
    ];
  }
}

// ===========================================
// UI Management
// ===========================================

class ChessUI {
  constructor() {
    this.game = new ChessGame();
    this.boardElement = null;
    this.gameStatusElement = null;
    this.moveDisplayElement = null;
    this.capturedPiecesElement = null;
    this.isProcessingMove = false;

    debugLogger.info('UI', 'Chess UI initialized');
  }

  /**
   * Initialize the UI
   */
  init() {
    this.boardElement = document.getElementById('chess-board');
    this.gameStatusElement = document.getElementById('game-status');
    this.moveDisplayElement = document.getElementById('move-display');
    this.capturedPiecesElement = document.getElementById('captured-pieces');

    if (!this.boardElement) {
      debugLogger.error('UI', 'Chess board element not found');
      return;
    }

    this.createBoard();
    this.setupEventListeners();
    this.updateDisplay();

    // Try to load saved game
    this.game.autoLoad();
    this.updateDisplay();

    debugLogger.info('UI', 'UI initialization complete');
  }

  /**
   * Create the chess board HTML
   */
  createBoard() {
    this.boardElement.innerHTML = '';
    this.boardElement.className = 'chess-board';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        const isEven = (row + col) % 2 === 0;
        square.className = `square ${isEven ? 'light' : 'dark'}`;
        square.dataset.row = row;
        square.dataset.col = col;

        // Add square notation for debugging
        const notation = this.game.coordinatesToSquare(row, col);
        square.dataset.square = notation;

        this.boardElement.appendChild(square);
      }
    }

    debugLogger.debug('UI', 'Chess board created');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Board click handler
    this.boardElement.addEventListener('click', (e) => this.handleSquareClick(e));

    // Keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    debugLogger.debug('UI', 'Event listeners setup complete');
  }

  /**
   * Handle square clicks
   */
  async handleSquareClick(e) {
    if (this.isProcessingMove) {
      return; // Prevent multiple simultaneous moves
    }

    const square = e.target.closest('.square');
    if (!square) return;

    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const notation = this.game.coordinatesToSquare(row, col);
    const piece = this.game.getPieceAt(notation);

    debugLogger.debug('UI', `Square clicked: ${notation} (${row},${col}) piece: ${piece}`);

    // Handle selection logic
    if (this.game.selectedSquare === notation) {
      // Clicking the same square deselects it
      this.clearSelection();
    } else if (this.game.selectedSquare && this.game.possibleMoves.includes(notation)) {
      // Making a move
      await this.attemptMove(this.game.selectedSquare, notation);
    } else if (piece && this.isPieceMoveable(piece)) {
      // Selecting a new piece
      this.selectSquare(notation);
    } else {
      // Clicking an empty square or opponent's piece
      this.clearSelection();
    }

    this.updateDisplay();
  }

  /**
   * Check if a piece can be moved by the current player
   */
  isPieceMoveable(piece) {
    if (this.game.gameState !== 'active') return false;

    // Handle both string and object piece formats
    let pieceColor;
    if (typeof piece === 'string') {
      // Old format: piece string like 'K', 'Q', etc.
      pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
    } else if (typeof piece === 'object' && piece.color) {
      // New format: piece object with color property
      pieceColor = piece.color;
    } else {
      console.error('[PIECE_MOVEABLE] Invalid piece format:', piece);
      return false;
    }

    if (this.game.gameMode === 'human-vs-bot') {
      if (this.game.isBotTurn()) return false;
      // Human can only move their color
      return pieceColor === this.game.humanColor;
    } else {
      // Human vs Human - current player can move their pieces
      return pieceColor === this.game.currentPlayer;
    }
  }

  /**
   * Select a square and show possible moves
   */
  selectSquare(notation) {
    this.game.selectedSquare = notation;
    this.game.possibleMoves = this.game.getPossibleMovesForSquare(notation);

    debugLogger.debug('UI', `Selected ${notation}, possible moves:`, this.game.possibleMoves);
  }

  /**
   * Clear current selection
   */
  clearSelection() {
    this.game.selectedSquare = null;
    this.game.possibleMoves = [];

    debugLogger.debug('UI', 'Selection cleared');
  }

  /**
   * Attempt to make a move
   */
  async attemptMove(fromSquare, toSquare) {
    this.isProcessingMove = true;

    try {
      const success = this.game.makeMove(fromSquare, toSquare);

      if (success) {
        this.clearSelection();
        this.game.autoSave(); // Save after successful move

        // Check if it's now the bot's turn
        if (this.game.isBotTurn() && this.game.gameState === 'active') {
          // Small delay to let the UI update
          setTimeout(async () => {
            await this.game.makeBotMove();
            this.game.autoSave(); // Save after bot move
            this.updateDisplay();
            this.isProcessingMove = false;
          }, 100);
          return; // Don't set isProcessingMove to false yet
        }
      } else {
        debugLogger.warn('UI', `Invalid move attempted: ${fromSquare} to ${toSquare}`);
      }
    } catch (e) {
      debugLogger.error('UI', `Move error:`, e);
    }

    this.isProcessingMove = false;
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(e) {
    // Only handle shortcuts if no input is focused
    if (document.activeElement.tagName === 'INPUT') return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.undoMove();
        break;
      case 'ArrowRight':
        e.preventDefault();
        // Could implement redo here
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        this.toggleOptionsMenu();
        break;
    }
  }

  /**
   * Undo the last move
   */
  undoMove() {
    if (this.isProcessingMove) return;

    const success = this.game.undoLastMove();
    if (success) {
      this.clearSelection();
      this.game.autoSave();
      this.updateDisplay();
      debugLogger.info('UI', 'Move undone');
    }
  }

  /**
   * Toggle the options menu
   */
  toggleOptionsMenu() {
    const overlay = document.getElementById('options-overlay');
    if (overlay) {
      const isVisible = !overlay.classList.contains('hidden');

      if (isVisible) {
        this.hideOptionsMenu();
      } else {
        this.showOptionsMenu();
      }
    }
  }

  /**
   * Show the options menu
   */
  showOptionsMenu() {
    const overlay = document.getElementById('options-overlay');
    if (overlay) {
      // Track the original human color and difficulty when menu opens
      this.game.originalHumanColor = this.game.humanColor;
      this.game.colorChangedMidGame = false; // Reset the flag when menu opens

      // Track the original difficulty when menu opens
      this.game.originalBotDifficulty = this.game.botDifficulty;
      this.game.difficultyChangedMidGame = false; // Reset the flag when menu opens

      // Always scroll to top when opening options menu
      const optionsMenu = document.getElementById('options-menu');
      if (optionsMenu) {
        optionsMenu.scrollTop = 0;
      }

      overlay.classList.remove('hidden');
      this.updateOptionsMenu();
      debugLogger.debug('UI', 'Options menu shown');
    }
  }

  /**
   * Hide the options menu
   */
  hideOptionsMenu() {
    const overlay = document.getElementById('options-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      debugLogger.debug('UI', 'Options menu hidden');
    }
  }

  /**
   * Update the options menu with current settings
   */
  updateOptionsMenu() {
    // Update title based on game mode and status
    const optionsTitle = document.getElementById('options-title');
    if (optionsTitle) {
      let displayText = 'Chess R1 by Eric Buess v0.0.1';

      // Check if we have an active game
      if (this.game.moveHistory && this.game.moveHistory.length > 0) {
        if (this.game.gameMode === 'human-vs-human') {
          displayText = 'Human vs Human • Ready to play';
        } else {
          const difficulty = this.game.getBotDifficultyText();
          displayText = `Bot (${difficulty}) • Ready to play`;
        }
      }

      optionsTitle.textContent = displayText;
      console.log('[MENU UPDATE] Updated title to:', optionsTitle.textContent);
    }

    // Update back button state - disable if color/difficulty changed mid-game
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
      console.log('[MENU UPDATE] Updated back button:', backBtn.textContent, 'disabled:', backBtn.disabled);
    }

    // Update game mode radio buttons
    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
    gameModeRadios.forEach(radio => {
      radio.checked = radio.value === this.game.gameMode;
    });

    // Update human color radio buttons
    const colorRadios = document.querySelectorAll('input[name="humanColor"]');
    colorRadios.forEach(radio => {
      radio.checked = radio.value === this.game.humanColor;
    });

    // Update undo radio buttons
    const undoRadios = document.querySelectorAll('input[name="allowUndo"]');
    undoRadios.forEach(radio => {
      radio.checked = (radio.value === 'on') === this.game.allowUndo;
    });

    // Update bot difficulty radio buttons
    const difficultyRadios = document.querySelectorAll('input[name="botDifficulty"]');
    difficultyRadios.forEach(radio => {
      radio.checked = radio.value === String(this.game.botDifficulty);
    });

    // Update orientation mode radio buttons
    const orientationRadios = document.querySelectorAll('input[name="orientationMode"]');
    orientationRadios.forEach(radio => {
      radio.checked = radio.value === this.game.orientationMode;
    });

    // Show/hide color group based on game mode
    const colorGroup = document.getElementById('color-group');
    if (colorGroup) {
      if (this.game.gameMode === 'human-vs-bot') {
        colorGroup.style.display = 'block';
        colorGroup.offsetHeight; // Force reflow
      } else {
        colorGroup.style.display = 'none';
      }
      console.log('[MENU UPDATE] colorGroup display:', colorGroup.style.display);
      console.log('[MENU UPDATE] colorGroup computed display:', window.getComputedStyle(colorGroup).display);
    }

    // Show/hide difficulty group based on game mode
    const difficultyGroup = document.getElementById('difficulty-group');
    if (difficultyGroup) {
      if (this.game.gameMode === 'human-vs-bot') {
        difficultyGroup.style.display = 'block';
        difficultyGroup.offsetHeight; // Force reflow
      } else {
        difficultyGroup.style.display = 'none';
      }
      console.log('[MENU UPDATE] difficultyGroup display:', difficultyGroup.style.display);
    }

    // Show/hide orientation mode options based on game mode
    const orientationGroup = document.getElementById('orientation-mode-group');
    if (orientationGroup) {
      if (this.game.gameMode === 'human-vs-human') {
        orientationGroup.style.display = 'block';
        orientationGroup.offsetHeight; // Force reflow
      } else {
        orientationGroup.style.display = 'none';
      }
      console.log('[MENU UPDATE] orientationGroup display:', orientationGroup.style.display);
    }

    // Update undo group visibility - always show for now
    const undoGroup = document.getElementById('undo-group');
    if (undoGroup) {
      undoGroup.style.display = 'block';
      console.log('[MENU UPDATE] undoGroup display:', undoGroup.style.display);
    }
  }

  /**
   * Setup options menu event listeners
   */
  setupOptionsMenuListeners() {
    // New Game button
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        debugLogger.info('UI', 'New game requested');
        this.game.newGame();
        this.game.clearSave(); // Clear any saved state
        this.game.autoSave(); // Save the new game state
        this.updateDisplay();
        this.hideOptionsMenu();
      });
    }

    // Back to Game button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        debugLogger.info('UI', 'Back to game requested');
        this.hideOptionsMenu();
      });
    }

    // Game Mode radio buttons
    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
    gameModeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          debugLogger.info('UI', `Game mode changed to: ${radio.value}`);

          // Get current game mode before changing
          const oldMode = this.game.gameMode;
          this.game.setGameMode(radio.value);

          // Reset color and difficulty change tracking when switching modes
          // (these changes don't matter across mode switches)
          this.game.colorChangedMidGame = false;
          this.game.originalHumanColor = this.game.humanColor;
          this.game.difficultyChangedMidGame = false;
          this.game.originalBotDifficulty = this.game.botDifficulty;

          // Try to load saved state for the new game mode
          if (oldMode !== radio.value) {
            this.game.autoLoad();
          }

          this.game.autoSave();

          // Update board orientation
          this.game.updateBoardOrientation();
          this.updateDisplay();

          // Use setTimeout to ensure the DOM is updated before checking visibility
          setTimeout(() => {
            this.updateOptionsMenu();

            // Force update of group visibility immediately after mode switch
            setTimeout(() => {
              console.log('[MODE SWITCH] Force updating menu visibility...');
              this.updateMenuVisibility();

              // Force check the visibility after update
              const colorGroup = document.getElementById('color-group');
              const difficultyGroup = document.getElementById('difficulty-group');
              const orientationGroup = document.getElementById('orientation-mode-group');
              const undoGroup = document.getElementById('undo-group');

              console.log('[MODE SWITCH] Final visibility check:');
              console.log('  - Color group visible:', colorGroup?.style.display);
              console.log('  - Difficulty group visible:', difficultyGroup?.style.display);
              console.log('  - Orientation group visible:', orientationGroup?.style.display);
              console.log('  - Undo group visible:', undoGroup?.style.display);
            }, 10);
          }, 10);
        }
      });
    });

    // Human Color radio buttons
    const colorRadios = document.querySelectorAll('input[name="humanColor"]');
    colorRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          debugLogger.info('UI', `Human color changed to: ${radio.value}`);
          this.game.setHumanColor(radio.value);
          this.game.autoSave();
          // Update button states after color change
          this.updateOptionsButtons();
        }
      });
    });

    // Bot Difficulty radio buttons
    const difficultyRadios = document.querySelectorAll('input[name="botDifficulty"]');
    difficultyRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const difficulty = parseInt(radio.value);
          debugLogger.info('UI', `Bot difficulty changed to: ${difficulty}`);
          this.game.setBotDifficulty(difficulty);
          this.game.autoSave();
          // Update button states after difficulty change
          this.updateOptionsButtons();
        }
      });
    });

    // Orientation Mode radio buttons
    const orientationRadios = document.querySelectorAll('input[name="orientationMode"]');
    orientationRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          debugLogger.info('UI', `Orientation mode changed to: ${radio.value}`);
          this.game.setOrientationMode(radio.value);
          this.game.autoSave();
          this.updateDisplay();
        }
      });
    });

    // Allow Undo radio buttons
    const undoRadios = document.querySelectorAll('input[name="allowUndo"]');
    undoRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const allowUndo = radio.value === 'on';
          debugLogger.info('UI', `Allow undo changed to: ${allowUndo}`);
          this.game.setAllowUndo(allowUndo);
          this.game.autoSave();
        }
      });
    });

    debugLogger.debug('UI', 'Options menu listeners setup complete');
  }

  /**
   * Update options menu button states
   */
  updateOptionsButtons() {
    // Update the back button state based on current changes
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      const colorChanged = this.game.colorChangedMidGame;
      const difficultyChanged = this.game.difficultyChangedMidGame;

      if (colorChanged || difficultyChanged) {
        backBtn.disabled = true;
        if (colorChanged && difficultyChanged) {
          backBtn.textContent = 'Start new game (settings changed)';
        } else if (colorChanged) {
          backBtn.textContent = 'Start new game (color changed)';
        } else {
          backBtn.textContent = 'Start new game (difficulty changed)';
        }
        backBtn.classList.add('disabled');
      } else {
        backBtn.disabled = false;
        backBtn.textContent = 'Back to game';
        backBtn.classList.remove('disabled');
      }
    }

    // Update the title
    this.updateOptionsMenu();
  }

  // Update menu visibility based on game mode
  updateMenuVisibility() {
    const colorGroup = document.getElementById('color-group');
    const difficultyGroup = document.getElementById('difficulty-group');
    const orientationGroup = document.getElementById('orientation-mode-group');

    if (this.game.gameMode === 'human-vs-human') {
      // Human vs Human mode
      if (colorGroup) colorGroup.style.display = 'none';
      if (difficultyGroup) difficultyGroup.style.display = 'none';
      if (orientationGroup) orientationGroup.style.display = 'block';
    } else {
      // Human vs Bot mode
      if (colorGroup) colorGroup.style.display = 'block';
      if (difficultyGroup) difficultyGroup.style.display = 'block';
      if (orientationGroup) orientationGroup.style.display = 'none';
    }
  }

  /**
   * Update the entire display
   */
  updateDisplay() {
    this.updateBoard();
    this.updateGameStatus();
    this.updateMoveDisplay();
    this.updateCapturedPieces();

    // Update board orientation if needed
    this.game.updateBoardOrientation();
  }

  /**
   * Update the chess board display
   */
  updateBoard() {
    const squares = this.boardElement.querySelectorAll('.square');

    squares.forEach(square => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const notation = square.dataset.square;

      // Clear previous classes
      square.classList.remove('selected', 'possible-move', 'last-move');

      // Get piece at this position (accounting for board flip)
      let piece = null;
      if (this.game.boardFlipped) {
        // When board is flipped, reverse both row and col
        const flippedRow = 7 - row;
        const flippedCol = 7 - col;
        piece = this.game.board[flippedRow][flippedCol];
      } else {
        piece = this.game.board[row][col];
      }

      // Update piece display
      square.textContent = this.getPieceSymbol(piece);

      // Add selection highlighting
      if (this.game.selectedSquare === notation) {
        square.classList.add('selected');
      }

      // Add possible move highlighting
      if (this.game.possibleMoves.includes(notation)) {
        square.classList.add('possible-move');
      }

      // Add last move highlighting
      if (this.game.moveHistory.length > 0) {
        const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1];
        if (lastMove.from === notation || lastMove.to === notation) {
          square.classList.add('last-move');
        }
      }
    });
  }

  /**
   * Get Unicode symbol for a piece
   */
  getPieceSymbol(piece) {
    if (!piece) return '';

    // Handle both old string format ('K', 'Q', etc.) and new object format ({type: 'king', color: 'white'})
    let pieceSymbol;

    if (typeof piece === 'string') {
      // Old format: direct piece symbol
      pieceSymbol = piece;
    } else if (typeof piece === 'object' && piece.type && piece.color) {
      // New format: convert object to piece symbol
      const typeMap = {
        'king': 'K',
        'queen': 'Q',
        'rook': 'R',
        'bishop': 'B',
        'knight': 'N',
        'pawn': 'P'
      };

      const symbol = typeMap[piece.type];
      if (!symbol) {
        console.error('[PIECE_SYMBOL] Unknown piece type:', piece.type);
        return '';
      }

      // Use lowercase for black pieces, uppercase for white
      pieceSymbol = piece.color === 'black' ? symbol.toLowerCase() : symbol;
    } else {
      console.error('[PIECE_SYMBOL] Invalid piece format:', piece);
      return '';
    }

    const symbols = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };

    return symbols[pieceSymbol] || pieceSymbol;
  }

  /**
   * Update game status display
   */
  updateGameStatus() {
    if (!this.gameStatusElement) return;

    let message = '';
    let indicatorClass = '';

    if (this.game.gameMode === 'human-vs-bot') {
      // Human vs Bot mode
      if (this.game.gameState === 'checkmate') {
        const winner = this.game.currentPlayer === 'white' ? 'Black' : 'White';
        if ((winner === 'White' && this.game.humanColor === 'white') ||
            (winner === 'Black' && this.game.humanColor === 'black')) {
          message = `You win!`;
          indicatorClass += ' win';
        } else {
          message = `Bot wins!`;
          indicatorClass += ' lose';
        }
      } else if (this.game.gameState === 'stalemate') {
        message = 'Stalemate - Draw!';
        indicatorClass += ' draw';
      } else if (this.game.gameState === 'check') {
        if (this.game.isBotTurn()) {
          message = `Bot in check!`;
          indicatorClass += ' bot-turn check';
        } else {
          message = `${this.game.humanPlayerName} in check!`;
          indicatorClass += ' human-turn check';
        }
      } else {
        if (this.game.isBotTurn()) {
          message = `Bot thinking...`;
          indicatorClass += ' bot-turn';
        } else {
          message = `${this.game.humanPlayerName}'s turn`;
          indicatorClass += ' human-turn';
        }
      }
    } else {
      // Human vs Human mode - no bot difficulty needed
      message = `${this.game.currentPlayer.charAt(0).toUpperCase() + this.game.currentPlayer.slice(1)}'s turn`;
    }

    this.gameStatusElement.textContent = message;
    this.gameStatusElement.className = `game-status${indicatorClass}`;
  }

  /**
   * Update move display
   */
  updateMoveDisplay() {
    if (!this.moveDisplayElement) return;

    if (this.game.moveHistory.length === 0) {
      this.moveDisplayElement.textContent = 'Ready to play';
    } else {
      const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1];
      const moveText = `${lastMove.from}-${lastMove.to}`;
      this.moveDisplayElement.textContent = `Last: ${moveText}`;
    }
  }

  /**
   * Update captured pieces display
   */
  updateCapturedPieces() {
    if (!this.capturedPiecesElement) return;

    const captured = { white: [], black: [] };

    // Count captured pieces from move history
    this.game.moveHistory.forEach(move => {
      if (move.captured) {
        const color = move.captured === move.captured.toUpperCase() ? 'white' : 'black';
        captured[color].push(move.captured);
      }
    });

    // Display captured pieces
    let capturedText = '';
    if (captured.white.length > 0) {
      capturedText += 'White: ' + captured.white.map(p => this.getPieceSymbol(p)).join(' ') + ' ';
    }
    if (captured.black.length > 0) {
      capturedText += 'Black: ' + captured.black.map(p => this.getPieceSymbol(p)).join(' ');
    }

    this.capturedPiecesElement.textContent = capturedText;
  }
}

// ===========================================
// Application Initialization
// ===========================================

// Global game instance
let game = null;
let ui = null;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  debugLogger.info('INIT', 'DOM loaded, initializing Chess R1');

  try {
    ui = new ChessUI();
    ui.init();
    game = ui.game; // For global access

    // Setup options menu listeners
    ui.setupOptionsMenuListeners();

    debugLogger.info('INIT', 'Chess R1 initialization complete');
  } catch (e) {
    debugLogger.error('INIT', 'Failed to initialize Chess R1:', e);
  }
});

// Initialize menu visibility based on default game mode
debugLogger.info('INIT', 'Setting initial menu visibility');
const colorGroup = document.getElementById('color-group');
const difficultyGroup = document.getElementById('difficulty-group');
const orientationGroup = document.getElementById('orientation-mode-group');
const undoGroup = document.getElementById('undo-group');

// Set initial visibility based on default game mode (human-vs-bot)
if (colorGroup) colorGroup.style.display = 'block';
if (difficultyGroup) difficultyGroup.style.display = 'block';
if (orientationGroup) orientationGroup.style.display = 'none';
if (undoGroup) undoGroup.style.display = 'block';

// Add this to prevent the flip board button bug
const flipBoardBtn = document.getElementById('flip-board-btn');
if (flipBoardBtn) {
  flipBoardBtn.addEventListener('click', () => {
    if (game) {
      game.boardFlipped = !game.boardFlipped;
      ui.updateDisplay();
      debugLogger.info('UI', `Board flipped: ${game.boardFlipped}`);
    }
  });
}

// Export for potential external access
if (typeof window !== 'undefined') {
  window.ChessGame = ChessGame;
  window.ChessUI = ChessUI;
  window.debugLogger = debugLogger;
}

debugLogger.info('SYSTEM', 'Chess R1 script loaded successfully');