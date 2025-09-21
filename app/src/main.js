// CRITICAL: DO NOT MODIFY THIS FILE except for updating paths for linking or imports
// R1 Chess Game v0.0.2
// Two-player chess game with full rule implementation including en passant

// ===========================================
// js-chess-engine Library Integration
// ===========================================

// Import js-chess-engine from npm package - prevents tree-shaking issues
import * as ChessEngine from 'js-chess-engine';
// Import sound data directly to avoid 403 path issues on Rabbit device
import { woodenSoundData } from './woodenSoundData.js';
window.jsChessEngine = ChessEngine;
// console.log('Chess engine modules:', Object.keys(ChessEngine)); // Forces usage - commented for performance

// ChessConverter class to translate between our format and js-chess-engine format
class ChessConverter {
  // Convert our board array to js-chess-engine format
  static toLibraryFormat(board, currentPlayer, castlingRights, enPassantTarget) {
    const pieces = {};
    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    // Convert board array to pieces object
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const position = files[col] + ranks[row];
          const notation = this.getPieceNotation(piece);
          pieces[position] = notation;
        }
      }
    }
    
    // Convert castling rights
    const castling = {
      whiteShort: castlingRights?.white?.kingside || false,
      whiteLong: castlingRights?.white?.queenside || false,
      blackShort: castlingRights?.black?.kingside || false,
      blackLong: castlingRights?.black?.queenside || false
    };
    
    return {
      pieces,
      turn: currentPlayer,
      castling,
      enPassant: enPassantTarget || null,
      halfMove: 0, // We don't track this exactly
      fullMove: 1  // We don't track this exactly
    };
  }
  
  static getPieceNotation(piece) {
    const typeMap = {
      'pawn': 'P', 'rook': 'R', 'knight': 'N',
      'bishop': 'B', 'queen': 'Q', 'king': 'K'
    };
    const notation = typeMap[piece.type];
    return piece.color === 'white' ? notation : notation.toLowerCase();
  }
  
  // Validate endgame using library
  static validateEndgame(board, currentPlayer, castlingRights, enPassantTarget) {
    try {
      const config = this.toLibraryFormat(board, currentPlayer, castlingRights, enPassantTarget);
      const game = new window.jsChessEngine.Game(config);
      const status = game.exportJson();
      
      return {
        isCheckmate: status.checkMate || false,
        isStalemate: status.isFinished && !status.checkMate && !status.check,
        isCheck: status.check || false,
        hasValidMoves: Object.keys(status.moves || {}).length > 0
      };
    } catch (error) {
      // Error handling silently
      return null;
    }
  }
}

// Debug Logger - Disabled for production
const debugLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
};

// Chess Game State
class ChessGame {
  constructor() {
    // Initialize js-chess-engine
    this.engine = new window.jsChessEngine.Game();
    
    // UI state management (separate from chess logic)
    this.selectedSquare = null;
    this.possibleMoves = [];
    this.boardFlipped = false;
    this.orientationMode = 'handoff'; // 'none', 'table', or 'handoff' for human vs human
    this.gameMode = 'human-vs-bot';
    this.humanColor = 'white';
    this.botDifficulty = 1; // Bot difficulty: 0=random, 1=Ella(normal), 2=Evy(hard), 3=Emmy(harder), 4=Asa(hardest)
    this.allowUndo = true; // Enable undo by default
    this.soundEnabled = true; // Sound effects enabled by default

    // Track changes for menu "Back to game" button
    this.originalGameMode = 'human-vs-bot';
    this.originalHumanColor = 'white';
    this.colorChangedMidGame = false;
    this.originalBotDifficulty = 1;
    this.difficultyChangedMidGame = false;

    // Cache frequently accessed state
    this.board = this.engineStateToBoard();
    this.currentPlayer = 'white';
    this.gameStatus = 'playing';

    // NEW STATE HISTORY SYSTEM
    // Store complete game states for instant undo/redo
    // Index 0 = initial state, Index 1 = after first move, etc.
    this.stateHistory = [];
    this.currentStateIndex = 0;
    this.isInUndoRedoState = false; // Track if we're in an undo/redo state where bot shouldn't auto-move
    this.lastUndoWasBotMove = false; // Track if the last undo was a bot move for notification

    // Initialize moveHistory (for backward compatibility)
    this.moveHistory = [];

    // Store initial state as first entry
    const initialState = this.engine.exportJson();
    this.stateHistory.push({
      engineState: JSON.parse(JSON.stringify(initialState)),
      move: null, // No move for initial state
      notation: null,
      timestamp: Date.now()
    });

    // State history system initialized - index 0 is initial state
    
    // Sound system (UI only)
    this.sounds = this.createSoundSystem();
    
    // Circuit breaker properties (kept for compatibility but not used)
    this.checkDepth = 0;
    this.checkOperations = 0;
    this.maxCheckDepth = 10;
    this.maxCheckOperations = 1000;
    this.isEndgameDetection = false;
    
    // Castling rights (maintained for save/load compatibility)
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    this.enPassantTarget = null;
  }

  // ============================================
  // CORE MOVEMENT METHODS (UI Interface)
  // ============================================
  
  /**
   * Make a move on the board
   * @param {number} fromRow - Source row (0-7)
   * @param {number} fromCol - Source column (0-7)
   * @param {number} toRow - Destination row (0-7)
   * @param {number} toCol - Destination column (0-7)
   * @returns {boolean} True if move was successful
   */
  async makeMove(fromRow, fromCol, toRow, toCol) {
    
    const from = this.coordsToSquare(fromRow, fromCol);
    const to = this.coordsToSquare(toRow, toCol);
    
    
    
    try {
      // Check if this was a capture for sound
      const targetPiece = this.board[toRow][toCol];
      const isCapture = targetPiece !== null;
      const movedPiece = this.board[fromRow][fromCol];

      // Execute move in engine
      
      const moveResult = this.engine.move(from, to);
      

      // Update our cached state
      this.updateCachedState();

      // Update board orientation after player change
      this.boardFlipped = this.determineOrientation();
      

      // Update game status from engine and check for transitions
      const enteredCheck = this.updateGameStatus();
      if (enteredCheck) {
        // We just entered check - determine who's in check
        const checkedPlayer = this.currentPlayer === 'white' ? 'White' : 'Black';
        
      }

      // Generate notation and commentary for the move
      const notation = this.generateMoveNotation(fromRow, fromCol, toRow, toCol, movedPiece, targetPiece,
        this.gameStatus === 'check', this.gameStatus === 'checkmate');
      const commentary = this.generateMoveCommentary(fromRow, fromCol, toRow, toCol, movedPiece, targetPiece, null);

      // Use unified state recording method
      this.recordGameState({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: movedPiece,
        captured: targetPiece,
        notation: notation,
        commentary: commentary
      });

      // Play sound - action first, then status
      // Play action sound (capture or move)
      if (isCapture) {
        this.playSound('capture');
      } else {
        this.playSound('move');
      }

      // Play status sound with delay if there was a capture
      if (this.gameStatus === 'checkmate') {
        setTimeout(() => this.playSound('checkmate'), isCapture ? 100 : 0);
      } else if (this.gameStatus === 'check') {
        setTimeout(() => this.playSound('check'), isCapture ? 100 : 0);
      }

      // Auto-save after successful move
      await this.autoSave();

      return { success: true, enteredCheck };
    } catch (error) {
      
      
      return { success: false, enteredCheck: false };
    }
  }
  
  /**
   * Get possible moves for a piece at given position
   * @param {number} row - Row position (0-7)
   * @param {number} col - Column position (0-7)
   * @returns {Array} Array of {row, col} objects for possible moves
   */
  getPossibleMoves(row, col) {
    const square = this.coordsToSquare(row, col);
    const moves = this.engine.moves(square);
    
    if (!moves || moves.length === 0) {
      return [];
    }
    
    // Convert chess notation back to row/col format
    return moves.map(moveSquare => {
      const coords = this.squareToCoords(moveSquare);
      return { row: coords.row, col: coords.col };
    });
  }
  
  // ============================================
  // GAME STATE METHODS
  // ============================================
  
  /**
   * Update game status based on engine state
   */
  updateGameStatus() {
    const state = this.engine.exportJson();
    const previousStatus = this.gameStatus;
    
    // Update status based on engine state
    if (state.checkMate) {
      this.gameStatus = 'checkmate';
    } else if (state.isFinished && !state.checkMate) {
      this.gameStatus = 'stalemate';
    } else if (state.check) {
      this.gameStatus = 'check';
    } else {
      this.gameStatus = 'playing';
    }
    
    // Return true if we just entered check state
    return previousStatus !== 'check' && this.gameStatus === 'check';
  }
  
  /**
   * Update all cached state from engine
   */
  updateCachedState() {
    const state = this.engine.exportJson();

    // Update board representation
    this.board = this.engineStateToBoard();
    
    // Update current player
    const oldPlayer = this.currentPlayer;
    this.currentPlayer = state.turn;
    
    // DON'T update game status here - let updateGameStatus() be the single source
    // This prevents duplicate/conflicting status updates
    
    // Update castling rights from engine
    this.castlingRights = {
      white: { 
        kingside: state.castling.whiteShort, 
        queenside: state.castling.whiteLong 
      },
      black: { 
        kingside: state.castling.blackShort, 
        queenside: state.castling.blackLong 
      }
    };
    
    this.enPassantTarget = state.enPassant;
  }
  
  // ============================================
  // BOT METHODS
  // ============================================
  
  /**
   * Check if it's the bot's turn
   */
  isBotTurn() {
    if (this.gameMode === 'human-vs-human') {
      return false;
    }
    
    // REMOVED game status check - callers already check this
    // The method should ONLY check whose turn it is, not game state
    
    // In human-vs-bot mode, check if current player is opposite of human color
    return this.currentPlayer !== this.humanColor;
  }
  
  /**
   * Generate bot move
   */
  async generateBotMove() {
    try {
      

      // Get the piece positions before the move for history tracking
      const boardBefore = this.board;
      
      // IMPORTANT: aiMove() directly executes the move in the engine!
      // It doesn't just return a move suggestion - it plays it
      // Difficulty: 0 = random, 1 = easy, 2 = medium, 3 = hard, 4 = expert
      // Wrap in Promise with setTimeout to allow UI updates before blocking calculation
      const aiMove = await new Promise(resolve => {
        setTimeout(() => {
          resolve(this.engine.aiMove(this.botDifficulty));
        }, 0);
      });
      
      
      // The move has already been made in the engine
      // Update our cached state to reflect the new position
      this.updateCachedState();
      
      // Update game status from engine and check for transitions
      const enteredCheck = this.updateGameStatus();
      if (enteredCheck) {
        // Bot just put human in check
        
      }
      
      // Convert to our format for UI and history
      const moves = Object.entries(aiMove);
      if (moves.length > 0) {
        const [from, to] = moves[0];
        const fromCoords = this.squareToCoords(from);
        const toCoords = this.squareToCoords(to);
        
        // Get the piece that was moved (now at the destination after updateCachedState)
        const movedPiece = this.board[toCoords.row][toCoords.col];
        const capturedPiece = boardBefore[toCoords.row][toCoords.col];
        
        // Generate notation and commentary
        const notation = this.generateMoveNotation(fromCoords.row, fromCoords.col, toCoords.row, toCoords.col,
          movedPiece, capturedPiece, this.gameStatus === 'check', this.gameStatus === 'checkmate');
        const commentary = this.generateMoveCommentary(fromCoords.row, fromCoords.col, toCoords.row, toCoords.col,
          movedPiece, capturedPiece, null);

        // Use unified state recording method
        this.recordGameState({
          from: fromCoords,
          to: toCoords,
          piece: movedPiece,
          captured: capturedPiece,
          notation: notation,
          commentary: commentary
        });
        
        // Play appropriate sound - action first, then status
        // Play action sound (capture or move)
        if (capturedPiece) {
          this.playSound('capture');
        } else {
          this.playSound('move');
        }

        // Play status sound with delay if there was a capture
        if (this.gameStatus === 'checkmate') {
          setTimeout(() => this.playSound('checkmate'), capturedPiece ? 100 : 0);
        } else if (this.gameStatus === 'check') {
          setTimeout(() => this.playSound('check'), capturedPiece ? 100 : 0);
        }

        // Auto-save after successful bot move
        await this.autoSave();

        return {
          from: fromCoords,
          to: toCoords,
          piece: movedPiece,
          enteredCheck
        };
      }
    } catch (error) {
      
    }
    
    return null;
  }
  
  /**
   * Execute bot move
   */
  async executeBotMove() {
    
    // Debug each condition separately
    const isHumanVsBot = this.gameMode === 'human-vs-bot';
    const isBotTurn = this.isBotTurn();
    const isValidStatus = this.gameStatus === 'playing' || this.gameStatus === 'check';
    
    if (!isHumanVsBot || !isBotTurn || !isValidStatus) {
      
      return { success: false, enteredCheck: false };
    }
    
    const startTime = Date.now();
    
    // Generate AND execute bot move (aiMove() does both!)
    const botMove = await this.generateBotMove();
    
    
    if (!botMove) {
      
      return { success: false, enteredCheck: false };
    }
    
    // Extract whether check was triggered
    const enteredCheck = botMove.enteredCheck || false;
    
    // Calculate delay for natural feel
    const thinkingTime = Date.now() - startTime;
    const targetDelay = 800 + Math.random() * 400; // 800-1200ms
    const remainingDelay = Math.max(0, targetDelay - thinkingTime);
    
    // Wait for remaining delay
    await new Promise(resolve => setTimeout(resolve, remainingDelay));
    
    // Move was already executed by generateBotMove()
    // Just log success
    // Auto-save after successful bot move
    await this.autoSave();

    return { success: true, enteredCheck };
  }
  
  /**
   * Unified method to record game state after a move
   * Used by both makeMove() and generateBotMove() to avoid duplication
   * This is also what the scroll wheel will call for undo/redo
   * @param {Object} moveData - Move information
   * @param {Object} moveData.from - Source position {row, col}
   * @param {Object} moveData.to - Destination position {row, col}
   * @param {string} moveData.piece - Piece that was moved
   * @param {string|null} moveData.captured - Captured piece (if any)
   * @param {string} moveData.notation - Move notation
   * @param {string} moveData.commentary - Move commentary
   */
  recordGameState(moveData) {
    

    // If we're not at the end of history, truncate future states (branching)
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      
      this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1);
    }

    // Clear the undo/redo state flag when making a new move
    this.isInUndoRedoState = false;

    // R1 Memory Management: Define history limit for R1 device
    const MAX_HISTORY_LENGTH = 100; // Keep last 100 states to prevent memory issues

    // DON'T store complete engine state for moves - only move data
    // This prevents save file bloat (was storing 2KB per move)
    // Engine state can be reconstructed by replaying moves from initial state
    const stateEntry = {
      engineState: null, // Only store engineState for initial state (index 0)
      move: {
        from: moveData.from,
        to: moveData.to,
        piece: moveData.piece,
        captured: moveData.captured
      },
      notation: moveData.notation,
      commentary: moveData.commentary,
      timestamp: Date.now()
    };

    
    this.stateHistory.push(stateEntry);
    this.currentStateIndex++;

    // Check if we've exceeded the history limit
    if (this.stateHistory.length > MAX_HISTORY_LENGTH) {
      // Keep the initial state (index 0) plus the most recent states
      const statesToKeep = MAX_HISTORY_LENGTH - 1; // Reserve one slot for initial state
      const removedCount = this.stateHistory.length - MAX_HISTORY_LENGTH;

      

      // Keep initial state + most recent states
      this.stateHistory = [
        this.stateHistory[0], // Always keep initial state for full game reset
        ...this.stateHistory.slice(-statesToKeep)
      ];

      // Adjust current index after trimming
      this.currentStateIndex = this.stateHistory.length - 1;

      
    }

    // Keep old moveHistory for backward compatibility (will remove later)
    if (!this.moveHistory) this.moveHistory = [];
    this.moveHistory.push({
      from: moveData.from,
      to: moveData.to,
      piece: moveData.piece,
      captured: moveData.captured,
      notation: moveData.notation
    });

    // Also limit moveHistory to match stateHistory limits
    if (this.moveHistory.length > MAX_HISTORY_LENGTH - 1) {
      // Keep moves in sync with stateHistory (exclude initial state)
      this.moveHistory = this.moveHistory.slice(-(MAX_HISTORY_LENGTH - 1));
    }

    // Auto-save after recording state
    this.autoSave().catch(error => {
      
    });
  }

  // ============================================
  // COORDINATE CONVERSION
  // ============================================
  
  /**
   * Convert board coordinates to chess notation
   */
  coordsToSquare(row, col) {
    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  }
  
  /**
   * Convert chess notation to board coordinates
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
   * Convert engine state to board array
   */
  engineStateToBoard() {
    const state = this.engine.exportJson();
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    
    
    
    

    for (const [square, piece] of Object.entries(state.pieces)) {
      const coords = this.squareToCoords(square);
      const parsedPiece = this.parsePiece(piece);

      // CRITICAL BUG FIX: Skip corrupted pieces that return null
      if (parsedPiece === null) {
        
        continue; // Don't place corrupted pieces on board
      }

      board[coords.row][coords.col] = parsedPiece;
      if (square === 'E2' || square === 'E4' || square === 'E7' || square === 'E5') {
        
      }
    }

    
    return board;
  }
  
  /**
   * Parse engine piece notation to our format
   */
  parsePiece(enginePiece) {
    // CRITICAL BUG FIX: Validate input to prevent corruption
    if (typeof enginePiece !== 'string') {
      
      return null; // Return null for invalid pieces to filter them out
    }

    if (enginePiece.length !== 1) {
      
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
      
      return null;
    }

    const color = isWhite ? 'white' : 'black';

    return { type, color };
  }
  
  // ============================================
  // GAME MANAGEMENT METHODS
  // ============================================
  
  /**
   * Start a new game
   */
  newGame() {
    // Reset engine
    this.engine = new window.jsChessEngine.Game();

    // Reset UI state
    this.selectedSquare = null;
    this.possibleMoves = [];
    this.moveHistory = [];
    this.currentMoveIndex = -1;
    this.initialEngineState = JSON.parse(JSON.stringify(this.engine.exportJson())); // Deep clone
    this.colorChangedMidGame = false; // Reset color change flag
    this.originalHumanColor = this.humanColor; // Track original color for this game

    // Reset state history for undo/redo system
    this.stateHistory = [];
    this.currentStateIndex = 0;
    this.isInUndoRedoState = false;

    // Store initial state as first entry
    const initialState = this.engine.exportJson();
    this.stateHistory.push({
      engineState: JSON.parse(JSON.stringify(initialState)),
      move: null, // No move for initial state
      captured: null,
      notation: null,
      commentary: null
    });

    // Update cached state FIRST (this sets currentPlayer correctly)
    this.updateCachedState();

    // CRITICAL: Update game status to ensure it's set to 'playing'
    this.updateGameStatus();
    

    // THEN determine board orientation based on correct currentPlayer
    this.boardFlipped = this.determineOrientation();
    

    // Play new game sound
    this.playSound('newGame');
  }
  
  /**
   * Set game mode
   */
  setGameMode(mode) {
    this.gameMode = mode;
  }
  
  /**
   * Set human color
   */
  setHumanColor(color) {
    // Track if color was changed mid-game by comparing to original color
    // Only track for human-vs-bot mode (doesn't apply to human-vs-human)
    if (this.gameMode === 'human-vs-bot' && this.moveHistory && this.moveHistory.length > 0) {
      // Check if color is different from what it was when menu opened
      this.colorChangedMidGame = (color !== this.originalHumanColor);
    }
    this.humanColor = color;
    this.boardFlipped = this.determineOrientation();
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
   * Get game mode
   */
  getGameMode() {
    return this.gameMode;
  }
  
  /**
   * Get human color
   */
  getHumanColor() {
    return this.humanColor;
  }
  
  /**
   * Check if board should be flipped (human-vs-bot mode)
   */
  shouldFlipBoard() {
    return this.gameMode === 'human-vs-bot' && this.humanColor === 'black';
  }

  /**
   * Determine correct orientation based on game mode and current player
   * This is the single source of truth for orientation logic
   */
  determineOrientation() {
    const prevFlipped = this.boardFlipped;
    let shouldFlip = false;

    if (this.gameMode === 'human-vs-human') {
      // In human vs human, orientation depends on mode and current player
      if (this.orientationMode === 'none') {
        shouldFlip = false; // Never flip
      } else if (this.orientationMode === 'table') {
        // Table mode: Players sit across from each other
        // Board flips so current player sees their pieces at bottom
        // White's turn = normal view (white at bottom for white player)
        // Black's turn = flipped view (rotates 180° so black player sees black at bottom)
        shouldFlip = this.currentPlayer === 'black';
      } else if (this.orientationMode === 'handoff') {
        // Handoff mode: Dynamic flip based on whose turn it is
        // Device rotates when passed between players
        shouldFlip = this.currentPlayer === 'black';
      }
      
    } else {
      // In human vs bot, flip when playing as black so black pieces are at bottom
      shouldFlip = this.humanColor === 'black';
      
    }

    if (prevFlipped !== shouldFlip) {
      
    }

    return shouldFlip;
  }

  /**
   * Set correct board perspective (legacy - for human-vs-bot)
   */
  setCorrectBoardPerspective() {
    const shouldFlip = this.shouldFlipBoard();
    if (this.boardFlipped !== shouldFlip) {
      this.boardFlipped = shouldFlip;
      return true; // Board was flipped
    }
    return false; // No change needed
  }
  
  // ============================================
  // SAVE/LOAD METHODS
  // ============================================
  
  /**
   * Get game state for saving
   */
  getGameState() {
    const engineState = this.engine.exportJson();

    return {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus,
      moveHistory: this.moveHistory,
      // NEW: Save state history system
      stateHistory: this.stateHistory,
      currentStateIndex: this.currentStateIndex,
      // Remove OLD undo system fields
      // currentMoveIndex: this.currentMoveIndex,
      // initialEngineState: this.initialEngineState,
      selectedSquare: this.selectedSquare,
      possibleMoves: this.possibleMoves,
      gameMode: this.gameMode,
      humanColor: this.humanColor,
      botDifficulty: this.botDifficulty,
      allowUndo: this.allowUndo,
      boardFlipped: this.boardFlipped,
      orientationMode: this.orientationMode,
      castlingRights: this.castlingRights,
      enPassantTarget: this.enPassantTarget,
      soundEnabled: this.soundEnabled, // Store sound preference
      engineState: engineState // Store engine state for perfect restoration
    };
  }
  
  /**
   * Load game state
   */
  loadGameState(state, options = {}) {
    // Restore engine state if available
    if (state.engineState) {
      this.engine = new window.jsChessEngine.Game(state.engineState);
    } else {
      // Fallback: recreate from board position
      const config = {
        pieces: {},
        turn: state.currentPlayer,
        castling: {
          whiteShort: state.castlingRights?.white?.kingside || false,
          whiteLong: state.castlingRights?.white?.queenside || false,
          blackShort: state.castlingRights?.black?.kingside || false,
          blackLong: state.castlingRights?.black?.queenside || false
        },
        enPassant: state.enPassantTarget || null
      };
      
      // Convert board to engine format
      const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = state.board[row][col];
          if (piece) {
            const square = files[col] + ranks[row];
            const typeMap = {
              'pawn': 'P', 'rook': 'R', 'knight': 'N',
              'bishop': 'B', 'queen': 'Q', 'king': 'K'
            };
            const notation = typeMap[piece.type];
            config.pieces[square] = piece.color === 'white' ? notation : notation.toLowerCase();
          }
        }
      }
      
      this.engine = new window.jsChessEngine.Game(config);
    }
    
    // Restore UI state
    this.selectedSquare = state.selectedSquare || null;
    this.possibleMoves = state.possibleMoves || [];
    // Only restore gameMode if not explicitly preserving the current one
    if (!options.preserveGameMode) {
      
      this.gameMode = state.gameMode || 'human-vs-bot';
    } else {
      
    }
    this.humanColor = state.humanColor || 'white';
    this.botDifficulty = state.botDifficulty !== undefined ? state.botDifficulty : 1;
    this.allowUndo = state.allowUndo !== undefined ? state.allowUndo : true;
    // Load orientation mode but DON'T recalculate flip state yet (currentPlayer not set)
    this.orientationMode = state.orientationMode || 'handoff';
    // Temporarily set boardFlipped to saved value or false
    this.boardFlipped = false; // Will be recalculated after updateCachedState()
    this.soundEnabled = state.soundEnabled !== undefined ? state.soundEnabled : true; // Restore sound preference
    this.moveHistory = state.moveHistory || [];

    // R1 Memory Management: Apply same limit to moveHistory
    const MAX_HISTORY_LENGTH = 100;
    if (this.moveHistory.length > MAX_HISTORY_LENGTH - 1) {
      
      this.moveHistory = this.moveHistory.slice(-(MAX_HISTORY_LENGTH - 1));
    }

    this.currentMoveIndex = state.currentMoveIndex !== undefined ? state.currentMoveIndex : this.moveHistory.length - 1;

    // Ensure initial state is properly cloned and validated
    if (state.initialEngineState) {
      this.initialEngineState = JSON.parse(JSON.stringify(state.initialEngineState));
    } else {
      // If no initial state in save, create fresh one
      const freshGame = new window.jsChessEngine.Game();
      this.initialEngineState = JSON.parse(JSON.stringify(freshGame.exportJson()));
    }

    // Validate loaded initial state
    if (!this.initialEngineState.pieces || !this.initialEngineState.pieces['E2']) {
      
      const freshGame = new window.jsChessEngine.Game();
      this.initialEngineState = JSON.parse(JSON.stringify(freshGame.exportJson()));
    }

    // Update cached state
    this.updateCachedState();

    // NOW recalculate boardFlipped after currentPlayer is set
    this.boardFlipped = this.determineOrientation();
    

    // CRITICAL FIX: Handle stateHistory for the new undo/redo system
    // Check if we have saved stateHistory (new saves) or need to rebuild it (old saves)
    if (state.stateHistory && state.stateHistory.length > 0) {
      // NEW: Restore saved stateHistory directly
      
      this.stateHistory = state.stateHistory;
      this.currentStateIndex = state.currentStateIndex || (state.stateHistory.length - 1);

      // R1 Memory Management: Apply history limit during load
      const MAX_HISTORY_LENGTH = 100;
      if (this.stateHistory.length > MAX_HISTORY_LENGTH) {
        const removedCount = this.stateHistory.length - MAX_HISTORY_LENGTH;
        

        // Keep initial state + most recent states
        this.stateHistory = [
          this.stateHistory[0],  // Always keep initial state
          ...this.stateHistory.slice(-(MAX_HISTORY_LENGTH - 1))
        ];

        // Adjust current index if needed
        const wasAtEnd = this.currentStateIndex === state.stateHistory.length - 1;
        if (wasAtEnd) {
          // If we were at the last state, stay at the last state
          this.currentStateIndex = this.stateHistory.length - 1;
        } else {
          // Otherwise, clamp to valid range
          this.currentStateIndex = Math.min(this.currentStateIndex, this.stateHistory.length - 1);
        }

        
      }
    } else {
      // OLD: Rebuild stateHistory from moveHistory for backward compatibility
      
      this.stateHistory = [];
      this.currentStateIndex = 0;

      // First, store the TRUE initial state (empty board)
      const freshGame = new window.jsChessEngine.Game();
      this.stateHistory.push({
        engineState: JSON.parse(JSON.stringify(freshGame.exportJson())),
        move: null,
        notation: null,
        timestamp: Date.now()
      });

      // If we have moves in history, rebuild states by replaying them
      if (state.moveHistory && state.moveHistory.length > 0) {
        

        // Start with a fresh engine to replay moves
        const replayEngine = new window.jsChessEngine.Game();

        // Replay each move and store the state after each move
        for (let i = 0; i < state.moveHistory.length; i++) {
          const move = state.moveHistory[i];
          const from = this.coordsToSquare(move.from.row, move.from.col);
          const to = this.coordsToSquare(move.to.row, move.to.col);

          try {
            replayEngine.move(from, to);

            // Store the state after this move
            this.stateHistory.push({
              engineState: JSON.parse(JSON.stringify(replayEngine.exportJson())),
              move: move,
              notation: move.notation || `${from}-${to}`,
              timestamp: Date.now()
            });
            this.currentStateIndex++;
          } catch (error) {
            
            // Stop rebuilding if a move fails
            break;
          }
        }

        
      } else {
        // No moves, just the initial state
        
      }
    }
  }
  
  /**
   * Auto-save the game
   */
  async autoSave() {
    try {
      const state = this.getGameState();
      const key = this.getStorageKey();
      await saveToStorage(key, state);

      // Also save the current game mode separately so we know which to load
      await saveToStorage('last_game_mode', { mode: this.gameMode, timestamp: Date.now() });

      
      return true;
    } catch (error) {
      
      return false;
    }
  }
  
  /**
   * Get storage key for current game mode
   */
  getStorageKey() {
    // Replace hyphens with underscores for consistent storage keys
    return `chess_game_state_${this.gameMode.replace(/-/g, '_')}`;
  }
  
  // ============================================
  // UI HELPER METHODS
  // ============================================
  
  /**
   * Check if it's human's turn
   */
  isHumanTurn() {
    if (this.gameMode === 'human-vs-human') {
      return true; // Always human's turn in this mode
    }
    return this.currentPlayer === this.humanColor;
  }
  
  /**
   * Get game mode display text
   */
  getGameModeDisplayText() {
    if (this.gameMode === 'human-vs-human') {
      return 'Human vs Human';
    } else {
      return `Human (${this.humanColor}) vs Bot`;
    }
  }

  /**
   * Get bot difficulty text
   */
  getBotDifficultyText() {
    const difficulties = {
      0: 'Eric',
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
   * Get game mode options for UI
   */
  getGameModeOptions() {
    return [
      { value: 'human-vs-bot', label: 'Human vs Bot' },
      { value: 'human-vs-human', label: 'Human vs Human' }
    ];
  }
  
  // ============================================
  // SOUND SYSTEM
  // ============================================
  
  /**
   * Create smart wooden sound system
   */
  createSoundSystem() {
    const sounds = {};

    // Use imported wooden sound data (no longer need window global)
    const woodenData = woodenSoundData;

    // Organize sounds for smart system
    const soundFiles = {
      moves: [
        woodenData.move_1,
        woodenData.move_2,
        woodenData.move_3,
        woodenData.move_4,
        woodenData.move_5
      ],
      quick: [
        woodenData.quick_1,
        woodenData.quick_2
      ],
      pop_check: woodenData.pop_check
    };

    // Track last played move sound to avoid repeats
    let lastMoveIndex = -1;

    // Track if audio has been initialized (for Chrome/Android)
    let audioInitialized = false;
    let audioContext = null;

    // Initialize audio context on first user interaction
    const initializeAudio = () => {
      if (audioInitialized) return;

      try {
        // Create AudioContext for Chrome/Android compatibility
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !audioContext) {
          audioContext = new AudioContext();
          // Resume if suspended (Chrome autoplay policy)
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
        }

        // Play a silent sound to unlock audio
        const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCDS');
        silentAudio.volume = 0.01;
        silentAudio.play().catch(() => {});

        audioInitialized = true;
      } catch (e) {
        // console.log('Audio initialization failed:', e); // Commented for performance
      }
    };

    // Helper to play audio with volume control
    const playAudio = (base64Data, volume = 0.4) => {
      if (!this.soundEnabled || !base64Data) return Promise.resolve();

      // Initialize audio on first play attempt
      initializeAudio();

      const audio = new Audio(base64Data);
      audio.volume = volume;

      // Handle Chrome/Android autoplay restrictions
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        return playPromise.catch((error) => {
          // If autoplay blocked, try to play on next user interaction
          if (error.name === 'NotAllowedError') {
            // Store for retry on next user interaction
            document.addEventListener('click', () => {
              audio.play().catch(() => {});
            }, { once: true });
          }
        });
      }
      return Promise.resolve();
    };

    // Smart move sound - no repeats
    sounds.move = () => {
      const availableIndices = soundFiles.moves
        .map((_, i) => i)
        .filter(i => i !== lastMoveIndex);

      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      lastMoveIndex = availableIndices[randomIndex];

      playAudio(soundFiles.moves[lastMoveIndex]);
    };

    // Capture sound - two different sounds with volume variation
    // First sound softer (piece touching), second normal (piece being placed)
    sounds.capture = () => {
      const allSounds = [...soundFiles.moves, ...soundFiles.quick];

      // Pick first sound randomly
      const index1 = Math.floor(Math.random() * allSounds.length);
      const sound1 = allSounds[index1];

      // Pick second sound (different from first)
      const availableSounds = allSounds.filter((_, i) => i !== index1);
      const index2 = Math.floor(Math.random() * availableSounds.length);
      const sound2 = availableSounds[index2];

      // Play first sound softer (0.25 volume), second normal (0.4 volume)
      playAudio(sound1, 0.25);  // Soft touch as piece is picked up
      setTimeout(() => playAudio(sound2, 0.4), 50);  // Normal volume for placing piece
    };

    // Check sound
    sounds.check = () => {
      playAudio(soundFiles.pop_check);
    };

    // Checkmate sound (same as check)
    sounds.checkmate = () => {
      playAudio(soundFiles.pop_check);
    };

    // New game sound (random move sound)
    sounds.newGame = () => {
      const randomIndex = Math.floor(Math.random() * soundFiles.moves.length);
      playAudio(soundFiles.moves[randomIndex]);
    };

    // Victory sound (same as check) - ADDED
    sounds.victory = () => {
      playAudio(soundFiles.pop_check);
    };

    // Game end sound (random move sound) - ADDED
    sounds.gameEnd = () => {
      const randomIndex = Math.floor(Math.random() * soundFiles.moves.length);
      playAudio(soundFiles.moves[randomIndex]);
    };

    return sounds;
  }
  
  /**
   * Play a sound
   */
  playSound(soundName) {
    
    if (this.sounds && this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }
  
  // ============================================
  // METHODS FOR COMPATIBILITY (NO-OP OR SIMPLE)
  // ============================================
  
  // These methods are kept for UI compatibility but don't do complex logic
  
  initializeBoard() {
    // Not needed - engine handles board state
  }
  
  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
  
  canUndo() {
    // NEW SIMPLIFIED LOGIC
    // Can undo if we're not at the initial state (index 0)
    return this.allowUndo && this.currentStateIndex > 0;
  }

  canRedo() {
    // NEW SIMPLIFIED LOGIC
    // Can redo if we're not at the last state
    return this.allowUndo && this.currentStateIndex < this.stateHistory.length - 1;
  }

  // Reconstruct engine state by replaying moves from initial state
  reconstructEngineState(targetIndex) {
    if (targetIndex === 0) {
      return this.stateHistory[0].engineState;
    }

    // Start with initial state
    const initialState = this.stateHistory[0].engineState;
    if (!initialState) {
      
      return null;
    }

    // Create new engine with initial state
    const tempEngine = new window.jsChessEngine.Game(JSON.parse(JSON.stringify(initialState)));

    // Replay moves up to target index
    for (let i = 1; i <= targetIndex; i++) {
      const moveData = this.stateHistory[i].move;
      if (!moveData) {
        
        break;
      }

      const from = this.coordsToSquare(moveData.from.row, moveData.from.col);
      const to = this.coordsToSquare(moveData.to.row, moveData.to.col);

      try {
        tempEngine.move(from, to);
      } catch (e) {
        
        break;
      }
    }

    return tempEngine.exportJson();
  }

  undoMove() {
    // NEW SIMPLIFIED UNDO - Direct state restoration
    if (!this.canUndo()) {
      
      return false;
    }

    

    // Check if the move we're undoing was a capture (for sound replay)
    const undoingState = this.stateHistory[this.currentStateIndex];
    const wasCapture = undoingState && undoingState.captured;

    // Move index back
    this.currentStateIndex--;

    // Restore the engine to the previous state
    const targetState = this.stateHistory[this.currentStateIndex];

    // Get engine state - either stored or reconstructed
    let engineState;
    if (targetState.engineState) {
      // Use stored state if available (index 0)
      engineState = JSON.parse(JSON.stringify(targetState.engineState));
    } else {
      // Reconstruct state by replaying moves from initial
      engineState = this.reconstructEngineState(this.currentStateIndex);
    }

    if (!engineState) {
      
      return false;
    }

    this.engine = new window.jsChessEngine.Game(engineState);


    // Update cached state (this will call engineStateToBoard internally)
    this.updateCachedState();
    this.updateGameStatus();

    // Force immediate board update to ensure UI synchronization
    this.board = this.engineStateToBoard();

    // Don't recalculate orientation here - updateDisplay will handle it
    // This prevents double rotation during undo
    // this.boardFlipped = this.determineOrientation();
    

    

    // Clear selection
    this.selectedSquare = null;
    this.possibleMoves = [];

    // Set flag to indicate we're in undo/redo state
    this.isInUndoRedoState = true;

    // Play appropriate sound for the move being undone
    // Play action sound (capture or move)
    if (wasCapture) {
      this.playSound('capture');
      
    } else {
      this.playSound('move');
      
    }

    // Play status sound with delay if there was a capture
    // Check the restored state for check/checkmate status
    if (this.gameStatus === 'checkmate') {
      setTimeout(() => this.playSound('checkmate'), wasCapture ? 100 : 0);
      
    } else if (this.gameStatus === 'check') {
      setTimeout(() => this.playSound('check'), wasCapture ? 100 : 0);
      
    }

    return true;
  }

  redoMove() {
    // NEW SIMPLIFIED REDO - Direct state restoration
    if (!this.canRedo()) {
      
      return false;
    }

    

    // Move index forward
    this.currentStateIndex++;

    // Restore the engine to the next state
    const targetState = this.stateHistory[this.currentStateIndex];

    // Get engine state - either stored or reconstructed
    let engineState;
    if (targetState.engineState) {
      // Use stored state if available (index 0)
      engineState = JSON.parse(JSON.stringify(targetState.engineState));
    } else {
      // Reconstruct state by replaying moves from initial
      engineState = this.reconstructEngineState(this.currentStateIndex);
    }

    if (!engineState) {
      
      return false;
    }

    this.engine = new window.jsChessEngine.Game(engineState);

    // Update cached state (this will call engineStateToBoard internally)
    this.updateCachedState();
    this.updateGameStatus();

    // Force immediate board update to ensure UI synchronization
    this.board = this.engineStateToBoard();

    // Don't recalculate orientation here - updateDisplay will handle it
    // This prevents double rotation during redo
    // this.boardFlipped = this.determineOrientation();
    

    
    if (targetState.move) {
      
    }

    // Clear selection
    this.selectedSquare = null;
    this.possibleMoves = [];

    // Set flag to indicate we're in undo/redo state
    this.isInUndoRedoState = true;

    // Play appropriate sound for the move being redone
    // Check if the redone move was a capture
    const wasCapture = targetState.move && targetState.move.captured;

    // Play action sound (capture or move)
    if (wasCapture) {
      this.playSound('capture');
      
    } else {
      this.playSound('move');
      
    }

    // Play status sound with delay if there was a capture
    // Check the restored state for check/checkmate status
    if (this.gameStatus === 'checkmate') {
      setTimeout(() => this.playSound('checkmate'), wasCapture ? 100 : 0);
      
    } else if (this.gameStatus === 'check') {
      setTimeout(() => this.playSound('check'), wasCapture ? 100 : 0);
      
    }

    return true;
  }

  getCurrentMoveIndex() {
    // NEW: Return current state index minus 1 (since index 0 is initial state)
    // This maintains backward compatibility with UI expectations
    return this.currentStateIndex - 1;
  }

  getCapturedPieces() {
    const whiteCaptured = [];
    const blackCaptured = [];

    // NEW: Use state history, skip index 0 (initial state)
    // Only count captures up to currentStateIndex
    for (let i = 1; i <= this.currentStateIndex && i < this.stateHistory.length; i++) {
      const state = this.stateHistory[i];
      if (state.move && state.move.captured) {
        if (state.move.captured.color === 'white') {
          whiteCaptured.push(state.move.captured);
        } else {
          blackCaptured.push(state.move.captured);
        }
      }
    }

    // Sort by piece value for better display
    const pieceOrder = { 'queen': 1, 'rook': 2, 'bishop': 3, 'knight': 4, 'pawn': 5 };
    whiteCaptured.sort((a, b) => (pieceOrder[a.type] || 6) - (pieceOrder[b.type] || 6));
    blackCaptured.sort((a, b) => (pieceOrder[a.type] || 6) - (pieceOrder[b.type] || 6));

    return { whiteCaptured, blackCaptured };
  }
  
  validateGameState() {
    // Always valid when using engine
    return true;
  }
  
  coordsToChessNotation(row, col) {
    return this.coordsToSquare(row, col);
  }
  
  generateMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, isCheck, isCheckmate) {
    const from = this.coordsToSquare(fromRow, fromCol);
    const to = this.coordsToSquare(toRow, toCol);
    return `${from}-${to}`;
  }
  
  generateMoveCommentary(fromRow, fromCol, toRow, toCol, piece, capturedPiece, special) {
    const from = this.coordsToSquare(fromRow, fromCol);
    const to = this.coordsToSquare(toRow, toCol);
    const pieceColor = piece.color.charAt(0).toUpperCase() + piece.color.slice(1);

    if (capturedPiece) {
      return `${pieceColor} ${piece.type} captures ${to} ${capturedPiece.type}`;
    }
    return `${pieceColor} ${piece.type} to ${to}`;
  }
  
  calculateMaterialBalance() {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0
    };
    
    let whiteValue = 0;
    let blackValue = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          if (piece.color === 'white') {
            whiteValue += value;
          } else {
            blackValue += value;
          }
        }
      }
    }
    
    return whiteValue - blackValue;
  }
  
  countPieces() {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col]) {
          count++;
        }
      }
    }
    return count;
  }
  
  calculateBoardChecksum(board) {
    // Simple checksum for compatibility
    return JSON.stringify(board).length;
  }
  
  calculateMoveHistoryChecksum(moveHistory) {
    // Simple checksum for compatibility
    return moveHistory.length;
  }
  
  testSaveLoadCycle() {
    // Always return true - save/load is simplified
    return Promise.resolve(true);
  }
  
  getPieceSymbol(piece) {
    if (!piece) return '';
    const symbols = {
      // Use black (solid) Unicode symbols for both colors - CSS handles the white appearance
      'king': { white: '♚', black: '♚' },
      'queen': { white: '♛', black: '♛' },
      'rook': { white: '♜', black: '♜' },
      'bishop': { white: '♝', black: '♝' },
      'knight': { white: '♞', black: '♞' },
      // Use pawn with variation selector to force text rendering (not emoji)
      'pawn': { white: '♟︎', black: '♟︎' }  // U+265F + U+FE0E
    };
    return symbols[piece.type]?.[piece.color] || '';
  }
  
  // ============================================
  // UI COMPATIBILITY METHODS
  // ============================================
  // These methods are needed by ChessUI for error feedback
  
  /**
   * Check if player is currently in check
   * Delegates directly to engine for single source of truth
   */
  isInCheck() {
    const state = this.engine.exportJson();
    return state.check || state.checkMate;
  }
  
  // REMOVED: wouldBeInCheck() method
  // This was redundant since js-chess-engine already handles all check validation
  // The engine's getPossibleMoves() already filters out any moves that would leave king in check
  
  // ============================================
  // DELETED METHODS (800+ lines eliminated!)
  // ============================================
  // The following methods have been completely removed:
  // - getPawnMoves, getRookMoves, getKnightMoves, getBishopMoves, getQueenMoves, getKingMoves
  // - canCastle, isSquareAttacked, getPieceAttacks, getPawnAttacks, getKingAttacks
  // - wouldCaptureKing (NOTE: wouldBeInCheck still exists at lines 911-920)
  // - hasValidMoves, isInCheck, isPlayerInCheck, isCheckmate
  // - getSimplePieceMoves, evaluateQuickMove, evaluateMove
  // - getCenterControlBonus, getDevelopmentBonus, getKingSafetyBonus, getMobilityBonus
  // - isPieceHanging, getPositionalBonus, isPassedPawn, isOnLongDiagonal, isOpenFile
  // - getPieceValue, getGamePhase, getPhaseMultiplier, countTotalPieces
  // - evaluateTacticalThreats, evaluateStrategicPositioning, evaluateKingSafety
  // - evaluatePieceCoordination, detectForkTargets, createsPinAfterMove
  // - evaluatePieceActivity, getKingActivityBonus, findKing, countSupportedPieces
  // - getPieceAttackDirections, getPossibleMovesForPieceAt, evaluatePawnStructure
  // - evaluateDefensiveValue, evaluateAdvancedPositional, blocksCheck
  // - calculateBoardStateHash, calculateBotDelay
  // Total: ~800 lines eliminated!
}
// Global game instance
let chessGame;
let gameUI;

// ===========================================
// Chess Game UI
// ===========================================

class ChessUI {
  constructor(game) {
    this.game = game;
    this.boardElement = document.getElementById('chess-board');
    this.moveDisplayElement = document.getElementById('move-display');
    this.gameStatusElement = document.getElementById('game-status');
    this.isFlipping = false; // Flag to prevent interactions during flip animation
    this.inputEnabled = true; // Flag to control user input during bot turns
    this.lastAlertTime = 0; // Prevent double alerts
    this.alertCooldown = 1000; // Minimum time between alerts (ms)
    this.audioInitialized = false; // Track audio initialization for Chrome/Android

    // Initialize audio on first user interaction (Chrome/Android requirement)
    const initAudioOnInteraction = () => {
      if (!this.audioInitialized) {
        // Trigger a dummy sound play to initialize the audio system
        this.game.playSound('move');
        this.audioInitialized = true;
        // Remove all initialization listeners after first interaction
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('touchstart', initAudioOnInteraction);
      }
    };

    // Add listeners for audio initialization
    document.addEventListener('click', initAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', initAudioOnInteraction, { once: true });

    // Add click handler for expand button
    const expandButton = document.getElementById('move-expand');
    if (expandButton) {
      expandButton.addEventListener('click', () => {
        const fullText = expandButton.dataset.fullText;
        if (fullText) {
          this.showNotification(fullText, 'info', 3000);
        }
      });
    }

    this.initializeBoard();
    this.updateDisplay();

    // Check if it's bot's turn at startup (for human-vs-bot mode when human plays black)
    this.checkInitialBotTurn();
  }

  initializeBoard() {
    this.boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.className = 'chess-square';
        square.dataset.row = row;
        square.dataset.col = col;
        
        // Add alternating colors based on position
        const isLight = (row + col) % 2 === 0;
        square.classList.add(isLight ? 'light-square' : 'dark-square');
        
        // Enhanced touch support for R1 device with optimized performance
        square.addEventListener('click', async (e) => await this.handleSquareClick(e));
        square.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        square.addEventListener('touchend', async (e) => await this.handleTouchEnd(e), { passive: false });
        square.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false });
        
        this.boardElement.appendChild(square);
      }
    }
    
    this.applyTheme();
  }

  async handleSquareClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    await this.handleSquareSelection(row, col);
  }

  handleTouchStart(event) {
    event.preventDefault();
    this.touchStartTime = Date.now();
    this.touchTarget = event.target;

    // Add immediate visual feedback using class instead of inline style
    if (event.target.classList.contains('chess-square')) {
      event.target.classList.add('touch-active');
    }
  }

  async handleTouchEnd(event) {
    event.preventDefault();

    // Remove visual feedback immediately
    if (this.touchTarget && this.touchTarget.classList.contains('chess-square')) {
      this.touchTarget.classList.remove('touch-active');
    }

    // Process touch immediately for better responsiveness (reduced from 500ms to 300ms)
    if (this.touchStartTime && Date.now() - this.touchStartTime < 300) {
      // Get the square from the touch target
      let square = event.target;
      while (square && !square.dataset.row) {
        square = square.parentElement;
      }
      
      if (square && square.dataset.row !== undefined) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        await this.handleSquareSelection(row, col);
      }
    }
    
    this.touchStartTime = null;
    this.touchTarget = null;
  }

  handleTouchCancel(event) {
    event.preventDefault();

    // Remove visual feedback immediately
    if (this.touchTarget && this.touchTarget.classList.contains('chess-square')) {
      this.touchTarget.classList.remove('touch-active');
    }
    
    this.touchStartTime = null;
    this.touchTarget = null;
  }

  // Convert display coordinates to logical coordinates based on board flip
  getLogicalCoordinates(displayRow, displayCol) {
    // Apply coordinate reversal based on game mode:
    // - Bot games: Always use coordinate reversal when boardFlipped (black at bottom)
    // - Table mode: Use coordinate reversal (with CSS rotation)
    // - Handoff mode: NO coordinate reversal (CSS rotation only)
    // - None mode in human-vs-human: No reversal
    const isBotGame = this.game.gameMode === 'human-vs-bot';
    const isTableMode = this.game.orientationMode === 'table';
    const needsCoordinateReversal = this.game.boardFlipped &&
                                    (isBotGame || isTableMode);

    if (needsCoordinateReversal) {
      return {
        row: 7 - displayRow,
        col: 7 - displayCol
      };
    }
    return { row: displayRow, col: displayCol };
  }

  // Convert logical coordinates to display coordinates based on board flip
  getDisplayCoordinates(logicalRow, logicalCol) {
    // Apply coordinate reversal based on game mode:
    // - Bot games: Always use coordinate reversal when boardFlipped (black at bottom)
    // - Table mode: Use coordinate reversal (with CSS rotation)
    // - Handoff mode: NO coordinate reversal (CSS rotation only)
    // - None mode in human-vs-human: No reversal
    const isBotGame = this.game.gameMode === 'human-vs-bot';
    const isTableMode = this.game.orientationMode === 'table';
    const needsCoordinateReversal = this.game.boardFlipped &&
                                    (isBotGame || isTableMode);

    if (needsCoordinateReversal) {
      return {
        row: 7 - logicalRow,
        col: 7 - logicalCol
      };
    }
    return { row: logicalRow, col: logicalCol };
  }

  // Flip the board with animation
  flipBoard(callback) {
    if (this.isFlipping) return; // Prevent multiple simultaneous flips

    this.isFlipping = true;
    // Add flip animation class
    this.boardElement.style.transform = 'rotateY(90deg)';
    this.boardElement.style.transition = 'transform 0.3s ease-in-out';

    setTimeout(() => {
      // Use deterministic orientation instead of blind toggle
      const shouldFlip = this.game.determineOrientation();
      this.game.boardFlipped = shouldFlip;
      this.updateDisplay();
      
      // Complete the flip
      this.boardElement.style.transform = 'rotateY(0deg)';
      
      setTimeout(() => {
        this.boardElement.style.transition = '';
        this.isFlipping = false;
        if (callback) callback();
      }, 150);
    }, 150);
  }

  // Update board perspective without animation (for undo/redo)
  updateBoardPerspective() {
    if (this.isFlipping) return; // Don't interfere with ongoing animation

    const currentFlipState = this.game.boardFlipped;
    const wasFlipped = this.boardElement.classList.contains('flipped');

    

    // Update the board flip state immediately without animation
    if (currentFlipState && !wasFlipped) {
      this.boardElement.classList.add('flipped');
    } else if (!currentFlipState && wasFlipped) {
      this.boardElement.classList.remove('flipped');
    }
    
    // Update the display with the current flip state
    this.updateDisplay();
  }

  // Handle bot turn in human-vs-bot mode
  // Enhanced bot move activation system for initial and subsequent turns
  async handleBotTurn() {
    // CRITICAL: Never trigger bot during redo
    if (this.game.isPerformingRedo) {
      
      return;
    }

    const gameMode = this.game.gameMode;
    const isBotTurn = this.game.isBotTurn();
    const gameStatus = this.game.gameStatus;
    const currentPlayer = this.game.currentPlayer;
    const humanColor = this.game.getHumanColor();

    // Bot activation check

    // Validate bot turn conditions
    if (gameMode !== 'human-vs-bot') {
      return;
    }

    if (!isBotTurn) {
      return;
    }

    // Check if game is over
    if (gameStatus !== 'playing' && gameStatus !== 'check') {
      this.showBotThinking(false);
      this.setInputEnabled(false); // Keep disabled for game end
      return;
    }

    // Determine if this is an initial bot move (first move of game)
    const isInitialBotMove = (!this.game.moveHistory || this.game.moveHistory.length === 0) && isBotTurn;
    const moveType = isInitialBotMove ? 'INITIAL' : 'SUBSEQUENT';

    // Always ensure user input is disabled and thinking indicator is shown
    this.setInputEnabled(false);
    this.showBotThinking(true);

    // Update UI state to reflect bot's turn
    this.updateGameStateIndicators();

    // Show notification after 4 seconds delay to avoid spam on fast moves
    let notificationShown = false;
    const notificationTimer = setTimeout(() => {
      this.showNotification(
        `${this.game.getBotDifficultyText()} is thinking...`,
        'info',
        10000 // Show for 10 seconds max
      );
      notificationShown = true;
    }, 4000); // 4 second delay

    try {
      // Add slight delay for initial moves to allow UI to settle
      if (isInitialBotMove) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Execute bot move with enhanced error handling
      const botResult = await this.game.executeBotMove();

      // Clear notification timer if bot finishes before 4 seconds
      clearTimeout(notificationTimer);

      // Hide notification if it was shown
      if (notificationShown) {
        const label = document.getElementById('instruction-label');
        if (label && !label.classList.contains('hidden')) {
          label.classList.add('hidden');
        }
      }

      // If notification was shown, hide it immediately
      if (notificationShown) {
        const label = document.getElementById('instruction-label');
        if (label && !label.classList.contains('hidden')) {
          label.classList.add('hidden');
          // Clear any notification timeout to prevent conflicts
          if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
          }
        }
      }
      
      if (botResult && botResult.success) {
        // Update display after bot move
        this.updateDisplay();
        
        // Check if bot put human in check
        if (botResult.enteredCheck) {
          // Bot put human in check - highlight human's king
          // After bot moves, currentPlayer is now humanColor (it's human's turn)
          // So we should highlight the human's king who is in check
          this.highlightKing(this.game.humanColor);
        }

        // Sound is already played in generateBotMove() - removed duplicate

        // Hide thinking indicator and re-enable input only after successful move
        this.showBotThinking(false);
        
        // Check if game ended after bot move
        if (this.game.gameStatus === 'checkmate' || this.game.gameStatus === 'stalemate') {
          this.setInputEnabled(false); // Keep disabled for game end
          this.handleGameEnd();
        } else {
          // Game continues - enable input for human's turn
          this.setInputEnabled(true);
        }
        
      } else {
        // Hide thinking indicator and show error
        this.showBotThinking(false);
        this.showNotification(`Bot move failed - your turn`, 'error');
        this.setInputEnabled(true);
        
        setTimeout(() => {
          this.hideInstructionLabel();
        }, 3000);
      }
    } catch (error) {
      // Hide thinking indicator and re-enable input on error
      this.showBotThinking(false);
      this.setInputEnabled(true);
      this.showNotification(`Bot error - your turn`, 'error');
      
      setTimeout(() => {
        this.hideInstructionLabel();
      }, 3000);
    }
  }

  // Enable/disable user input
  setInputEnabled(enabled) {
    this.inputEnabled = enabled;
    
    // Visual feedback for disabled state
    if (enabled) {
      this.boardElement.style.opacity = '1';
      this.boardElement.style.pointerEvents = 'auto';
    } else {
      this.boardElement.style.opacity = '0.7';
      this.boardElement.style.pointerEvents = 'none';
    }
  }

  // Enhanced bot thinking indicator with state synchronization and styling
  showBotThinking(show) {
    const gameMode = this.game.gameMode;
    const isBotTurn = this.game.isBotTurn();
    const gameStatus = this.game.gameStatus;

    const instructionLabel = document.getElementById('instruction-label');
    const moveDisplay = document.getElementById('move-display');

    if (show && gameMode === 'human-vs-bot' && isBotTurn && (gameStatus === 'playing' || gameStatus === 'check')) {
      // Don't hide instruction label if it contains bot thinking message
      if (instructionLabel && !instructionLabel.textContent.includes('analyzing deeply')) {
        this.hideInstructionLabel();
      }

      // Add spinner to move display
      if (moveDisplay && !document.querySelector('.bot-thinking-spinner')) {
        const spinner = document.createElement('div');
        spinner.className = 'bot-thinking-spinner';
        moveDisplay.parentElement.appendChild(spinner);
      }

      // Ensure input is disabled when bot is thinking
      if (this.inputEnabled) {
        this.setInputEnabled(false);
      }

      // Update turn indicator to reflect bot thinking state
      this.updatePlayerTurnIndicator(this.game.currentPlayer, gameMode);

    } else {
      // Hide thinking indicator
      this.hideInstructionLabel();

      // Remove spinner
      const spinner = document.querySelector('.bot-thinking-spinner');
      if (spinner) {
        spinner.remove();
      }

      // Update turn indicator when thinking stops
      if (gameMode === 'human-vs-bot') {
        this.updatePlayerTurnIndicator(this.game.currentPlayer, gameMode);
      }
    }
  }

  hideInstructionLabel() {
    const instructionLabel = document.getElementById('instruction-label');
    if (instructionLabel) {
      instructionLabel.classList.add('hidden');
      instructionLabel.textContent = '';
    }
  }

  // Enhanced UI feedback system for game state transitions
  handleGameEnd() {
    const gameStatus = this.game.gameStatus;
    const currentPlayer = this.game.currentPlayer;

    // Disable all input
    this.setInputEnabled(false);

    // Determine if player won for sound effects
    let isVictory = false;

    if (gameStatus === 'checkmate') {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      if (this.game.gameMode === 'human-vs-bot') {
        if ((this.game.humanColor === 'white' && winner === 'White') ||
            (this.game.humanColor === 'black' && winner === 'Black')) {
          isVictory = true;
        }
      } else {
        // In human vs human, just play victory sound
        isVictory = true;
      }
    }

    // Game status is already shown in header, no notification needed

    // Play appropriate sound
    if (this.game.soundEnabled && this.game.sounds) {
      if (isVictory) {
        this.game.sounds.victory();
      } else {
        this.game.sounds.gameEnd();
      }
    }
  }

  // Show game end message with enhanced visual feedback
  // showGameEndMessage removed - game status shown in header

  // Enhanced game state feedback
  updateGameStateIndicators() {
    const gameStatus = this.game.gameStatus;
    const currentPlayer = this.game.currentPlayer;
    const gameMode = this.game.gameMode;

    // Update player turn indicator
    this.updatePlayerTurnIndicator(currentPlayer, gameMode);

    // Update captured pieces display
    this.updateCapturedPiecesDisplay();

    // Update move history display
    this.updateMoveHistoryDisplay();
  }

  // Enhanced player turn indicator with synchronized bot state
  updatePlayerTurnIndicator(currentPlayer, gameMode) {
    const turnIndicator = document.getElementById('current-player');
    if (!turnIndicator) return;

    // Calculate material balance to include in display
    let balanceText = '';
    try {
      const materialBalance = this.game.calculateMaterialBalance();

      // Show positive for current player if they have advantage, negative if disadvantage
      if (currentPlayer === 'white') {
        if (materialBalance > 0) {
          balanceText = ` (+${materialBalance})`;
        } else if (materialBalance < 0) {
          balanceText = ` (${materialBalance})`;
        }
      } else {
        // For black player, flip the sign
        if (materialBalance < 0) {
          balanceText = ` (+${Math.abs(materialBalance)})`;
        } else if (materialBalance > 0) {
          balanceText = ` (-${materialBalance})`;
        }
      }
    } catch (e) {
      // If material balance calculation fails, just skip it
      
    }

    let message = '';
    let indicatorClass = `player-indicator ${currentPlayer}`;

    if (gameMode === 'human-vs-bot') {
      const humanColor = this.game.getHumanColor();
      const isBotTurn = this.game.isBotTurn();
      const gameStatus = this.game.gameStatus;

      if (gameStatus === 'checkmate' || gameStatus === 'stalemate') {
        // Game actually ended - show final state
        message = `Game Over (${gameStatus})`;
        indicatorClass += ' game-ended';
      } else if (gameStatus === 'check') {
        // In check but not game over
        if (isBotTurn) {
          message = `Bot's turn`;
          indicatorClass += ' bot-turn check';
        } else {
          message = `Your turn`;
          indicatorClass += ' human-turn check';
        }
      } else if (isBotTurn) {
        // Check if bot is currently thinking
        const instructionLabel = document.getElementById('instruction-label');
        const isBotThinking = instructionLabel &&
                             !instructionLabel.classList.contains('hidden') &&
                             instructionLabel.textContent.includes('Bot is thinking');

        if (isBotThinking) {
          message = `Bot is thinking...`;
          indicatorClass += ' bot-thinking';
        } else {
          message = `Bot's turn`;
          indicatorClass += ' bot-turn';
        }
      } else {
        // Human's turn
        message = `Your turn`;
        indicatorClass += ' human-turn';
      }
    } else {
      // Human vs Human mode - no bot difficulty needed
      message = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    }

    turnIndicator.textContent = message;
    turnIndicator.className = indicatorClass;
    
    }

  // Update captured pieces display
  updateCapturedPiecesDisplay() {
    const capturedContainer = document.getElementById('captured-pieces');
    if (!capturedContainer) {
      
      return;
    }

    const { whiteCaptured, blackCaptured } = this.game.getCapturedPieces();
    const gameMode = this.game.gameMode;
    const humanColor = this.game.getHumanColor();

    // Clear existing content
    capturedContainer.innerHTML = '';

    // Always add material balance bar
    const materialBalance = this.game.calculateMaterialBalance();
    const balanceBar = this.createMaterialBalanceBar(materialBalance, gameMode, humanColor);
    capturedContainer.appendChild(balanceBar);

    // Create left and right sections
    const leftSection = document.createElement('div');
    leftSection.className = 'captured-section left';

    const rightSection = document.createElement('div');
    rightSection.className = 'captured-section right';

    if (gameMode === 'human-vs-bot') {
      // Human vs Bot mode - show "White" and "Black" based on who plays which color
      const humanIsWhite = humanColor === 'white';
      const whitePieces = humanIsWhite ? blackCaptured : whiteCaptured;
      const blackPieces = humanIsWhite ? whiteCaptured : blackCaptured;

      // White section - always show label
      const whiteLabel = document.createElement('span');
      whiteLabel.className = 'captured-label';
      whiteLabel.textContent = 'White';
      leftSection.appendChild(whiteLabel);

      const whitePiecesList = document.createElement('span');
      whitePiecesList.className = 'captured-pieces-list';
      whitePiecesList.textContent = whitePieces.length > 0 ?
        whitePieces.map(p => this.game.getPieceSymbol(p)).join('') : '-';
      leftSection.appendChild(whitePiecesList);
      leftSection.dataset.pieceCount = whitePieces.length;

      // Black section - always show label
      const blackLabel = document.createElement('span');
      blackLabel.className = 'captured-label';
      blackLabel.textContent = 'Black';
      rightSection.appendChild(blackLabel);

      const blackPiecesList = document.createElement('span');
      blackPiecesList.className = 'captured-pieces-list';
      blackPiecesList.textContent = blackPieces.length > 0 ?
        blackPieces.map(p => this.game.getPieceSymbol(p)).join('') : '-';
      rightSection.appendChild(blackPiecesList);
      rightSection.dataset.pieceCount = blackPieces.length;
    } else {
      // Human vs Human mode - show "White" and "Black"
      // White section - always show label
      const whiteLabel = document.createElement('span');
      whiteLabel.className = 'captured-label';
      whiteLabel.textContent = 'White';
      leftSection.appendChild(whiteLabel);

      const whitePieces = document.createElement('span');
      whitePieces.className = 'captured-pieces-list';
      whitePieces.textContent = blackCaptured.length > 0 ?
        blackCaptured.map(p => this.game.getPieceSymbol(p)).join('') : '-';
      leftSection.appendChild(whitePieces);
      leftSection.dataset.pieceCount = blackCaptured.length;

      // Black section - always show label
      const blackLabel = document.createElement('span');
      blackLabel.className = 'captured-label';
      blackLabel.textContent = 'Black';
      rightSection.appendChild(blackLabel);

      const blackPieces = document.createElement('span');
      blackPieces.className = 'captured-pieces-list';
      blackPieces.textContent = whiteCaptured.length > 0 ?
        whiteCaptured.map(p => this.game.getPieceSymbol(p)).join('') : '-';
      rightSection.appendChild(blackPieces);
      rightSection.dataset.pieceCount = whiteCaptured.length;
    }

    // Always append sections for consistent spacing
    const sectionsWrapper = document.createElement('div');
    sectionsWrapper.className = 'captured-sections-wrapper';
    sectionsWrapper.appendChild(leftSection);
    sectionsWrapper.appendChild(rightSection);
    capturedContainer.appendChild(sectionsWrapper);

    capturedContainer.style.display = 'flex';
  }

  // Create material balance progress bar
  createMaterialBalanceBar(balance, gameMode, humanColor) {
    const barContainer = document.createElement('div');
    barContainer.className = 'material-balance-bar';

    // Normalize balance to 0-100% scale (50% = balanced)
    // Material balance ranges from -39 (black advantage) to +39 (white advantage)
    const percentage = Math.max(0, Math.min(100, ((balance + 39) / 78) * 100));

    const indicator = document.createElement('div');
    // Set initial className with appropriate advantage class to prevent color flash
    let className = 'balance-indicator';
    if (gameMode === 'human-vs-bot') {
      const humanAdvantage = (humanColor === 'white' && balance > 0) ||
                            (humanColor === 'black' && balance < 0);
      if (humanAdvantage) {
        className += ' human-advantage';
      } else if (balance !== 0) {
        className += ' bot-advantage';
      }
    }
    indicator.className = className;
    indicator.style.width = `${percentage}%`;

    barContainer.appendChild(indicator);
    return barContainer;
  }

  // Enhanced move history display
  updateMoveHistoryDisplay() {
    const moveHistoryElement = document.getElementById('move-history');
    if (!moveHistoryElement || this.game.currentStateIndex <= 0) return;

    // Use stateHistory instead of moveHistory for correct order after undo/redo
    const validStates = this.game.stateHistory.slice(1, this.game.currentStateIndex + 1);
    const recentMoves = validStates.slice(-6); // Show last 6 moves
    let historyHTML = '<div class="move-history-title">Recent Moves:</div>';

    recentMoves.forEach((state, index) => {
      // Determine if bot move based on whose turn it was
      const moveNumber = validStates.indexOf(state) + 1;
      const isBotMove = (this.game.gameMode === 'human-vs-bot' &&
                        state.move && state.move.piece &&
                        state.move.piece.color !== this.game.humanColor);
      const moveClass = isBotMove ? 'bot-move' : 'human-move';
      const playerIcon = isBotMove ? '🤖' : '👤';

      historyHTML += `
        <div class="move-entry ${moveClass}">
          <span class="move-player">${playerIcon}</span>
          <span class="move-notation">${state.notation}</span>
          <span class="move-number">#${moveNumber}</span>
        </div>
      `;
    });

    moveHistoryElement.innerHTML = historyHTML;
  }

  // Enhanced bot initialization for both human white/black scenarios
  checkInitialBotTurn() {
    

    if (this.game.gameMode !== 'human-vs-bot') {
      return;
    }

    const humanColor = this.game.getHumanColor();
    const currentPlayer = this.game.currentPlayer;
    const isBotTurn = this.game.isBotTurn();
    const moveCount = this.game.moveHistory ? this.game.moveHistory.length : 0;

    // If moves have already been made, don't try to make initial bot move
    if (moveCount > 0) {
      
      return;
    }

    // Ensure game is not ended
    if (this.game.gameStatus === 'checkmate' || this.game.gameStatus === 'stalemate') {
      return;
    }

    // CRITICAL: Ensure game status is 'playing' before attempting bot move
    // This prevents the "bot move failed" error
    if (this.game.gameStatus !== 'playing') {
      
      setTimeout(() => {
        this.checkInitialBotTurn();
      }, 500);
      return;
    }

    // Check if bot should make the first move
    if (isBotTurn) {
      
      // Show bot thinking immediately
      this.showBotThinking(true);
      this.setInputEnabled(false);

      // Ensure UI is properly updated before bot move
      this.updateGameStateIndicators();

      // Execute bot move with a delay to ensure everything is ready
      setTimeout(() => {
        // Double-check conditions haven't changed
        const stillBotTurn = this.game.isBotTurn();
        const stillNoMoves = !this.game.moveHistory || this.game.moveHistory.length === 0;

        if (this.game.gameStatus === 'playing' && stillBotTurn && stillNoMoves) {
          
          this.handleBotTurn();
        } else {
          
          // Reset UI if bot already moved
          if (!stillNoMoves) {
            this.showBotThinking(false);
            this.setInputEnabled(true);
            this.updateGameStateIndicators();
          }
        }
      }, 1000); // Reduced delay since we have better checks
    } else {
      // Ensure human can make moves
      this.setInputEnabled(true);
      this.showBotThinking(false);

      // Update UI to show it's human's turn
      this.updateGameStateIndicators();
    }
  }

  // Handle new game start
  onNewGameStart() {
    this.updateDisplay();

    // Only check for initial bot turn if no moves have been made yet
    if (!this.game.moveHistory || this.game.moveHistory.length === 0) {
      this.checkInitialBotTurn();
    }
  }

  async handleSquareSelection(row, col) {
    // Prevent interactions during board flip or when input is disabled
    if (this.isFlipping || this.inputEnabled === false) return;
    
    // In human-vs-bot mode, prevent human from moving during bot's turn
    if (this.game.gameMode === 'human-vs-bot' && this.game.isBotTurn()) {
      // If we're in undo/redo state, allow the user to make a move for bot
      if (this.game.isInUndoRedoState) {
        // Convert display coordinates to logical coordinates first
        const logical = this.getLogicalCoordinates(row, col);
        const logicalRow = logical.row;
        const logicalCol = logical.col;

        // Check if user is clicking on their own piece
        const piece = this.game.board[logicalRow][logicalCol];

        // Always show the appropriate message while in undo state
        if (this.game.lastUndoWasBotMove) {
          this.showNotification(`Bot turn - scroll wheel to redo or make your move`, 'warning');
        } else {
          this.showNotification(`Bot turn - scroll wheel to redo or make your move`, 'warning');
        }

        // Only proceed with piece selection if they clicked their own piece
        if (piece && piece.color === this.game.humanColor) {
          // User is selecting their own piece
          // DON'T clear the flags yet - only clear when they actually make a move
          // This keeps the message showing even after selecting a piece
          // Continue to piece selection logic below
        } else {
          // User clicked empty square or bot piece - keep showing message
          // Don't clear any flags, keep showing the same message
          return;
        }
      } else {
        // Normal gameplay - show wait message
        const instructionLabel = document.getElementById('instruction-label');
        if (!instructionLabel || instructionLabel.classList.contains('hidden') ||
            !instructionLabel.textContent.includes('Bot is thinking')) {
          this.showNotification(`Bot turn`, 'info');
        }
        return;
      }
    }
    
    // Convert display coordinates to logical coordinates
    const logical = this.getLogicalCoordinates(row, col);
    const logicalRow = logical.row;
    const logicalCol = logical.col;
    
    // Piece selection logic
    
    if (this.game.selectedSquare) {
      const fromRow = this.game.selectedSquare.row;
      const fromCol = this.game.selectedSquare.col;
      
      if (fromRow === logicalRow && fromCol === logicalCol) {
        // Deselect if clicking same square
        this.game.selectedSquare = null;
      } else {
        // Check if the attempted move is valid before trying to make it
        const possibleMoves = this.game.getPossibleMoves(fromRow, fromCol);
        const attemptedMove = possibleMoves.find(m => m.row === logicalRow && m.col === logicalCol);
        
        if (attemptedMove) {
          // Move is valid, attempt to make it
          const wasInCheck = this.game.gameStatus === 'check';
          const moveResult = await this.game.makeMove(fromRow, fromCol, logicalRow, logicalCol);
          if (moveResult && moveResult.success) {

            // Clear undo/redo flags now that a move was successfully made
            this.game.isInUndoRedoState = false;
            this.game.lastUndoWasBotMove = false;

            this.game.selectedSquare = null;

            // Orientation is now handled automatically in makeMove()

            // Check if we need to show check alert
            if (moveResult.enteredCheck) {
              // Someone just entered check - status shown in header
              // After a move, currentPlayer has switched to the opponent
              // So we need to highlight the opponent's king (who is now in check)
              this.highlightKing(this.game.currentPlayer);
            }

            // Handle post-move actions based on game mode
            if (this.game.gameMode === 'human-vs-human' && !this.game.isUndoRedoAction) {
              // Orientation already determined above, no need for setTimeout
              // Just update display if needed later
            } else if (this.game.gameMode === 'human-vs-bot' && !this.game.isUndoRedoAction) {
              // In vs Bot mode, board remains static - no flipping
              
              // Check if game is still in progress and it's bot's turn
              // Bot should play when status is 'playing' OR 'check' (not checkmate/stalemate)
              const statusOk = this.game.gameStatus === 'playing' || this.game.gameStatus === 'check';
              const isBotTurn = this.game.isBotTurn();
              
              if (statusOk && isBotTurn) {
                // Show bot thinking message immediately after human move
                this.showBotThinking(true);
                this.setInputEnabled(false);
                
                // Update UI to reflect bot's turn
                this.updateGameStateIndicators();
                
                // Trigger bot move with small delay to allow UI update
                setTimeout(() => {
                  this.handleBotTurn();
                }, 150);
              } else {
                
                // Ensure input is enabled if game ended
                if (this.game.gameStatus === 'checkmate' || this.game.gameStatus === 'stalemate') {
                  this.setInputEnabled(false); // Disable for game end
                } else {
                  this.setInputEnabled(true); // Enable if still human's turn somehow
                }
              }
            }
            
            // Auto-save is now handled in makeMove method
          } else {
            // This shouldn't happen if move was in possibleMoves, but handle gracefully
            this.game.selectedSquare = null;
          }
        } else {
          // Move is not in possible moves
          // Move is not in possible moves
          // Check if clicking own piece for selection
          const targetPiece = this.game.board[logicalRow][logicalCol];
          
          if (targetPiece && targetPiece.color === this.game.currentPlayer) {
            // This is piece selection, not a move attempt
            this.game.selectedSquare = { row: logicalRow, col: logicalCol };
            this.updateDisplay(); // Update display before returning
            return; // Exit early - no need for move validation
          }
          
          // Move is invalid (js-chess-engine already handles all validation including check)
          // Check if we're currently in check to show appropriate message
          if (this.game.isInCheck()) {
            // Player is currently in check and this move doesn't resolve it - status shown in header
            // this.showCheckAlert("You're in check! Must move to safety.");
            this.highlightKing(this.game.currentPlayer);
          } else {
            // Move is simply invalid - just deselect
            // The engine already prevents all illegal moves including those that would put king in check
            this.game.selectedSquare = null;
          }
        }
      }
    } else {
      // Select piece if it belongs to current player
      const piece = this.game.board[logicalRow][logicalCol];
      if (piece && piece.color === this.game.currentPlayer) {
        this.game.selectedSquare = { row: logicalRow, col: logicalCol };
      }
    }
    
    this.updateDisplay();
  }

  updateDisplay() {
    // Debug logging for undo issue
    // Specific debug for E7 and E5 positions
    

    // Apply orientation data attributes - robust single source of truth
    const gameContainer = document.getElementById('game-container');

    // Remove old classes (temporary - for backwards compatibility during transition)
    gameContainer.classList.remove('orientation-table', 'orientation-handoff', 'orientation-none');

    // Set data attributes that determine orientation
    // For bot mode, use 'none' to prevent CSS rotation (coordinate reversal handles it)
    const orientationMode = this.game.gameMode === 'human-vs-bot' ?
                           'none' : this.game.orientationMode;

    gameContainer.setAttribute('data-orientation-mode', orientationMode);
    gameContainer.setAttribute('data-board-flipped', this.game.boardFlipped.toString());
    gameContainer.setAttribute('data-game-mode', this.game.gameMode);
    gameContainer.setAttribute('data-current-player', this.game.currentPlayer);

    // Remove old class-based logic entirely - data attributes handle everything now
    // The CSS will use the data attributes to determine transforms

    // Update board pieces
    const squares = this.boardElement.children;
    for (let i = 0; i < squares.length; i++) {
      const square = squares[i];
      const displayRow = parseInt(square.dataset.row);
      const displayCol = parseInt(square.dataset.col);

      // Convert display coordinates to logical coordinates
      const logical = this.getLogicalCoordinates(displayRow, displayCol);
      const piece = this.game.board[logical.row][logical.col];
      
      // Clear previous content and classes
      square.innerHTML = '';
      square.classList.remove('selected', 'valid-move', 'white-move', 'black-move', 'last-move');
      
      // Add piece
      if (piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `chess-piece ${piece.color}`;
        pieceElement.setAttribute('data-piece', piece.type); // Add piece type for CSS targeting
        pieceElement.textContent = this.game.getPieceSymbol(piece);
        square.appendChild(pieceElement);

        // Debug logging for key positions
        if ((logical.row === 1 && logical.col === 4) || (logical.row === 3 && logical.col === 4)) {
          
        }
      }
      
      // Highlight selected square
      if (this.game.selectedSquare && 
          this.game.selectedSquare.row === logical.row && 
          this.game.selectedSquare.col === logical.col) {
        square.classList.add('selected');
      }
      
      // Highlight valid moves
      if (this.game.selectedSquare) {
        const moves = this.game.getPossibleMoves(this.game.selectedSquare.row, this.game.selectedSquare.col);
        if (moves.some(move => move.row === logical.row && move.col === logical.col)) {
          square.classList.add('valid-move');
          // Add player-specific border color
          square.classList.add(this.game.currentPlayer === 'white' ? 'white-move' : 'black-move');
        }
      }
      
      // Highlight last move (based on current position in state history)
      // Use stateHistory instead of old moveHistory
      if (this.game.currentStateIndex > 0 && this.game.currentStateIndex < this.game.stateHistory.length) {
        const currentState = this.game.stateHistory[this.game.currentStateIndex];
        if (currentState && currentState.move) {
          const lastMove = currentState.move;
          if ((lastMove.from.row === logical.row && lastMove.from.col === logical.col) ||
              (lastMove.to.row === logical.row && lastMove.to.col === logical.col)) {
            square.classList.add('last-move');
          }
        }
      }
    }
    
    // Update game info with material balance
    const materialBalance = this.game.calculateMaterialBalance();
    let balanceText = '';
    
    // Show positive for current player if they have advantage, negative if disadvantage
    if (this.game.currentPlayer === 'white') {
      if (materialBalance > 0) {
        balanceText = ` (+${materialBalance})`;
      } else if (materialBalance < 0) {
        balanceText = ` (${materialBalance})`;
      }
    } else {
      // For black player, flip the sign
      if (materialBalance < 0) {
        balanceText = ` (+${Math.abs(materialBalance)})`;
      } else if (materialBalance > 0) {
        balanceText = ` (-${materialBalance})`;
      }
    }
    
    // Update simplified header display
    const moveDisplayElement = document.getElementById('move-display');
    const expandButton = document.getElementById('move-expand');
    const moveInfo = document.getElementById('move-info');

    if (moveDisplayElement) {
      let displayText = '';

      // Check if there's a move to display
      if (this.game.currentStateIndex > 0 && this.game.currentStateIndex < this.game.stateHistory.length) {
        const currentState = this.game.stateHistory[this.game.currentStateIndex];
        if (currentState && currentState.move) {
          const commentary = currentState.commentary || currentState.notation;

          // Add game status if applicable
          let statusText = '';
          if (this.game.gameStatus === 'checkmate') {
            statusText = '<span style="color: #FE5F00;"> - Checkmate!</span>';
          } else if (this.game.gameStatus === 'check') {
            statusText = '<span style="color: #FE5F00;"> - Check!</span>';
          } else if (this.game.gameStatus === 'stalemate') {
            statusText = '<span style="color: #FE5F00;"> - Stalemate!</span>';
          }

          displayText = commentary + statusText;
        }
      }

      // If no move yet, show initial state with game mode
      if (!displayText) {
        if (this.game.gameMode === 'human-vs-human') {
          displayText = 'Human vs Human • Ready to play';
        } else {
          const difficulty = this.game.getBotDifficultyText();
          displayText = `Bot (${difficulty}) • Ready to play`;
        }
      }

      // Use innerHTML to support colored status text
      if (displayText.includes('<span')) {
        moveDisplayElement.innerHTML = displayText;
      } else {
        moveDisplayElement.textContent = displayText;
      }

      // Check if text is cropped and show/hide expand button
      setTimeout(() => {
        const isOverflowing = moveDisplayElement.scrollWidth > moveDisplayElement.clientWidth;
        if (isOverflowing && expandButton && moveInfo) {
          moveInfo.classList.add('has-overflow');
          // Store plain text version for notification
          expandButton.dataset.fullText = moveDisplayElement.textContent;
        } else if (moveInfo) {
          moveInfo.classList.remove('has-overflow');
        }
      }, 0);
    }
    
    // Game status is now displayed inline with move commentary, so clear the separate status element
    this.gameStatusElement.textContent = '';
    
    // Enhanced UI feedback for game state
    this.updateGameStateIndicators();
    
    // Check for game end conditions and provide feedback
    if (this.game.gameStatus !== 'playing' && this.game.gameStatus !== 'check') {
      // Small delay to allow move animation to complete
      setTimeout(() => {
        this.handleGameEnd();
      }, 300);
    }
  }

  applyTheme() {
    // Fixed classic wooden theme with detailed textures
    const classicTheme = { 
      light: '#ddb88c', 
      dark: '#a0522d',
      lightTexture: 'radial-gradient(circle at 25% 25%, #c9a876 0%, transparent 50%), radial-gradient(circle at 75% 75%, #c9a876 0%, transparent 50%)',
      darkTexture: 'radial-gradient(circle at 25% 25%, #8b4513 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b4513 0%, transparent 50%)'
    };
    
    document.documentElement.style.setProperty('--light-square', classicTheme.light);
    document.documentElement.style.setProperty('--dark-square', classicTheme.dark);
    
    // Apply colors and textures to squares
    const squares = this.boardElement.children;
    for (let i = 0; i < squares.length; i++) {
      const square = squares[i];
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const isLight = (row + col) % 2 === 0;
      
      if (isLight) {
        square.style.backgroundColor = classicTheme.light;
        square.style.backgroundImage = classicTheme.lightTexture;
      } else {
        square.style.backgroundColor = classicTheme.dark;
        square.style.backgroundImage = classicTheme.darkTexture;
      }
    }
  }

  showMessage(text) {
    // Simple message display
    this.gameStatusElement.textContent = text;
    setTimeout(() => {
      this.updateDisplay();
    }, 2000);
  }

  showOptionsMenu() {
    const overlay = document.getElementById('options-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');

      // Track the original game mode and settings when menu opens
      this.game.originalGameMode = this.game.gameMode;
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

      // Update button states
      this.updateOptionsButtons();
      
      // Add event listeners if not already added
      if (!overlay.dataset.listenersAdded) {
        this.setupOptionsEventListeners();
        overlay.dataset.listenersAdded = 'true';
      }
    }
  }

  hideOptionsMenu() {
    const overlay = document.getElementById('options-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }

    // Apply correct orientation when menu closes using deterministic logic
    const shouldFlip = this.game.determineOrientation();
    if (this.game.boardFlipped !== shouldFlip) {
      this.game.boardFlipped = shouldFlip;
      this.updateDisplay();
    }

    // Check if bot should make initial move after returning from options
    // This handles the case where user changed color and clicked "Back to game"
    if (this.game.gameMode === 'human-vs-bot' && this.game.moveHistory.length === 0) {
      
      // Use a small delay to let UI settle
      setTimeout(() => {
        this.checkInitialBotTurn();
      }, 100);
    }
  }

  updateOptionsButtons() {
    
    
    
    

    // Debug: Show current mode in the menu title
    const optionsTitle = document.getElementById('options-title');
    if (optionsTitle) {
      const modeText = this.game.gameMode === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot';
      optionsTitle.textContent = `Chess R1 - ${modeText}`;
      
    }

    // Update back button state - disable if color/difficulty changed mid-game or no moves made
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      // Check both moveHistory and stateHistory for moves (stateHistory > 1 means has moves)
      const hasMoveHistory = this.game.moveHistory && this.game.moveHistory.length > 0;
      const hasStateHistory = this.game.stateHistory && this.game.stateHistory.length > 1;
      const hasMoves = hasMoveHistory || hasStateHistory;

      const modeChanged = this.game.gameMode !== this.game.originalGameMode;
      const colorChanged = this.game.colorChangedMidGame;
      const difficultyChanged = this.game.difficultyChangedMidGame;

      // Settings only matter if we're in the same mode
      const settingsChangedWithinMode = (colorChanged || difficultyChanged) && !modeChanged;

      if (!hasMoves) {
        // No moves made yet in this game mode
        backBtn.disabled = true;
        backBtn.textContent = 'Back to game (no moves yet)';
        backBtn.classList.add('disabled');
      } else if (settingsChangedWithinMode) {
        // Settings changed within the same mode - requires new game
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
        // Pure mode switch or no changes - can go back
        backBtn.disabled = false;
        backBtn.textContent = 'Back to game';
        backBtn.classList.remove('disabled');
      }
      }
    // Update game mode radio buttons
    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
    gameModeRadios.forEach(radio => {
      radio.checked = radio.value === this.game.gameMode;
    });
    
    // Update player color radio buttons
    const colorRadios = document.querySelectorAll('input[name="playerColor"]');
    colorRadios.forEach(radio => {
      radio.checked = radio.value === this.game.humanColor;
    });
    
    // Update sound effects radio buttons
    const soundRadios = document.querySelectorAll('input[name="soundEffects"]');
    soundRadios.forEach(radio => {
      radio.checked = (radio.value === 'on') === this.game.soundEnabled;
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

    // Show/hide color group based on game mode
    const colorGroup = document.getElementById('color-group');
    
    if (colorGroup) {
      if (this.game.gameMode === 'human-vs-bot') {
        
        colorGroup.style.display = 'block';
        // Force browser to recalculate
        colorGroup.offsetHeight;
      } else {
        
        colorGroup.style.display = 'none';
      }
      
      
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
      
    }

    // Show/hide orientation mode options based on game mode
    const orientationModeGroup = document.getElementById('orientation-mode-group');
    if (orientationModeGroup) {
      if (this.game.gameMode === 'human-vs-human') {
        orientationModeGroup.style.display = 'block';
        orientationModeGroup.offsetHeight; // Force reflow
      } else {
        orientationModeGroup.style.display = 'none';
      }
      
    }

    // Show undo options for both game modes
    const undoGroup = document.getElementById('undo-group');
    if (undoGroup) {
      // Always show undo options since it works well for both modes
      undoGroup.style.display = 'block';
      undoGroup.offsetHeight; // Force reflow
      
    }

    // Update orientation mode radio selection
    const orientationModeRadios = document.querySelectorAll('input[name="orientationMode"]');
    orientationModeRadios.forEach(radio => {
      radio.checked = (radio.value === this.game.orientationMode);
    });
  }

  setupOptionsEventListeners() {
    // Game Mode radio buttons
    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
    gameModeRadios.forEach(radio => {
      radio.addEventListener('change', async () => {
        if (radio.checked && radio.value !== this.game.gameMode) {
          try {
            // Save current game state before switching (save to current mode's key)
            const oldMode = this.game.gameMode;
            await this.game.autoSave();
            

            // Switch to new game mode
            this.game.setGameMode(radio.value);

            // Save last game mode
            saveToStorage('last_game_mode', {
              mode: radio.value,
              timestamp: Date.now()
            });

            // Reset color and difficulty change tracking when switching modes
            // (these changes don't matter across mode switches)
            this.game.colorChangedMidGame = false;
            this.game.originalHumanColor = this.game.humanColor;
            this.game.difficultyChangedMidGame = false;
            this.game.originalBotDifficulty = this.game.botDifficulty;

            // Try to load saved state for the new game mode
            const newModeKey = this.game.getStorageKey();
            

            // Check localStorage directly to debug
            const localStorageState = localStorage.getItem(newModeKey);
            if (localStorageState) {
              try {
                const parsed = JSON.parse(localStorageState);
                } catch (e) {
                
              }
            } else {
              
            }

            const savedState = await loadFromStorage(newModeKey);
            let validState = false;
            try {
              validState = savedState && this.isValidSavedState(savedState);
            } catch (e) {
              
              validState = false;
            }
            

            if (validState) {
            // Load saved state but preserve the newly selected game mode
            this.game.loadGameState(savedState, { preserveGameMode: true });
            
            this.updateDisplay();
            this.showMessage(`Switched to ${radio.value === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot'} - Game restored!`);
          } else {
            this.game.newGame();
            this.onNewGameStart();
            this.showMessage(`Switched to ${radio.value === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot'} - New game started!`);
          }

          } catch (error) {
            
            // Even if there's an error, ensure we're in a valid state
            this.game.newGame();
            this.onNewGameStart();
          } finally {
            // ALWAYS update the menu buttons regardless of errors
            

            // Update immediately first
            this.updateOptionsButtons();
            

            // Then also update with a small delay to ensure DOM is fully settled
            setTimeout(() => {
              this.updateOptionsButtons(); // Double update to ensure changes stick
              

              // Force check the visibility after update
              const colorGroup = document.getElementById('color-group');
              const difficultyGroup = document.getElementById('difficulty-group');
              const orientationGroup = document.getElementById('orientation-mode-group');
              const undoGroup = document.getElementById('undo-group');

              
              
              
              
              
            }, 10);
          }
        }
      });
    });

    // Player Color radio buttons
    const colorRadios = document.querySelectorAll('input[name="playerColor"]');
    colorRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.game.setHumanColor(radio.value);
          this.game.autoSave();
          // Update button states after color change
          this.updateOptionsButtons();
        }
      });
    });

    // Sound Effects radio buttons
    const soundRadios = document.querySelectorAll('input[name="soundEffects"]');
    soundRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const soundEnabled = radio.value === 'on';
          this.game.soundEnabled = soundEnabled;
          this.game.autoSave();
        }
      });
    });

    // Allow Undo radio buttons
    const undoRadios = document.querySelectorAll('input[name="allowUndo"]');
    undoRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const allowUndo = radio.value === 'on';
          this.game.allowUndo = allowUndo;
          this.game.autoSave();
        }
      });
    });

    // Bot Difficulty radio buttons
    const difficultyRadios = document.querySelectorAll('input[name="botDifficulty"]');
    difficultyRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const difficulty = parseInt(radio.value);
          this.game.setBotDifficulty(difficulty);
          this.game.autoSave();
          // Update button states after difficulty change
          this.updateOptionsButtons();
        }
      });
    });

    // Action buttons
    const newGameBtn = document.getElementById('new-game-btn');
    const backBtn = document.getElementById('back-btn');
    const overlay = document.getElementById('options-overlay');

    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.confirmNewGame();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.hideOptionsMenu();
      });
    }

    // Orientation Mode radio buttons
    const orientationModeRadios = document.querySelectorAll('input[name="orientationMode"]');
    orientationModeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.game.orientationMode = radio.value;

          // DO NOT apply orientation immediately - wait until menu closes
          // This prevents the menu from flipping while still open

          const modeMessages = {
            'table': 'Table mode: Entire screen rotates for players sitting across',
            'handoff': 'Handoff mode: Pass device between players',
            'none': 'No rotation: Board stays fixed'
          };
          this.showMessage(modeMessages[radio.value]);
          this.game.autoSave();
        }
      });
    });

    // Close menu when clicking outside
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hideOptionsMenu();
        }
      });
    }
  }

  confirmNewGame() {

    // Clear saved state and start new game BEFORE hiding menu
    this.clearSavedState();
    this.game.newGame();

    // Update the display to reflect the new game
    this.updateDisplay();

    // Now hide the menu AFTER game is initialized
    this.hideOptionsMenu();

    // Check if bot should make the first move AFTER menu is hidden
    // Use longer delay to ensure UI is fully settled
    if (this.game.gameMode === 'human-vs-bot' && this.game.humanColor === 'black') {
      
      setTimeout(() => {
        // Double-check conditions before executing bot move
        if (this.game.gameStatus === 'playing' && this.game.isBotTurn()) {
          this.checkInitialBotTurn();
        }
      }, 1500); // Increased delay to ensure game is fully ready
    }

    this.showMessage('New game started!');
  }

  async clearSavedState() {
    // Only clear the current mode's saved state, not all modes
    const currentKey = this.game.getStorageKey();
    const keysToRemove = [
      currentKey,
      'chess_game_state' // Legacy key
    ];
    
    
    if (window.creationStorage) {
      try {
        for (const key of keysToRemove) {
          await window.creationStorage.plain.removeItem(key);
        }
        } catch (e) {
        }
    } else {
      // Also clear from localStorage fallback
      try {
        for (const key of keysToRemove) {
          localStorage.removeItem(key);
        }
        } catch (e) {
        }
    }
  }

  /**
   * Unified notification system - single method for all notifications
   * @param {string} message - The message to display
   * @param {string} type - Type of notification: 'default', 'warning', 'error', 'success', 'info'
   * @param {number} duration - Optional duration in ms (defaults based on type)
   */
  showNotification(message, type = 'default', duration = null) {
    const label = document.getElementById('instruction-label');
    if (!label) return;

    // Determine duration based on type if not specified
    if (duration === null) {
      duration = (type === 'warning' || type === 'error') ? 3000 : 2000;
    }

    // For warning/error types, check cooldown to prevent spam
    // Exception: bot undo messages should always show
    const isBotUndoMessage = message.includes('Bot move undone') || message.includes('Bot turn');
    if ((type === 'warning' || type === 'error') && this.notificationCooldown && !isBotUndoMessage) {
      return; // Skip if in cooldown period (unless it's a bot undo message)
    }

    // Clear any existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Set message
    label.textContent = message;
    label.classList.remove('hidden');

    // Apply styling - always use orange background for consistency
    label.style.backgroundColor = '#FE5F00';
    label.style.color = 'white';
    label.style.fontWeight = 'bold';

    // Set cooldown for warning/error types to prevent spam
    if (type === 'warning' || type === 'error') {
      this.notificationCooldown = true;
    }

    // Auto-hide after duration
    this.notificationTimeout = setTimeout(() => {
      label.classList.add('hidden');
      // Clear custom styles
      label.style.backgroundColor = '';
      label.style.color = '';
      label.style.fontWeight = '';

      // Clear cooldown after hiding (for warning/error types)
      if (type === 'warning' || type === 'error') {
        setTimeout(() => {
          this.notificationCooldown = false;
        }, 500);
      }
    }, duration);
  }

  showInstructionLabel(text) {
    // Delegate to unified notification system
    this.showNotification(text, 'default', 2000);
  }

  // Show temporary alert for check-related move rejections
  showBotUndoAlert(message) {
    // Delegate to unified notification system with warning type
    this.showNotification(message, 'warning', 3000);
  }

  showCheckAlert(message) {
    // Delegate to unified notification system with warning type
    this.showNotification(message, 'warning', 3000);
  }

  // Highlight king piece to indicate check condition
  highlightKing(color) {
    // Find the king of the specified color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.game.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          // Convert logical coordinates to display coordinates for proper highlighting
          const display = this.getDisplayCoordinates(row, col);
          const square = this.boardElement.children[display.row * 8 + display.col];
          if (square) {
            // Prevent double highlighting - only add if not already highlighted
            if (!square.classList.contains('king-warning')) {
              square.classList.add('king-warning');

              // Remove highlight after 2 seconds
              setTimeout(() => {
                square.classList.remove('king-warning');
              }, 2000);
            }
          }
          return;
        }
      }
    }
  }

  animateUndoRedo(type, isBotMove = false) {
    // Add a subtle animation effect for undo/redo
    const board = this.boardElement;
    if (board) {
      // Get current transform from computed styles before animation
      const computed = window.getComputedStyle(board);
      const currentTransform = computed.transform;
      const hasRotation = currentTransform && currentTransform !== 'none';

      // Apply scale animation on top of existing transform
      const scaleValue = type === 'undo' ? 0.98 : 1.02;
      if (hasRotation) {
        board.style.transform = `${currentTransform} scale(${scaleValue})`;
      } else {
        board.style.transform = `scale(${scaleValue})`;
      }
      board.style.transition = 'transform 0.1s ease';

      setTimeout(() => {
        // Return to original transform or scale(1)
        if (hasRotation) {
          board.style.transform = currentTransform;
        } else {
          board.style.transform = 'scale(1)';
        }

        setTimeout(() => {
          // CRITICAL: Clear inline styles completely so CSS can take over
          board.style.transform = '';
          board.style.transition = '';
        }, 100);
      }, 100);
    }

    // Show move information
    const currentIndex = this.game.getCurrentMoveIndex();
    const totalMoves = this.game.moveHistory ? this.game.moveHistory.length : 0;
    const currentMoveNumber = Math.ceil((currentIndex + 1) / 2);

    // Store if we just undid a bot move for later notification
    // Keep the flag true if it was already true (user may have undone multiple moves)
    if (type === 'undo') {
      if (isBotMove) {
        this.game.lastUndoWasBotMove = true;
      }
      // Don't set to false - keep the flag if any bot move was undone
    }

    if (type === 'undo') {
      if (currentIndex >= 0) {
        this.showInstructionLabel(`At move ${currentMoveNumber} (${currentIndex + 1}/${totalMoves})`);
      } else {
        this.showInstructionLabel(`At start of game`);
      }
    } else if (type === 'redo') {
      this.showInstructionLabel(`At move ${currentMoveNumber} (${currentIndex + 1}/${totalMoves})`);
    }
  }

  // Verify UI consistency with game state
  verifyUIConsistency() {
    const issues = [];
    
    try {
      // Check if current player display matches game state
      const currentPlayerElement = document.getElementById('current-player');
      if (currentPlayerElement) {
        const displayedPlayer = currentPlayerElement.textContent.toLowerCase();
        if (!displayedPlayer.includes(this.game.currentPlayer)) {
          issues.push(`Current player display mismatch: UI shows "${displayedPlayer}", game state is "${this.game.currentPlayer}"`);
        }
      }
      
      // Check move count display
      const moveCountElement = document.getElementById('move-count');
      if (moveCountElement) {
        const currentIndex = this.game.getCurrentMoveIndex();
        const expectedMoveNumber = currentIndex >= 0 ? Math.ceil((currentIndex + 1) / 2) : 0;
        const displayedText = moveCountElement.textContent;
        if (!displayedText.includes(expectedMoveNumber.toString())) {
          issues.push(`Move count display mismatch: UI shows "${displayedText}", expected move number ${expectedMoveNumber}`);
        }
      }
      
      // Check board piece consistency
      const squares = this.boardElement.children;
      let boardMismatches = 0;
      
      for (let i = 0; i < squares.length; i++) {
        const square = squares[i];
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const gamePiece = this.game.board[row][col];
        
        const pieceElements = square.querySelectorAll('.chess-piece');
        const hasPieceInUI = pieceElements.length > 0;
        const hasPieceInGame = gamePiece !== null;
        
        if (hasPieceInUI !== hasPieceInGame) {
          boardMismatches++;
        } else if (hasPieceInGame && hasPieceInUI) {
          const uiPiece = pieceElements[0];
          const expectedSymbol = this.game.getPieceSymbol(gamePiece);
          if (uiPiece.textContent !== expectedSymbol) {
            boardMismatches++;
          }
        }
      }
      
      if (boardMismatches > 0) {
        issues.push(`Board display has ${boardMismatches} piece mismatches with game state`);
      }
      
      // Check game status consistency
      const gameStatusElement = document.getElementById('game-status');
      if (gameStatusElement && gameStatusElement.textContent.trim()) {
        // Only check if there's a status message displayed
        const statusText = gameStatusElement.textContent.toLowerCase();
        if (this.game.gameStatus === 'checkmate' && !statusText.includes('checkmate')) {
          issues.push(`Game status display mismatch: game is checkmate but UI shows "${statusText}"`);
        } else if (this.game.gameStatus === 'stalemate' && !statusText.includes('stalemate')) {
          issues.push(`Game status display mismatch: game is stalemate but UI shows "${statusText}"`);
        }
      }
      
      if (issues.length > 0) {
        return false;
      } else {
        return true;
      }
      
    } catch (error) {
      return false;
    }
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

  // Helper to get the latest timestamp from a saved state
  getLatestTimestamp(state) {
    if (!state) return 0;

    // Check stateHistory for timestamp
    if (state.stateHistory && state.stateHistory.length > 0) {
      const lastState = state.stateHistory[state.stateHistory.length - 1];
      if (lastState && lastState.timestamp) {
        return lastState.timestamp;
      }
    }

    // Fallback to checking if there are moves (assume older save)
    if (state.moveHistory && state.moveHistory.length > 0) {
      return 1; // Return 1 to indicate it exists but has no timestamp
    }

    return 0;
  }

  async loadGameState() {
    try {
      // First check what was the last game mode used
      const lastModeData = await loadFromStorage('last_game_mode');
      const preferredMode = lastModeData?.mode || null;

      

      // Load states from both game modes
      const humanVsBotKey = 'chess_game_state_human_vs_bot';
      const humanVsHumanKey = 'chess_game_state_human_vs_human';

      

      const humanVsBotState = await loadFromStorage(humanVsBotKey);
      const humanVsHumanState = await loadFromStorage(humanVsHumanKey);

      let state = null;
      let selectedMode = null;

      // If we have a preferred mode saved, try to use that first
      if (preferredMode) {
        if (preferredMode === 'human-vs-human' && humanVsHumanState) {
          state = humanVsHumanState;
          selectedMode = 'human-vs-human';
          
        } else if (preferredMode === 'human-vs-bot' && humanVsBotState) {
          state = humanVsBotState;
          selectedMode = 'human-vs-bot';
          
        }
      }

      // If we couldn't load the preferred mode, fall back to the most recent
      if (!state) {
        if (humanVsBotState && humanVsHumanState) {
          // Both states exist - load the most recently saved one
          const botTimestamp = this.getLatestTimestamp(humanVsBotState);
          const humanTimestamp = this.getLatestTimestamp(humanVsHumanState);

          

          if (humanTimestamp > botTimestamp) {
            state = humanVsHumanState;
            selectedMode = 'human-vs-human';
            
          } else {
            state = humanVsBotState;
            selectedMode = 'human-vs-bot';
            
          }
        } else if (humanVsHumanState) {
          state = humanVsHumanState;
          selectedMode = 'human-vs-human';
          
        } else if (humanVsBotState) {
          state = humanVsBotState;
          selectedMode = 'human-vs-bot';
          
        }
      }

      if (!state) {
        // Try legacy key for backward compatibility
        state = await loadFromStorage('chess_game_state');
        if (state) {
          selectedMode = state.gameMode || 'human-vs-bot';
        }
      }
      
      if (!state) {
        return false;
      }
      
      if (this.isValidSavedState(state)) {
        // CRITICAL: Set the correct game mode BEFORE loading state
        if (selectedMode) {
          this.game.gameMode = selectedMode;
          
        }

        this.game.loadGameState(state);
        this.applyTheme();
        this.updateDisplay();

        // Update menu visibility based on loaded game mode
        this.updateMenuVisibility();

        return true;
      } else {
        // Clear invalid saved state
        await this.clearSavedState();
        return false;
      }
    } catch (error) {
      // Clear potentially corrupted data
      await this.clearSavedState();
      return false;
    }
  }

  isValidSavedState(state) {
    // Basic structure validation
    if (!state || typeof state !== 'object') {
      return false;
    }
    
    // Validate required properties exist
    if (!state.board || !Array.isArray(state.board)) {
      return false;
    }
    
    // Allow missing moveHistory for backward compatibility
    if (state.moveHistory && !Array.isArray(state.moveHistory)) {
      return false;
    }
    
    // Validate board structure (8x8 array)
    if (state.board.length !== 8) {
      return false;
    }
    
    for (let i = 0; i < state.board.length; i++) {
      const row = state.board[i];
      if (!Array.isArray(row) || row.length !== 8) {
        return false;
      }
    }
    
    // Validate current player
    if (!state.currentPlayer || (state.currentPlayer !== 'white' && state.currentPlayer !== 'black')) {
      return false;
    }
    
    // Enhanced validation logic - be more permissive for valid game states
    const moveHistory = state.moveHistory || [];
    const moveCount = moveHistory.length;
    const totalMoves = state.totalMoves || moveCount;
    
    // Accept any state that has move history
    if (moveCount > 0) {
      return true;
    }
    
    // Accept states where the current player is black (white made first move)
    if (state.currentPlayer === 'black') {
      return true;
    }
    
    // Accept completed games regardless of move count
    if (state.gameStatus && (state.gameStatus === 'checkmate' || state.gameStatus === 'stalemate')) {
      return true;
    }
    
    // Accept states with explicit move index (indicates game progression)
    if (state.currentMoveIndex !== undefined && state.currentMoveIndex >= 0) {
      return true;
    }
    
    // Accept states that have been explicitly saved with totalMoves > 0
    if (totalMoves > 0) {
      return true;
    }
    
    // Check if board position differs from initial setup (indicates game has progressed)
    if (this.boardDiffersFromInitial(state.board)) {
      return true;
    }
    
    // If we reach here, it's likely an untouched initial state
    return false;
  }
  
  boardDiffersFromInitial(board) {
    // Check if board differs from standard chess starting position
    if (!board || !Array.isArray(board)) {
      
      return false;
    }

    const initialBoard = this.game ? this.game.initializeBoard() : this.initializeBoard();

    for (let row = 0; row < 8; row++) {
      if (!board[row] || !Array.isArray(board[row])) {
        
        return false;
      }
      for (let col = 0; col < 8; col++) {
        const currentPiece = board[row][col];
        const initialPiece = initialBoard[row][col];
        
        // Compare pieces (both null, or both have same type and color)
        if (currentPiece === null && initialPiece === null) continue;
        if (currentPiece === null || initialPiece === null) return true;
        if (currentPiece.type !== initialPiece.type || currentPiece.color !== initialPiece.color) {
          return true;
        }
      }
    }
    
    return false;
  }
}

// ===========================================
// Physical Input Handling
// ===========================================

// Handle R1 scroll wheel events for undo/redo (reversed direction)
window.addEventListener('scrollUp', async () => {
  

  if (chessGame && gameUI) {
    if (chessGame.allowUndo) {
      // Check if we're redoing a bot move
      let isRedoingBotMove = false;
      if (chessGame.gameMode === 'human-vs-bot' && chessGame.currentStateIndex < chessGame.stateHistory.length - 1) {
        const targetState = chessGame.stateHistory[chessGame.currentStateIndex + 1];
        if (targetState && targetState.move && targetState.move.piece) {
          isRedoingBotMove = targetState.move.piece.color !== chessGame.humanColor;
        }
      }

      
      if (chessGame.redoMove()) {
        chessGame.selectedSquare = null; // Clear any selected piece
        // Removed updateBoardPerspective() - orientation is handled by data attributes now
        gameUI.updateDisplay();
        
        gameUI.animateUndoRedo('redo', isRedoingBotMove);
        
        // Update UI elements after redo
        gameUI.updatePlayerTurnIndicator(chessGame.currentPlayer, chessGame.gameMode);
        gameUI.updateCapturedPiecesDisplay();
        gameUI.updateMoveHistoryDisplay();

        // Save state after redo
        await chessGame.autoSave();

        // Just update UI state - NO bot triggering on undo/redo!
        if (chessGame.gameMode === 'human-vs-bot') {
          // Only update UI state based on whose turn it is
          if (chessGame.isBotTurn()) {
            // It's bot's turn after redo, but DON'T trigger a move
            // User needs to decide if they want bot to move
            gameUI.showBotThinking(false);
            gameUI.setInputEnabled(true);
          } else {
            // Human's turn - enable input
            gameUI.showBotThinking(false);
            gameUI.setInputEnabled(true);
          }
        } else if (chessGame.gameMode === 'human-vs-human') {
          // In human vs human, ensure input is enabled
          gameUI.setInputEnabled(true);
        }
        // Don't save state during undo/redo operations
      }
    } else {
      gameUI.showInstructionLabel('Push button to enable undo');
    }
  }
});

window.addEventListener('scrollDown', async () => {
  
  

  if (chessGame && gameUI) {
    if (chessGame.allowUndo) {
      // Check if we're undoing a bot move
      let isUndoingBotMove = false;
      if (chessGame.gameMode === 'human-vs-bot' && chessGame.currentStateIndex > 0) {
        const currentState = chessGame.stateHistory[chessGame.currentStateIndex];
        if (currentState && currentState.move && currentState.move.piece) {
          isUndoingBotMove = currentState.move.piece.color !== chessGame.humanColor;
        }
      }

      const undoResult = chessGame.undoMove();
      
      
      if (undoResult) {
        chessGame.selectedSquare = null; // Clear any selected piece
        // Removed updateBoardPerspective() - orientation is handled by data attributes now
        gameUI.updateDisplay();
        
        gameUI.animateUndoRedo('undo', isUndoingBotMove);
        
        // Update UI elements after undo
        gameUI.updatePlayerTurnIndicator(chessGame.currentPlayer, chessGame.gameMode);
        gameUI.updateCapturedPiecesDisplay();
        gameUI.updateMoveHistoryDisplay();

        // Save state after undo
        await chessGame.autoSave();

        // Just update UI state - NO bot triggering on undo/redo!
        if (chessGame.gameMode === 'human-vs-bot') {
          // Only update UI state based on whose turn it is
          if (chessGame.isBotTurn()) {
            // It's bot's turn after undo, but DON'T trigger a move
            // User needs to decide if they want bot to move
            gameUI.showBotThinking(false);
            gameUI.setInputEnabled(true);
          } else {
            // Human's turn - enable input
            gameUI.showBotThinking(false);
            gameUI.setInputEnabled(true);
          }
        } else if (chessGame.gameMode === 'human-vs-human') {
          // In human vs human, ensure input is enabled
          gameUI.setInputEnabled(true);
        }
        // Don't save state during undo/redo operations
      }
    } else {
      gameUI.showInstructionLabel('Push button to enable undo');
    }
  }
});

// Handle R1 side button with debouncing for options menu
let lastSideClickTime = 0;
const DEBOUNCE_DELAY = 300; // 300ms debounce

window.addEventListener('sideClick', () => {
  const now = Date.now();
  if (now - lastSideClickTime < DEBOUNCE_DELAY) {

    return;
  }
  lastSideClickTime = now;



  if (chessGame && gameUI) {
    // Check if options menu is already visible
    const overlay = document.getElementById('options-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      // Menu is open - check which button should be activated
      const backBtn = document.getElementById('back-btn');
      const newGameBtn = document.getElementById('new-game-btn');

      // Check if back button is enabled
      if (backBtn && !backBtn.disabled) {
        // Back to Game is available - close menu
        gameUI.hideOptionsMenu();
      } else if (newGameBtn && !newGameBtn.disabled) {
        // Back to Game is disabled - start new game
        gameUI.confirmNewGame();
      }
    } else {
      // Menu is closed - open it
      gameUI.showOptionsMenu();
    }
  }
});

// Long press shows status information
window.addEventListener('longPressStart', () => {
  // Prevent default long press behavior
});

window.addEventListener('longPressEnd', () => {
  // Show app status information
  if (gameUI) {
    let statusMessage = 'Chess R1 by Eric Buess v0.0.2';

    // Add bot info if in bot mode
    if (chessGame && chessGame.gameMode === 'human-vs-bot') {
      const botName = chessGame.getBotDifficultyText();
      const difficulty = chessGame.botDifficulty;

      // Map difficulty levels to descriptions
      const difficultyDescriptions = {
        0: 'easy',
        1: 'normal',
        2: 'hard',
        3: 'harder',
        4: 'hardest'
      };

      const difficultyText = difficultyDescriptions[difficulty] || 'normal';
      statusMessage += `\nPlaying against ${botName} (bot - ${difficultyText})`;
    }

    gameUI.showNotification(statusMessage, 'info', 3000);
  }
});

// ===========================================
// Plugin Message Handling
// ===========================================

// Handle incoming messages from Flutter/WebSocket
window.onPluginMessage = function(data) {
  
  
  // Could be used for online chess features in the future
  if (data.data) {
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      
    } catch (e) {
      
    }
  }
  
  if (data.message) {
    
  }
};

// ===========================================
// Sending Messages to Flutter
// ===========================================

// Send game events to Flutter (for potential voice feedback)
function sendGameEvent(event, details = {}) {
  if (typeof PluginMessageHandler !== 'undefined') {
    const payload = {
      message: `Chess game event: ${event}`,
      gameEvent: event,
      details: details,
      wantsR1Response: false,
      wantsJournalEntry: false
    };
    PluginMessageHandler.postMessage(JSON.stringify(payload));
  }
}

// ===========================================
// Accelerometer Access (unused in chess but available)
// ===========================================

let accelerometerRunning = false;

function startAccelerometer() {
  if (typeof window.creationSensors === 'undefined' || !window.creationSensors.accelerometer) {
    
    return;
  }
  
  try {
    window.creationSensors.accelerometer.start((data) => {
      // Could be used for shake-to-reset or tilt effects
      
    }, { frequency: 30 });
    
    accelerometerRunning = true;
    
  } catch (e) {
    
  }
}

function stopAccelerometer() {
  if (window.creationSensors && window.creationSensors.accelerometer && accelerometerRunning) {
    try {
      window.creationSensors.accelerometer.stop();
      accelerometerRunning = false;
      
    } catch (e) {
      
    }
  }
}

// ===========================================
// Persistent Storage
// ===========================================

// Calculate simple checksum for data integrity verification
function calculateChecksum(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Save data to persistent storage (matches working R1 version - no cookies)
async function saveToStorage(key, value) {
  // Validate input
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (value === undefined || value === null) {
    return false;
  }

  // Enhanced creationStorage availability check
  const creationStorageAvailable = window.creationStorage &&
                                   window.creationStorage.plain &&
                                   typeof window.creationStorage.plain.setItem === 'function';

  if (creationStorageAvailable) {
    try {
      const jsonString = JSON.stringify(value);
      const encoded = btoa(jsonString);
      await window.creationStorage.plain.setItem(key, encoded);
      return true;
    } catch (e) {
      // Fall through to localStorage
    }
  }

  // Direct fallback to localStorage (no cookies - matches working version)
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (e) {
    // Storage failed
  }

  return false;
}

// Load data from persistent storage (matches working R1 version - no cookies)
async function loadFromStorage(key) {
  // Enhanced creationStorage availability check
  const creationStorageAvailable = window.creationStorage &&
                                   window.creationStorage.plain &&
                                   typeof window.creationStorage.plain.getItem === 'function';

  if (creationStorageAvailable) {
    try {
      const stored = await window.creationStorage.plain.getItem(key);
      if (stored) {
        const decoded = atob(stored);
        const parsed = JSON.parse(decoded);
        return parsed;
      }
    } catch (e) {
      // Fall through to localStorage
    }
  }

  // Direct fallback to localStorage (no cookies - matches working version)
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (e) {
    // Storage failed
  }
  return null;
}

// ===========================================
// Chess Game Initialization
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  
  
  // Add keyboard fallback for development
  if (typeof PluginMessageHandler === 'undefined') {
    window.addEventListener('keydown', (event) => {
      // P key shortcut for Push-To-Talk (options menu)
      if (event.code === 'KeyP') {
        event.preventDefault();
        // Trigger the same event as sideClick (PTT button)
        window.dispatchEvent(new CustomEvent('sideClick'));
      }

      // I key shortcut for status indicator (same as long press)
      if (event.code === 'KeyI') {
        event.preventDefault();
        // Trigger the same event as longPressEnd (shows status)
        window.dispatchEvent(new CustomEvent('longPressEnd'));
      }

      // Temporary arrow key shortcuts for undo/redo (will be removed for R1)
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        // Trigger the same event as scroll down (which does undo)
        window.dispatchEvent(new CustomEvent('scrollDown'));
      }

      if (event.code === 'ArrowRight') {
        event.preventDefault();
        
        // Trigger the same event as scroll up (which does redo)
        window.dispatchEvent(new CustomEvent('scrollUp'));
        
      }
    });
  }

  // Initialize chess game
  chessGame = new ChessGame();
  gameUI = new ChessUI(chessGame);

  // Initialize menu visibility based on default game mode
  const colorGroup = document.getElementById('color-group');
  const difficultyGroup = document.getElementById('difficulty-group');
  const orientationGroup = document.getElementById('orientation-mode-group');
  const undoGroup = document.getElementById('undo-group');

  // Set initial visibility based on default game mode (human-vs-bot)
  if (colorGroup) colorGroup.style.display = 'block';
  if (difficultyGroup) difficultyGroup.style.display = 'block';
  if (orientationGroup) orientationGroup.style.display = 'none';
  if (undoGroup) undoGroup.style.display = 'block';
  
  // Try to load saved game state
  const loaded = await gameUI.loadGameState();
  if (loaded) {
    gameUI.updateDisplay();
    gameUI.updateCapturedPiecesDisplay(); // Ensure display shows after loading
    gameUI.gameStatusElement.textContent = 'Game resumed';
    setTimeout(() => {
      gameUI.gameStatusElement.textContent = '';
    }, 2000);
  } else {
    chessGame.newGame();
    gameUI.updateDisplay();
  }

  // Ensure captured pieces display is shown on page load
  gameUI.updateCapturedPiecesDisplay();

  // Send initialization event
  sendGameEvent('game_initialized', {
    theme: chessGame.theme,
    currentPlayer: chessGame.currentPlayer
  });
});

// ===========================================
// Game Exit and Cleanup Logging
// ===========================================

// Log when the page is about to be unloaded (game exit)
window.addEventListener('beforeunload', (event) => {
  });

// Log when the page is being unloaded (game exit)
window.addEventListener('unload', (event) => {
  });

// Log when the page becomes hidden (user switches away)
window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    } else {
    }
});

// Chess game ready












