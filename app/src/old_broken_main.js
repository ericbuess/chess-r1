// R1 Chess Game
// Two-player chess game with full rule implementation including en passant

// ===========================================
// Simple Console Logging (Production)
// ===========================================

const debugLogger = {
  info: (category, message, data = null) => {
  },
  warn: (category, message, data = null) => {
  },
  error: (category, message, data = null) => {
  },
  debug: (category, message, data = null) => {
  }
};

// Check if running as R1 plugin
if (typeof PluginMessageHandler !== 'undefined') {
} else {
}

// Chess Game State
class ChessGame {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = 'white';
    this.selectedSquare = null;
    this.gameStatus = 'playing'; // 'playing', 'check', 'checkmate', 'stalemate'
    this.moveHistory = [];
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    this.theme = 'classic';
    this.soundEnabled = true;
    this.allowUndo = true;
    this.gameStartTime = new Date().toISOString();
    
    // Game mode settings
    this.gameMode = 'human-vs-bot'; // 'human-vs-human' or 'human-vs-bot'
    this.humanColor = 'white'; // For human-vs-bot mode: 'white', 'black', or 'random'
    this.boardFlipped = false; // For human-vs-human mode board flipping
    this.isUndoRedoAction = false; // Flag to prevent flipping during undo/redo
    
    this.sounds = this.createSoundSystem();
  }

  initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place pawns
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: 'pawn', color: 'black' };
      board[6][i] = { type: 'pawn', color: 'white' };
    }
    
    // Place other pieces
    const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: pieceOrder[i], color: 'black' };
      board[7][i] = { type: pieceOrder[i], color: 'white' };
    }
    
    return board;
  }

  createSoundSystem() {
    // Enhanced sound system with multiple sound types
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const AudioCtx = AudioContext || webkitAudioContext;
      const audioContext = new AudioCtx();
      
      return {
        // Soft wooden click for piece movement - slightly louder
        move: () => {
          if (!this.soundEnabled) return;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Soft wooden click sound - increased volume
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.04);
          
          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.04);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.04);
        },
        
        // Double wooden clack sound for piece capture
        capture: () => {
          if (!this.soundEnabled) return;
          
          // First subtle click
          const oscillator1 = audioContext.createOscillator();
          const gainNode1 = audioContext.createGain();
          
          oscillator1.connect(gainNode1);
          gainNode1.connect(audioContext.destination);
          
          oscillator1.type = 'sine';
          oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator1.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.03);
          
          gainNode1.gain.setValueAtTime(0.06, audioContext.currentTime);
          gainNode1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
          
          oscillator1.start(audioContext.currentTime);
          oscillator1.stop(audioContext.currentTime + 0.03);
          
          // Second subtle click (slightly delayed)
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          
          oscillator2.type = 'sine';
          oscillator2.frequency.setValueAtTime(350, audioContext.currentTime + 0.04);
          oscillator2.frequency.exponentialRampToValueAtTime(160, audioContext.currentTime + 0.07);
          
          gainNode2.gain.setValueAtTime(0.05, audioContext.currentTime + 0.04);
          gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);
          
          oscillator2.start(audioContext.currentTime + 0.04);
          oscillator2.stop(audioContext.currentTime + 0.07);
        },
        
        // Check sound
        check: () => {
          if (!this.soundEnabled) return;
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Higher pitched warning sound
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
        },
        
        // Victory/checkmate sound
        victory: () => {
          if (!this.soundEnabled) return;
          // Play a triumphant sequence
          const frequencies = [523, 659, 784, 1047]; // C, E, G, C octave
          frequencies.forEach((freq, index) => {
            setTimeout(() => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
              gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.3);
            }, index * 150);
          });
        }
      };
    }
    
    // Fallback if audio is not available
    return {
      move: () => {},
      capture: () => {},
      check: () => {},
      victory: () => {}
    };
  }

  getPieceSymbol(piece) {
    if (!piece) return '';
    
    const symbols = {
      white: {
        king: '♚', queen: '♛', rook: '♜',
        bishop: '♝', knight: '♞', pawn: '♟'
      },
      black: {
        king: '♔', queen: '♕', rook: '♖',
        bishop: '♗', knight: '♘', pawn: '♙'
      }
    };
    
    return symbols[piece.color][piece.type];
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  getPossibleMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.color !== this.currentPlayer) return [];

    let moves = [];
    
    switch (piece.type) {
      case 'pawn':
        moves = this.getPawnMoves(row, col);
        break;
      case 'rook':
        moves = this.getRookMoves(row, col);
        break;
      case 'knight':
        moves = this.getKnightMoves(row, col);
        break;
      case 'bishop':
        moves = this.getBishopMoves(row, col);
        break;
      case 'queen':
        moves = this.getQueenMoves(row, col);
        break;
      case 'king':
        moves = this.getKingMoves(row, col);
        break;
    }

    // Filter out moves that would put own king in check
    return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col));
  }

  getPawnMoves(row, col) {
    const moves = [];
    const piece = this.board[row][col];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;

    // Forward move
    if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      
      // Double forward move from starting position
      if (row === startRow && !this.board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col });
      }
    }

    // Diagonal captures
    for (const colOffset of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + colOffset;
      
      if (this.isValidPosition(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (target && target.color !== piece.color) {
          moves.push({ row: newRow, col: newCol });
        }
        
        // En passant capture
        if (this.enPassantTarget && 
            this.enPassantTarget.row === newRow && 
            this.enPassantTarget.col === newCol) {
          moves.push({ row: newRow, col: newCol, enPassant: true });
        }
      }
    }

    return moves;
  }

  getRookMoves(row, col) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (const [dRow, dCol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + i * dRow;
        const newCol = col + i * dCol;
        
        if (!this.isValidPosition(newRow, newCol)) break;
        
        const target = this.board[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (target.color !== this.board[row][col].color) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
      }
    }
    
    return moves;
  }

  getKnightMoves(row, col) {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dRow, dCol] of knightMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidPosition(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (!target || target.color !== this.board[row][col].color) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }
    
    return moves;
  }

  getBishopMoves(row, col) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    for (const [dRow, dCol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + i * dRow;
        const newCol = col + i * dCol;
        
        if (!this.isValidPosition(newRow, newCol)) break;
        
        const target = this.board[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (target.color !== this.board[row][col].color) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
      }
    }
    
    return moves;
  }

  getQueenMoves(row, col) {
    return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
  }

  getKingMoves(row, col) {
    const moves = [];
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dRow, dCol] of kingMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidPosition(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (!target || target.color !== this.board[row][col].color) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }
    
    // Castling
    const color = this.board[row][col].color;
    if (this.castlingRights[color].kingside && this.canCastle(row, col, true)) {
      moves.push({ row, col: col + 2, castle: 'kingside' });
    }
    if (this.castlingRights[color].queenside && this.canCastle(row, col, false)) {
      moves.push({ row, col: col - 2, castle: 'queenside' });
    }
    
    return moves;
  }

  canCastle(kingRow, kingCol, kingside) {
    const rookCol = kingside ? 7 : 0;
    const direction = kingside ? 1 : -1;
    
    // Check if path is clear
    const start = Math.min(kingCol, rookCol) + 1;
    const end = Math.max(kingCol, rookCol);
    
    for (let col = start; col < end; col++) {
      if (this.board[kingRow][col]) return false;
    }
    
    // Check if king is in check or would pass through check
    for (let i = 0; i <= 2; i++) {
      if (this.isSquareAttacked(kingRow, kingCol + i * direction, this.currentPlayer === 'white' ? 'black' : 'white')) {
        return false;
      }
    }
    
    return true;
  }

  isSquareAttacked(row, col, byColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === byColor) {
          const moves = this.getPieceAttacks(r, c);
          if (moves.some(move => move.row === row && move.col === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getPieceAttacks(row, col) {
    // Similar to getPossibleMoves but doesn't filter for check
    const piece = this.board[row][col];
    if (!piece) return [];

    switch (piece.type) {
      case 'pawn':
        return this.getPawnAttacks(row, col);
      case 'rook':
        return this.getRookMoves(row, col);
      case 'knight':
        return this.getKnightMoves(row, col);
      case 'bishop':
        return this.getBishopMoves(row, col);
      case 'queen':
        return this.getQueenMoves(row, col);
      case 'king':
        return this.getKingAttacks(row, col);
      default:
        return [];
    }
  }

  getPawnAttacks(row, col) {
    const moves = [];
    const piece = this.board[row][col];
    const direction = piece.color === 'white' ? -1 : 1;

    for (const colOffset of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + colOffset;
      if (this.isValidPosition(newRow, newCol)) {
        moves.push({ row: newRow, col: newCol });
      }
    }
    return moves;
  }

  getKingAttacks(row, col) {
    const moves = [];
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dRow, dCol] of kingMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (this.isValidPosition(newRow, newCol)) {
        moves.push({ row: newRow, col: newCol });
      }
    }
    return moves;
  }

  wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
    // Simulate the move
    const originalPiece = this.board[toRow][toCol];
    const movingPiece = this.board[fromRow][fromCol];
    
    this.board[toRow][toCol] = movingPiece;
    this.board[fromRow][fromCol] = null;
    
    // Find king position
    let kingRow, kingCol;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.type === 'king' && piece.color === this.currentPlayer) {
          kingRow = r;
          kingCol = c;
          break;
        }
      }
    }
    
    const inCheck = this.isSquareAttacked(kingRow, kingCol, this.currentPlayer === 'white' ? 'black' : 'white');
    
    // Restore board
    this.board[fromRow][fromCol] = movingPiece;
    this.board[toRow][toCol] = originalPiece;
    
    return inCheck;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];
    
    
    // Handle special moves
    const move = this.getPossibleMoves(fromRow, fromCol).find(m => m.row === toRow && m.col === toCol);
    if (!move) {
      return false;
    }

    // Check if move results in check/checkmate (we'll check after the move)
    let willBeCheck = false;
    let willBeCheckmate = false;

    // Execute the move
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Handle en passant capture
    if (move.enPassant) {
      const captureRow = this.currentPlayer === 'white' ? toRow + 1 : toRow - 1;
      this.board[captureRow][toCol] = null;
    }

    // Handle castling
    if (move.castle) {
      const rookFromCol = move.castle === 'kingside' ? 7 : 0;
      const rookToCol = move.castle === 'kingside' ? toCol - 1 : toCol + 1;
      this.board[toRow][rookToCol] = this.board[toRow][rookFromCol];
      this.board[toRow][rookFromCol] = null;
    }

    // Update en passant target
    this.enPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      this.enPassantTarget = {
        row: (fromRow + toRow) / 2,
        col: toCol
      };
    }

    // Update castling rights
    if (piece.type === 'king') {
      this.castlingRights[piece.color].kingside = false;
      this.castlingRights[piece.color].queenside = false;
    } else if (piece.type === 'rook') {
      if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
      if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
    }

    // Handle pawn promotion (simplified - always promote to queen)
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      this.board[toRow][toCol] = { type: 'queen', color: piece.color };
    }

    // Switch players
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    
    // Check game status after move
    this.updateGameStatus();
    willBeCheck = this.gameStatus === 'check';
    willBeCheckmate = this.gameStatus === 'checkmate';
    
    // Generate chess notation and commentary
    const notation = this.generateMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, willBeCheck, willBeCheckmate);
    const commentary = this.generateMoveCommentary(fromRow, fromCol, toRow, toCol, piece, capturedPiece, move.enPassant ? 'enPassant' : move.castle ? move.castle : null);
    
    // If we're in the middle of move history (after undo), truncate future moves
    if (this.currentMoveIndex !== undefined && this.currentMoveIndex < this.moveHistory.length - 1) {
      this.moveHistory = this.moveHistory.slice(0, this.currentMoveIndex + 1);
    }
    
    // Record move for history with notation and commentary
    // Calculate correct move number BEFORE adding to history
    const moveNumber = Math.ceil((this.moveHistory.length + 1) / 2);
    
    // Determine if this is a bot move for enhanced tracking
    const isBotMove = this.gameMode === 'human-vs-bot' && !this.isUndoRedoAction && 
                      ((this.humanColor === 'white' && piece.color === 'black') || 
                       (this.humanColor === 'black' && piece.color === 'white'));
    
    const moveRecord = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: { ...piece },
      captured: capturedPiece ? { ...capturedPiece } : null,
      special: move.enPassant ? 'enPassant' : move.castle ? move.castle : null,
      notation: notation,
      commentary: commentary,
      moveNumber: moveNumber,
      player: piece.color,
      timestamp: new Date().toISOString(),
      isBotMove: isBotMove,
      gameMode: this.gameMode,
      // Enhanced state tracking for better undo/redo
      boardStateHash: this.calculateBoardStateHash(),
      castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
      enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null
    };
    
    this.moveHistory.push(moveRecord);
    
    // Reset current move index to the end
    this.currentMoveIndex = this.moveHistory.length - 1;
    
    
    // Play appropriate sound effect
    if (willBeCheckmate) {
      this.sounds.victory();
    } else if (willBeCheck) {
      this.sounds.check();
    } else if (capturedPiece) {
      this.sounds.capture();
    } else {
      this.sounds.move();
    }
    
    
    // Auto-save game state after every move
    this.autoSave();
    
    return true;
  }

  updateGameStatus() {
    const hasValidMoves = this.hasValidMoves();
    const inCheck = this.isInCheck();
    
    if (!hasValidMoves) {
      this.gameStatus = inCheck ? 'checkmate' : 'stalemate';
    } else if (inCheck) {
      this.gameStatus = 'check';
    } else {
      this.gameStatus = 'playing';
    }
  }

  hasValidMoves() {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.currentPlayer) {
          if (this.getPossibleMoves(row, col).length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isInCheck() {
    // Find current player's king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king' && piece.color === this.currentPlayer) {
          return this.isSquareAttacked(row, col, this.currentPlayer === 'white' ? 'black' : 'white');
        }
      }
    }
    return false;
  }

  newGame() {
    this.board = this.initializeBoard();
    this.selectedSquare = null;
    this.gameStatus = 'playing';
    this.moveHistory = [];
    this.currentMoveIndex = undefined; // Explicitly set to undefined for new game
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    this.isUndoRedoAction = false;
    
    // Handle game mode specific initialization
    if (this.gameMode === 'human-vs-bot') {
      // Determine human color for human-vs-bot mode
      if (this.humanColor === 'random') {
        this.humanColor = Math.random() < 0.5 ? 'white' : 'black';
      }
      this.currentPlayer = 'white'; // Always start with white
      this.boardFlipped = false; // No board flipping in human-vs-bot mode
    } else if (this.gameMode === 'human-vs-human') {
      this.currentPlayer = 'white'; // Always start with white
      this.boardFlipped = false; // Start with white perspective
    }
    
    
    // Auto-save the fresh game state
    this.autoSave();
  }

  // Set game mode
  setGameMode(mode) {
    if (mode !== 'human-vs-human' && mode !== 'human-vs-bot') {
      return false;
    }
    
    this.gameMode = mode;
    
    // Reset board flipping when switching modes
    if (mode === 'human-vs-bot') {
      this.boardFlipped = false;
    }
    
    return true;
  }

  // Set human color for human-vs-bot mode
  setHumanColor(color) {
    if (color !== 'white' && color !== 'black' && color !== 'random') {
      return false;
    }
    
    this.humanColor = color;
    return true;
  }

  // Get current game mode
  getGameMode() {
    return this.gameMode;
  }

  // Get human color (resolved if random)
  getHumanColor() {
    return this.humanColor;
  }

  // Check if board should be flipped
  shouldFlipBoard() {
    return this.gameMode === 'human-vs-human' && this.boardFlipped;
  }

  // Set correct board perspective for current player in human-vs-human mode
  setCorrectBoardPerspective() {
    if (this.gameMode === 'human-vs-bot') {
      // In vs Bot mode, board should ALWAYS remain static from human player's perspective
      // Human plays from bottom regardless of color
      this.boardFlipped = (this.humanColor === 'black');
      return;
    }

    if (this.gameMode !== 'human-vs-human') {
      this.boardFlipped = false;
      return;
    }

    // In human-vs-human mode during undo/redo, maintain perspective of side at bottom
    // When not in undo/redo, board should be flipped to show current player at bottom
    const shouldBeFlipped = this.currentPlayer === 'black';
    
    if (this.boardFlipped !== shouldBeFlipped) {
      this.boardFlipped = shouldBeFlipped;
    }
  }

  // Get storage key based on current game mode
  getStorageKey() {
    return `chess_game_state_${this.gameMode.replace('-', '_')}`;
  }

  // Get available color options for human vs bot mode
  getColorOptions() {
    return [
      { value: 'white', label: 'Play as White' },
      { value: 'black', label: 'Play as Black' },
      { value: 'random', label: 'Random Color' }
    ];
  }

  // Get available game mode options
  getGameModeOptions() {
    return [
      { value: 'human-vs-bot', label: 'Human vs Bot' },
      { value: 'human-vs-human', label: 'Human vs Human' }
    ];
  }

  // Check if current player is human (for human-vs-bot mode)
  isHumanTurn() {
    if (this.gameMode === 'human-vs-human') {
      return true; // Both players are human
    }
    
    // In human-vs-bot mode, check if current player matches human color
    return this.currentPlayer === this.humanColor;
  }

  // Check if current player is bot (for human-vs-bot mode)
  isBotTurn() {
    if (this.gameMode === 'human-vs-human') {
      return false; // No bot in human-vs-human mode
    }
    
    // In human-vs-bot mode, check if current player is opposite of human color
    return this.currentPlayer !== this.humanColor;
  }

  // Get display text for current game mode
  getGameModeDisplayText() {
    if (this.gameMode === 'human-vs-human') {
      return 'Human vs Human';
    } else {
      const humanColorText = this.humanColor === 'white' ? 'White' : 'Black';
      return `Human (${humanColorText}) vs Bot`;
    }
  }

  // Enhanced Bot AI with strategic thinking
  generateBotMove() {
    if (this.gameMode !== 'human-vs-bot' || !this.isBotTurn()) {
      return null;
    }

    const botColor = this.currentPlayer;
    const opponentColor = botColor === 'white' ? 'black' : 'white';

    // Get all possible moves for the bot
    const allMoves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === botColor) {
          const moves = this.getPossibleMoves(row, col);
          for (const move of moves) {
            allMoves.push({
              from: { row, col },
              to: { row: move.row, col: move.col },
              piece: piece,
              capturedPiece: this.board[move.row][move.col],
              score: 0 // Will be calculated
            });
          }
        }
      }
    }

    if (allMoves.length === 0) {
      return null;
    }

    // Enhanced move evaluation with multiple strategic factors
    for (const move of allMoves) {
      move.score = this.evaluateMove(move, botColor, opponentColor);
    }

    // Sort moves by score (highest first)
    allMoves.sort((a, b) => b.score - a.score);

    // Select from top moves with some randomness for variety
    const topMoves = allMoves.filter(move => move.score >= allMoves[0].score * 0.8);
    const selectedMove = topMoves[Math.floor(Math.random() * Math.min(3, topMoves.length))];


    return selectedMove;
  }

  // Enhanced comprehensive move evaluation system with game phase awareness
  evaluateMove(move, botColor, opponentColor) {
    let score = 0;

    // Simulate the move
    const originalPiece = this.board[move.to.row][move.to.col];
    this.board[move.to.row][move.to.col] = move.piece;
    this.board[move.from.row][move.from.col] = null;

    // Determine game phase for phase-specific evaluation
    const gamePhase = this.getGamePhase();
    const phaseMultiplier = this.getPhaseMultiplier(gamePhase);

    // 1. Capture value (high priority) - enhanced with exchange evaluation
    if (move.capturedPiece) {
      const captureValue = this.getPieceValue(move.capturedPiece);
      const attackerValue = this.getPieceValue(move.piece);
      
      // Basic capture bonus
      score += captureValue * 10;
      
      // Exchange evaluation - prefer favorable trades
      if (captureValue > attackerValue) {
        score += (captureValue - attackerValue) * 15; // Favorable exchange
      } else if (captureValue < attackerValue && this.isPieceDefended(move.to.row, move.to.col, opponentColor)) {
        score -= (attackerValue - captureValue) * 12; // Unfavorable exchange
      }
      
    }

    // 2. Tactical threats - check, checkmate, and discovered attacks
    const tacticalScore = this.evaluateTacticalThreats(move, botColor, opponentColor);
    score += tacticalScore;

    // 3. Strategic positioning based on game phase
    const strategicScore = this.evaluateStrategicPositioning(move, gamePhase, botColor);
    score += strategicScore * phaseMultiplier;

    // 4. King safety - enhanced with attack patterns
    const kingSafetyScore = this.evaluateKingSafety(move, botColor, opponentColor, gamePhase);
    score += kingSafetyScore;

    // 5. Piece coordination and harmony
    const coordinationScore = this.evaluatePieceCoordination(move, botColor);
    score += coordinationScore;

    // 6. Pawn structure evaluation
    const pawnStructureScore = this.evaluatePawnStructure(move, botColor);
    score += pawnStructureScore;

    // 7. Threat prevention and defensive considerations
    const defensiveScore = this.evaluateDefensiveValue(move, botColor, opponentColor);
    score += defensiveScore;

    // 8. Advanced positional factors
    const advancedPositionalScore = this.evaluateAdvancedPositional(move, botColor, gamePhase);
    score += advancedPositionalScore;

    // Restore board state
    this.board[move.from.row][move.from.col] = move.piece;
    this.board[move.to.row][move.to.col] = originalPiece;

    return Math.round(score);
  }

  // Center control evaluation
  getCenterControlBonus(row, col) {
    const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
    const extendedCenter = [[2,2], [2,3], [2,4], [2,5], [3,2], [3,5], [4,2], [4,5], [5,2], [5,3], [5,4], [5,5]];
    
    if (centerSquares.some(([r, c]) => r === row && c === col)) {
      return 15; // Strong center control
    }
    if (extendedCenter.some(([r, c]) => r === row && c === col)) {
      return 8; // Extended center control
    }
    return 0;
  }

  // Development bonus for early game
  getDevelopmentBonus(move) {
    if (move.piece.type === 'knight' || move.piece.type === 'bishop') {
      // Bonus for developing knights and bishops
      const startRow = move.piece.color === 'white' ? 7 : 0;
      if (move.from.row === startRow) {
        return 12; // First development
      }
    }
    return 0;
  }

  // King safety evaluation
  getKingSafetyBonus(color) {
    // Simple king safety check - bonus for castling rights
    const castlingKey = color === 'white' ? 'white' : 'black';
    if (this.castlingRights[castlingKey].kingside || this.castlingRights[castlingKey].queenside) {
      return 5; // Castling available
    }
    return 0;
  }

  // Mobility and piece activity
  getMobilityBonus(move, color) {
    // Bonus based on piece type and position
    const pieceValues = {
      queen: 3,
      rook: 2,
      bishop: 2,
      knight: 2,
      pawn: 1,
      king: 0
    };
    return pieceValues[move.piece.type] || 0;
  }

  // Check if piece would be hanging after move
  isPieceHanging(row, col, color) {
    // Simple check - see if any opponent piece can capture this square
    const opponentColor = color === 'white' ? 'black' : 'white';
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === opponentColor) {
          const moves = this.getPossibleMoves(r, c);
          if (moves.some(move => move.row === row && move.col === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Positional bonuses for specific pieces
  getPositionalBonus(move) {
    let bonus = 0;
    
    switch (move.piece.type) {
      case 'pawn':
        // Bonus for pawn advancement
        const advancement = move.piece.color === 'white' ? (7 - move.to.row) : move.to.row;
        bonus += advancement * 2;
        
        // Bonus for passed pawns
        if (this.isPassedPawn(move.to.row, move.to.col, move.piece.color)) {
          bonus += 15;
        }
        break;
        
      case 'knight':
        // Knights prefer center positions
        bonus += this.getCenterControlBonus(move.to.row, move.to.col) * 0.5;
        break;
        
      case 'bishop':
        // Bishops prefer long diagonals
        if (this.isOnLongDiagonal(move.to.row, move.to.col)) {
          bonus += 8;
        }
        break;
        
      case 'rook':
        // Rooks prefer open files
        if (this.isOpenFile(move.to.col)) {
          bonus += 10;
        }
        break;
    }
    
    return bonus;
  }

  // Helper methods for positional evaluation
  isPassedPawn(row, col, color) {
    // Simplified passed pawn detection
    const direction = color === 'white' ? -1 : 1;
    const startRow = row + direction;
    const endRow = color === 'white' ? 0 : 7;
    
    for (let r = startRow; r !== endRow + direction; r += direction) {
      if (r < 0 || r > 7) break;
      for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
        const piece = this.board[r][c];
        if (piece && piece.type === 'pawn' && piece.color !== color) {
          return false;
        }
      }
    }
    return true;
  }

  isOnLongDiagonal(row, col) {
    return (row === col) || (row + col === 7);
  }

  isOpenFile(col) {
    for (let row = 0; row < 8; row++) {
      const piece = this.board[row][col];
      if (piece && piece.type === 'pawn') {
        return false;
      }
    }
    return true;
  }

  // Get piece value for AI evaluation
  getPieceValue(piece) {
    if (!piece) return 0;
    const values = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 100
    };
    return values[piece.type] || 0;
  }

  // Enhanced AI evaluation methods for deeper strategic thinking

  // Determine current game phase
  getGamePhase() {
    const totalPieces = this.countTotalPieces();
    const totalMoves = this.moveHistory.length;
    
    if (totalMoves < 20 && totalPieces > 28) {
      return 'opening';
    } else if (totalPieces > 14) {
      return 'middlegame';
    } else {
      return 'endgame';
    }
  }

  // Get phase-specific evaluation multipliers
  getPhaseMultiplier(phase) {
    switch (phase) {
      case 'opening': return 1.2; // Emphasize development
      case 'middlegame': return 1.0; // Balanced evaluation
      case 'endgame': return 0.8; // Focus on king activity and pawns
      default: return 1.0;
    }
  }

  // Count total pieces on board
  countTotalPieces() {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col]) count++;
      }
    }
    return count;
  }

  // Evaluate tactical threats (checks, pins, forks, etc.)
  evaluateTacticalThreats(move, botColor, opponentColor) {
    let score = 0;

    // Check bonus (very high priority)
    if (this.isPlayerInCheck(opponentColor)) {
      score += 50;
      
      // Extra bonus for checkmate
      if (this.isCheckmate(opponentColor)) {
        score += 1000;
      }
    }

    // Fork detection - piece attacking multiple valuable targets
    const forkTargets = this.detectForkTargets(move.to.row, move.to.col, move.piece, opponentColor);
    if (forkTargets.length > 1) {
      const forkValue = forkTargets.reduce((sum, target) => sum + this.getPieceValue(target), 0);
      score += forkValue * 8;
    }

    // Pin detection - piece pinning opponent piece to valuable target
    if (this.createsPinAfterMove(move, botColor, opponentColor)) {
      score += 25;
    }

    return score;
  }

  // Evaluate strategic positioning based on game phase
  evaluateStrategicPositioning(move, gamePhase, botColor) {
    let score = 0;

    switch (gamePhase) {
      case 'opening':
        // Prioritize development and center control
        score += this.getCenterControlBonus(move.to.row, move.to.col) * 1.5;
        score += this.getDevelopmentBonus(move);
        
        // Bonus for castling preparation
        if (move.piece.type === 'king' && Math.abs(move.to.col - move.from.col) === 2) {
          score += 30; // Castling bonus
        }
        break;

      case 'middlegame':
        // Focus on piece activity and tactical opportunities
        score += this.getMobilityBonus(move, botColor) * 2;
        score += this.getPositionalBonus(move);
        
        // Piece coordination bonus
        score += this.evaluatePieceActivity(move.to.row, move.to.col, move.piece, botColor);
        break;

      case 'endgame':
        // King activity and pawn promotion
        if (move.piece.type === 'king') {
          score += this.getKingActivityBonus(move.to.row, move.to.col, botColor) * 2;
        }
        
        if (move.piece.type === 'pawn') {
          const promotionDistance = botColor === 'white' ? move.to.row : (7 - move.to.row);
          score += (7 - promotionDistance) * 5; // Closer to promotion = higher bonus
        }
        break;
    }

    return score;
  }

  // Enhanced king safety evaluation
  evaluateKingSafety(move, botColor, opponentColor, gamePhase) {
    let score = 0;

    // Find king positions
    const myKing = this.findKing(botColor);
    const opponentKing = this.findKing(opponentColor);

    if (!myKing || !opponentKing) return 0;

    // In opening/middlegame, prioritize king safety
    if (gamePhase !== 'endgame') {
      // Bonus for maintaining castling rights
      const castlingKey = botColor;
      if (this.castlingRights[castlingKey].kingside || this.castlingRights[castlingKey].queenside) {
        score += 15;
      }

      // Penalty for exposing king
      if (move.piece.type === 'king' && this.isSquareAttacked(move.to.row, move.to.col, opponentColor)) {
        score -= 30;
      }
    } else {
      // In endgame, active king is good
      if (move.piece.type === 'king') {
        score += this.getKingActivityBonus(move.to.row, move.to.col, botColor);
      }
    }

    return score;
  }

  // Evaluate piece coordination and support
  evaluatePieceCoordination(move, botColor) {
    let score = 0;

    // Check if move supports other pieces
    const supportedPieces = this.countSupportedPieces(move.to.row, move.to.col, botColor);
    score += supportedPieces * 3;

    // Check if move is supported by other pieces
    if (this.isPieceDefended(move.to.row, move.to.col, botColor)) {
      score += 5;
    }

    return score;
  }

  // Helper methods for enhanced AI evaluation

  detectForkTargets(row, col, piece, opponentColor) {
    const targets = [];
    const moves = this.getPossibleMovesForPieceAt(row, col, piece);
    
    for (const moveTarget of moves) {
      const targetPiece = this.board[moveTarget.row][moveTarget.col];
      if (targetPiece && targetPiece.color === opponentColor && this.getPieceValue(targetPiece) >= 3) {
        targets.push(targetPiece);
      }
    }
    
    return targets;
  }

  createsPinAfterMove(move, botColor, opponentColor) {
    // Simplified pin detection - check if move creates a line attack through opponent piece to valuable target
    const directions = this.getPieceAttackDirections(move.piece);
    
    for (const [dr, dc] of directions) {
      let r = move.to.row + dr;
      let c = move.to.col + dc;
      let foundOpponentPiece = null;
      
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = this.board[r][c];
        if (piece) {
          if (piece.color === opponentColor && !foundOpponentPiece) {
            foundOpponentPiece = piece;
          } else if (piece.color === opponentColor && foundOpponentPiece && this.getPieceValue(piece) > this.getPieceValue(foundOpponentPiece)) {
            return true; // Pin detected
          } else {
            break;
          }
        }
        r += dr;
        c += dc;
      }
    }
    
    return false;
  }

  evaluatePieceActivity(row, col, piece, color) {
    // Count squares the piece can influence from this position
    const moves = this.getPossibleMovesForPieceAt(row, col, piece);
    return moves.length * 2; // Mobility bonus
  }

  getKingActivityBonus(row, col, color) {
    // In endgame, centralized king is better
    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
    return Math.max(0, 10 - centerDistance * 2);
  }

  findKing(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  countSupportedPieces(row, col, color) {
    let count = 0;
    const moves = this.getPossibleMovesForPieceAt(row, col, this.board[row][col]);
    
    for (const move of moves) {
      const piece = this.board[move.row][move.col];
      if (piece && piece.color === color) {
        count++;
      }
    }
    
    return count;
  }

  getPieceAttackDirections(piece) {
    switch (piece.type) {
      case 'rook': return [[0,1], [0,-1], [1,0], [-1,0]];
      case 'bishop': return [[1,1], [1,-1], [-1,1], [-1,-1]];
      case 'queen': return [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]];
      default: return [];
    }
  }

  getPossibleMovesForPieceAt(row, col, piece) {
    // Temporarily place piece and get moves
    const originalPiece = this.board[row][col];
    this.board[row][col] = piece;
    const moves = this.getPossibleMoves(row, col);
    this.board[row][col] = originalPiece;
    return moves;
  }

  // Placeholder methods for additional evaluation factors
  evaluatePawnStructure(move, botColor) {
    // Basic pawn structure evaluation
    if (move.piece.type === 'pawn') {
      return this.getPositionalBonus(move) * 0.5;
    }
    return 0;
  }

  evaluateDefensiveValue(move, botColor, opponentColor) {
    // Check if move defends against immediate threats
    let score = 0;
    
    // Simple defensive bonus for blocking checks or defending valuable pieces
    if (this.blocksCheck(move, botColor)) {
      score += 20;
    }
    
    return score;
  }

  evaluateAdvancedPositional(move, botColor, gamePhase) {
    // Advanced positional factors like outposts, weak squares, etc.
    return this.getPositionalBonus(move) * (gamePhase === 'middlegame' ? 1.2 : 1.0);
  }

  blocksCheck(move, color) {
    // Check if this move blocks a check against our king
    const king = this.findKing(color);
    if (!king) return false;
    
    // Simulate move and see if it removes check
    const originalPiece = this.board[move.to.row][move.to.col];
    this.board[move.to.row][move.to.col] = move.piece;
    this.board[move.from.row][move.from.col] = null;
    
    const blocksCheck = !this.isPlayerInCheck(color);
    
    // Restore board
    this.board[move.from.row][move.from.col] = move.piece;
    this.board[move.to.row][move.to.col] = originalPiece;
    
    return blocksCheck;
  }

  // Calculate a simple hash of the current board state for move history validation
  calculateBoardStateHash() {
    let hash = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          hash += `${piece.type[0]}${piece.color[0]}${row}${col}`;
        }
      }
    }
    hash += this.currentPlayer[0];
    hash += this.enPassantTarget ? `ep${this.enPassantTarget.row}${this.enPassantTarget.col}` : '';
    return hash;
  }

  // Execute bot move with natural thinking patterns
  async executeBotMove() {
    if (this.gameMode !== 'human-vs-bot' || !this.isBotTurn()) {
      return false;
    }

    const startTime = Date.now();
    
    // Generate bot move with timing
    const botMove = this.generateBotMove();
    if (!botMove) {
      return false;
    }

    const thinkingTime = Date.now() - startTime;

    // Natural delay based on move complexity and game phase
    const baseDelay = this.calculateBotDelay(botMove);
    const naturalDelay = baseDelay + (Math.random() * 800); // Add randomness
    
    // Ensure minimum thinking time for realism
    const remainingDelay = Math.max(200, naturalDelay - thinkingTime);
    

    await new Promise(resolve => setTimeout(resolve, remainingDelay));


    // Ensure this is not treated as an undo/redo action
    const wasUndoRedoAction = this.isUndoRedoAction;
    this.isUndoRedoAction = false;

    // Execute the move
    const success = this.makeMove(
      botMove.from.row,
      botMove.from.col,
      botMove.to.row,
      botMove.to.col
    );

    // Restore the original flag state
    this.isUndoRedoAction = wasUndoRedoAction;

    if (success) {
    } else {
    }

    return success;
  }

  // Calculate natural bot delay based on move complexity
  calculateBotDelay(move) {
    let baseDelay = 800; // Base thinking time
    
    // Longer delay for complex moves
    if (move.capturedPiece) {
      baseDelay += 400; // Captures require more thought
    }
    
    if (move.score > 50) {
      baseDelay += 600; // High-value moves take longer
    }
    
    // Early game moves are faster
    if (this.moveHistory.length < 6) {
      baseDelay *= 0.7;
    }
    
    // Endgame moves take longer
    const pieceCount = this.countPieces();
    if (pieceCount <= 12) {
      baseDelay *= 1.4;
    }
    
    return Math.min(baseDelay, 2500); // Cap at 2.5 seconds
  }

  // Count total pieces on board
  countPieces() {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col]) count++;
      }
    }
    return count;
  }

  getGameState() {
    
    // Create deep copies to avoid reference issues
    const deepCopyBoard = this.board.map(row => 
      row.map(piece => piece ? { 
        type: piece.type, 
        color: piece.color,
        hasMoved: piece.hasMoved || false 
      } : null)
    );
    
    const deepCopyMoveHistory = this.moveHistory.map((move, index) => ({
      from: { row: move.from.row, col: move.from.col },
      to: { row: move.to.row, col: move.to.col },
      piece: { 
        type: move.piece.type, 
        color: move.piece.color,
        hasMoved: move.piece.hasMoved || false
      },
      captured: move.captured ? { 
        type: move.captured.type, 
        color: move.captured.color,
        hasMoved: move.captured.hasMoved || false
      } : null,
      special: move.special || null,
      notation: move.notation || '',
      commentary: move.commentary || '',
      moveNumber: move.moveNumber || Math.ceil((index + 1) / 2),
      player: move.player || move.piece.color,
      timestamp: move.timestamp || new Date().toISOString(),
      moveIndex: index
    }));
    
    const deepCopyCastlingRights = {
      white: { 
        kingside: Boolean(this.castlingRights.white.kingside), 
        queenside: Boolean(this.castlingRights.white.queenside) 
      },
      black: { 
        kingside: Boolean(this.castlingRights.black.kingside), 
        queenside: Boolean(this.castlingRights.black.queenside) 
      }
    };
    
    // Calculate comprehensive state metadata
    const currentMoveIdx = this.getCurrentMoveIndex();
    const gameState = {
      // Core game state
      board: deepCopyBoard,
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus,
      moveHistory: deepCopyMoveHistory,
      currentMoveIndex: this.currentMoveIndex,
      enPassantTarget: this.enPassantTarget ? { 
        row: this.enPassantTarget.row, 
        col: this.enPassantTarget.col 
      } : null,
      castlingRights: deepCopyCastlingRights,
      
      // UI preferences
      soundEnabled: Boolean(this.soundEnabled),
      allowUndo: Boolean(this.allowUndo),
      theme: this.theme || 'classic',
      
      // Game mode settings
      gameMode: this.gameMode || 'human-vs-bot',
      humanColor: this.humanColor || 'white',
      boardFlipped: Boolean(this.boardFlipped),
      
      // State metadata for validation
      totalMoves: this.moveHistory.length,
      currentMoveNumber: currentMoveIdx >= 0 ? Math.ceil((currentMoveIdx + 1) / 2) : 0,
      
      // Serialization metadata
      serializationVersion: '2.0',
      serializationTimestamp: new Date().toISOString(),
      
      // State validation checksums
      boardChecksum: this.calculateBoardChecksum(deepCopyBoard),
      moveHistoryChecksum: this.calculateMoveHistoryChecksum(deepCopyMoveHistory),
      
      // Additional state information
      gameStartTime: this.gameStartTime || new Date().toISOString(),
      lastMoveTime: deepCopyMoveHistory.length > 0 ? 
        deepCopyMoveHistory[deepCopyMoveHistory.length - 1].timestamp : null,
      
      // State integrity markers
      stateValid: this.validateGameState(),
      selectedSquare: null // Always null in saved state
    };
    
    
    return gameState;
  }
  
  // Calculate checksum for board state
  calculateBoardChecksum(board) {
    const boardString = JSON.stringify(board, (key, val) => {
      if (val === null) return 'null';
      if (typeof val === 'object') return `${val.type}-${val.color}-${val.hasMoved}`;
      return val;
    });
    return calculateChecksum(boardString);
  }
  
  // Calculate checksum for move history
  calculateMoveHistoryChecksum(moveHistory) {
    const historyString = JSON.stringify(moveHistory, (key, val) => {
      if (key === 'timestamp') return 'timestamp'; // Normalize timestamps
      return val;
    });
    return calculateChecksum(historyString);
  }

  loadGameState(state) {
    
    // Store original state for consistency validation
    const originalStateForValidation = JSON.parse(JSON.stringify(state));
    
    // Create deep copies to avoid reference issues
    this.board = state.board.map(row => 
      row.map(piece => piece ? { 
        type: piece.type,
        color: piece.color,
        hasMoved: piece.hasMoved !== undefined ? piece.hasMoved : false
      } : null)
    );
    
    this.currentPlayer = state.currentPlayer;
    this.gameStatus = state.gameStatus || 'playing';
    
    // Restore move history with enhanced validation
    this.moveHistory = (state.moveHistory || []).map((move, index) => ({
      from: { row: move.from.row, col: move.from.col },
      to: { row: move.to.row, col: move.to.col },
      piece: { 
        type: move.piece.type,
        color: move.piece.color,
        hasMoved: move.piece.hasMoved !== undefined ? move.piece.hasMoved : false
      },
      captured: move.captured ? { 
        type: move.captured.type,
        color: move.captured.color,
        hasMoved: move.captured.hasMoved !== undefined ? move.captured.hasMoved : false
      } : null,
      special: move.special || null,
      notation: move.notation || '',
      commentary: move.commentary || '',
      moveNumber: move.moveNumber || Math.ceil((index + 1) / 2),
      player: move.player || move.piece.color,
      timestamp: move.timestamp || new Date().toISOString(),
      moveIndex: move.moveIndex !== undefined ? move.moveIndex : index
    }));
    
    this.currentMoveIndex = state.currentMoveIndex;
    this.enPassantTarget = state.enPassantTarget ? { 
      row: state.enPassantTarget.row, 
      col: state.enPassantTarget.col 
    } : null;
    
    // Restore castling rights with proper structure
    this.castlingRights = state.castlingRights ? {
      white: { 
        kingside: Boolean(state.castlingRights.white.kingside), 
        queenside: Boolean(state.castlingRights.white.queenside) 
      },
      black: { 
        kingside: Boolean(state.castlingRights.black.kingside), 
        queenside: Boolean(state.castlingRights.black.queenside) 
      }
    } : {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    
    // Restore additional state information
    this.theme = state.theme || 'classic';
    this.soundEnabled = state.soundEnabled !== undefined ? Boolean(state.soundEnabled) : true;
    this.allowUndo = state.allowUndo !== undefined ? Boolean(state.allowUndo) : true;
    this.gameStartTime = state.gameStartTime || new Date().toISOString();
    this.selectedSquare = null; // Always null when loading
    
    // Restore game mode settings
    this.gameMode = state.gameMode || 'human-vs-bot';
    this.humanColor = state.humanColor || 'white';
    this.boardFlipped = state.boardFlipped !== undefined ? Boolean(state.boardFlipped) : false;
    this.isUndoRedoAction = false; // Always reset this flag when loading
    
    // Validate checksums if available
    if (state.boardChecksum && state.moveHistoryChecksum) {
      const currentBoardChecksum = this.calculateBoardChecksum(this.board);
      const currentHistoryChecksum = this.calculateMoveHistoryChecksum(this.moveHistory);
      
      if (currentBoardChecksum !== state.boardChecksum) {
      } else {
      }
      
      if (currentHistoryChecksum !== state.moveHistoryChecksum) {
      } else {
      }
    }
    
    
    // Validate the loaded state
    if (!this.validateGameState()) {
    } else {
    }
    
    // Perform consistency validation if we have enhanced format
    if (state.serializationVersion) {
      const currentState = this.getGameState();
      if (!this.validateStateConsistency(originalStateForValidation, currentState)) {
      } else {
      }
    }
  }

  async autoSave() {
    // Automatically save game state after each move
    
    // Validate current game state before saving
    if (!this.validateGameState()) {
      return false;
    }
    
    try {
      const gameState = this.getGameState();
      
      
      // Validate game state before saving
      if (!gameState || typeof gameState !== 'object') {
        return false;
      }
      
      // Use separate storage keys for each game mode
      const storageKey = this.getStorageKey();
      const success = await saveToStorage(storageKey, gameState);
      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  canUndo() {
    return this.allowUndo && this.moveHistory.length > 0;
  }

  canRedo() {
    return this.allowUndo && this.currentMoveIndex < this.moveHistory.length - 1;
  }

  undoMove() {
    if (!this.canUndo()) return false;

    if (this.currentMoveIndex === undefined) {
      this.currentMoveIndex = this.moveHistory.length - 1;
    }

    if (this.currentMoveIndex < 0) return false;

    // Set flag to prevent board flipping
    this.isUndoRedoAction = true;

    const move = this.moveHistory[this.currentMoveIndex];
    
    // Restore the board state before this move
    this.board[move.from.row][move.from.col] = move.piece;
    this.board[move.to.row][move.to.col] = move.captured;

    // Handle special move reversals
    if (move.special === 'enPassant') {
      const captureRow = move.piece.color === 'white' ? move.to.row + 1 : move.to.row - 1;
      this.board[captureRow][move.to.col] = move.captured;
      this.board[move.to.row][move.to.col] = null;
    }

    if (move.special === 'kingside' || move.special === 'queenside') {
      const rookFromCol = move.special === 'kingside' ? move.to.col - 1 : move.to.col + 1;
      const rookToCol = move.special === 'kingside' ? 7 : 0;
      this.board[move.to.row][rookToCol] = this.board[move.to.row][rookFromCol];
      this.board[move.to.row][rookFromCol] = null;
    }

    // Switch player back
    this.currentPlayer = move.piece.color;
    this.currentMoveIndex--;
    
    // Update game status
    this.updateGameStatus();
    
    // Set correct board perspective for the current player after undo
    this.setCorrectBoardPerspective();
    
    // Reset the flag after a short delay
    setTimeout(() => {
      this.isUndoRedoAction = false;
    }, 100);
    
    return true;
  }

  redoMove() {
    if (!this.canRedo()) return false;

    // Set flag to prevent board flipping
    this.isUndoRedoAction = true;

    this.currentMoveIndex++;
    const move = this.moveHistory[this.currentMoveIndex];
    
    // Execute the move
    this.board[move.to.row][move.to.col] = move.piece;
    this.board[move.from.row][move.from.col] = null;

    // Handle special moves
    if (move.special === 'enPassant') {
      const captureRow = move.piece.color === 'white' ? move.to.row + 1 : move.to.row - 1;
      this.board[captureRow][move.to.col] = null;
    }

    if (move.special === 'kingside' || move.special === 'queenside') {
      const rookFromCol = move.special === 'kingside' ? 7 : 0;
      const rookToCol = move.special === 'kingside' ? move.to.col - 1 : move.to.col + 1;
      this.board[move.to.row][rookToCol] = this.board[move.to.row][rookFromCol];
      this.board[move.to.row][rookFromCol] = null;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    
    // Update game status
    this.updateGameStatus();
    
    // Set correct board perspective for the current player after redo
    this.setCorrectBoardPerspective();
    
    // Reset the flag after a short delay
    setTimeout(() => {
      this.isUndoRedoAction = false;
    }, 100);
    
    return true;
  }

  getCurrentMoveIndex() {
    return this.currentMoveIndex !== undefined ? this.currentMoveIndex : this.moveHistory.length - 1;
  }

  // Validate current game state integrity with comprehensive consistency checks
  validateGameState() {
    
    const issues = [];
    const warnings = [];
    
    // Validate board structure
    if (!this.board || !Array.isArray(this.board) || this.board.length !== 8) {
      issues.push('Invalid board structure');
    } else {
      for (let i = 0; i < 8; i++) {
        if (!Array.isArray(this.board[i]) || this.board[i].length !== 8) {
          issues.push(`Invalid board row ${i}`);
        }
      }
    }
    
    // Validate current player
    if (this.currentPlayer !== 'white' && this.currentPlayer !== 'black') {
      issues.push(`Invalid currentPlayer: ${this.currentPlayer}`);
    }
    
    // Validate move history
    if (!Array.isArray(this.moveHistory)) {
      issues.push('Invalid moveHistory structure');
    } else {
      // Check move history consistency
      for (let i = 0; i < this.moveHistory.length; i++) {
        const move = this.moveHistory[i];
        if (!move.from || !move.to || !move.piece) {
          issues.push(`Invalid move at index ${i}: missing required properties`);
        }
        if (typeof move.from.row !== 'number' || typeof move.from.col !== 'number' ||
            typeof move.to.row !== 'number' || typeof move.to.col !== 'number') {
          issues.push(`Invalid move at index ${i}: invalid coordinates`);
        }
        if (!move.piece.type || !move.piece.color) {
          issues.push(`Invalid move at index ${i}: invalid piece data`);
        }
      }
      
      // Validate move count consistency
      const expectedPlayerTurn = this.moveHistory.length % 2 === 0 ? 'white' : 'black';
      if (this.currentMoveIndex === undefined || this.currentMoveIndex === this.moveHistory.length - 1) {
        if (this.currentPlayer !== expectedPlayerTurn) {
          warnings.push(`Player turn inconsistency: expected ${expectedPlayerTurn}, got ${this.currentPlayer}`);
        }
      }
    }
    
    // Validate move index consistency
    if (this.currentMoveIndex !== undefined) {
      if (this.currentMoveIndex < -1 || this.currentMoveIndex >= this.moveHistory.length) {
        issues.push(`Invalid currentMoveIndex: ${this.currentMoveIndex} (history length: ${this.moveHistory.length})`);
      }
    }
    
    // Validate castling rights structure
    if (!this.castlingRights || 
        !this.castlingRights.white || 
        !this.castlingRights.black ||
        typeof this.castlingRights.white.kingside !== 'boolean' ||
        typeof this.castlingRights.white.queenside !== 'boolean' ||
        typeof this.castlingRights.black.kingside !== 'boolean' ||
        typeof this.castlingRights.black.queenside !== 'boolean') {
      issues.push('Invalid castlingRights structure');
    }
    
    // Validate en passant target
    if (this.enPassantTarget !== null && this.enPassantTarget !== undefined) {
      if (typeof this.enPassantTarget.row !== 'number' || typeof this.enPassantTarget.col !== 'number') {
        issues.push('Invalid enPassantTarget structure');
      }
    }
    
    // Validate game status
    const validStatuses = ['playing', 'checkmate', 'stalemate', 'draw'];
    if (!validStatuses.includes(this.gameStatus)) {
      issues.push(`Invalid gameStatus: ${this.gameStatus}`);
    }
    
    // Board consistency checks
    if (this.board && Array.isArray(this.board)) {
      let whiteKingCount = 0;
      let blackKingCount = 0;
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.board[row][col];
          if (piece) {
            if (piece.type === 'king') {
              if (piece.color === 'white') whiteKingCount++;
              if (piece.color === 'black') blackKingCount++;
            }
            
            // Validate piece structure
            if (!piece.type || !piece.color || (piece.color !== 'white' && piece.color !== 'black')) {
              issues.push(`Invalid piece at ${row},${col}: ${JSON.stringify(piece)}`);
            }
          }
        }
      }
      
      if (whiteKingCount !== 1) {
        issues.push(`Invalid white king count: ${whiteKingCount} (expected 1)`);
      }
      if (blackKingCount !== 1) {
        issues.push(`Invalid black king count: ${blackKingCount} (expected 1)`);
      }
    }
    
    if (warnings.length > 0) {
    }
    
    if (issues.length > 0) {
      return false;
    }
    
    return true;
  }
  
  // Additional method to validate state consistency between save and load
  validateStateConsistency(originalState, loadedState) {
    
    const issues = [];
    
    // Check basic structure consistency
    if (originalState.moveHistory.length !== loadedState.moveHistory.length) {
      issues.push(`Move history length mismatch: original ${originalState.moveHistory.length}, loaded ${loadedState.moveHistory.length}`);
    }
    
    if (originalState.currentPlayer !== loadedState.currentPlayer) {
      issues.push(`Current player mismatch: original ${originalState.currentPlayer}, loaded ${loadedState.currentPlayer}`);
    }
    
    if (originalState.gameStatus !== loadedState.gameStatus) {
      issues.push(`Game status mismatch: original ${originalState.gameStatus}, loaded ${loadedState.gameStatus}`);
    }
    
    // Deep comparison of board state
    if (originalState.board && loadedState.board) {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const orig = originalState.board[row][col];
          const loaded = loadedState.board[row][col];
          
          if ((orig === null) !== (loaded === null)) {
            issues.push(`Board mismatch at ${row},${col}: null state differs`);
          } else if (orig && loaded) {
            if (orig.type !== loaded.type || orig.color !== loaded.color) {
              issues.push(`Board mismatch at ${row},${col}: piece differs`);
            }
          }
        }
      }
    }
    
    if (issues.length > 0) {
      return false;
    }
    
    return true;
  }
  
  // Comprehensive save/load cycle test method
  async testSaveLoadCycle() {
    
    try {
      // Get current state before saving
      const originalState = this.getGameState();
      
      // Perform save operation
      const saveSuccess = await this.autoSave();
      if (!saveSuccess) {
        return false;
      }
      
      // Load the saved state
      const loadedState = await loadFromStorage('chess_game_state');
      if (!loadedState) {
        return false;
      }
      
      
      // Validate consistency between original and loaded states
      const consistencyValid = this.validateStateConsistency(originalState, loadedState);
      if (!consistencyValid) {
        return false;
      }
      
      // Create a temporary game instance to test loading
      const testGame = new ChessGame();
      testGame.loadGameState(loadedState);
      
      // Validate the test game state
      if (!testGame.validateGameState()) {
        return false;
      }
      
      // Compare key metrics
      const testState = testGame.getGameState();
      const metricsMatch = (
        originalState.totalMoves === testState.totalMoves &&
        originalState.currentPlayer === testState.currentPlayer &&
        originalState.gameStatus === testState.gameStatus &&
        originalState.moveHistory.length === testState.moveHistory.length
      );
      
      if (!metricsMatch) {
        return false;
      }
      
      
      return true;
      
    } catch (error) {
      return false;
    }
  }

  // Convert coordinates to chess notation (e.g., 0,0 -> a8, 7,7 -> h1)
  coordsToChessNotation(row, col) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  }

  // Generate chess notation for a move
  generateMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, isCheck, isCheckmate) {
    let notation = '';
    
    // Handle castling
    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
      return toCol > fromCol ? 'O-O' : 'O-O-O';
    }
    
    // Piece notation (except pawns)
    if (piece.type !== 'pawn') {
      notation += piece.type.charAt(0).toUpperCase();
      if (piece.type === 'knight') notation = 'N'; // Knight is N, not K
    }
    
    // For pawns, include file if capturing
    if (piece.type === 'pawn' && capturedPiece) {
      notation += this.coordsToChessNotation(fromRow, fromCol).charAt(0);
    }
    
    // Capture notation
    if (capturedPiece) {
      notation += 'x';
    }
    
    // Destination square
    notation += this.coordsToChessNotation(toRow, toCol);
    
    // Check and checkmate
    if (isCheckmate) {
      notation += '#';
    } else if (isCheck) {
      notation += '+';
    }
    
    return notation;
  }

  // Generate human-readable move commentary
  generateMoveCommentary(fromRow, fromCol, toRow, toCol, piece, capturedPiece, special) {
    const pieceNames = {
      king: 'King',
      queen: 'Queen', 
      rook: 'Rook',
      bishop: 'Bishop',
      knight: 'Knight',
      pawn: 'Pawn'
    };

    const fromSquare = this.coordsToChessNotation(fromRow, fromCol);
    const toSquare = this.coordsToChessNotation(toRow, toCol);
    
    let commentary = '';
    
    // Handle special moves
    if (special === 'kingside') {
      return 'Castles kingside';
    } else if (special === 'queenside') {
      return 'Castles queenside';
    } else if (special === 'enPassant') {
      return `Pawn takes pawn en passant on ${toSquare}`;
    }
    
    // Regular moves
    const pieceName = pieceNames[piece.type];
    
    if (capturedPiece) {
      const capturedPieceName = pieceNames[capturedPiece.type];
      commentary = `${pieceName} takes ${capturedPieceName} on ${toSquare}`;
    } else {
      commentary = `${pieceName} to ${toSquare}`;
    }
    
    return commentary;
  }

  // Calculate material balance using traditional chess values
  calculateMaterialBalance() {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0 // King has no point value
    };

    let whitePoints = 0;
    let blackPoints = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          if (piece.color === 'white') {
            whitePoints += value;
          } else {
            blackPoints += value;
          }
        }
      }
    }

    return whitePoints - blackPoints; // Positive = white advantage, negative = black advantage
  }
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
    this.currentPlayerElement = document.getElementById('current-player');
    this.gameStatusElement = document.getElementById('game-status');
    this.isFlipping = false; // Flag to prevent interactions during flip animation
    this.inputEnabled = true; // Flag to control user input during bot turns
    this.lastAlertTime = 0; // Prevent double alerts
    this.alertCooldown = 1000; // Minimum time between alerts (ms)
    
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
        
        // Enhanced touch support for R1 device
        square.addEventListener('click', (e) => this.handleSquareClick(e));
        square.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        square.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        square.addEventListener('touchcancel', (e) => this.handleTouchCancel(e));
        
        this.boardElement.appendChild(square);
      }
    }
    
    this.applyTheme();
  }

  handleSquareClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    this.handleSquareSelection(row, col);
  }

  handleTouchStart(event) {
    event.preventDefault();
    this.touchStartTime = Date.now();
    this.touchTarget = event.target;
    
    // Add visual feedback for touch
    event.target.style.opacity = '0.7';
  }

  handleTouchEnd(event) {
    event.preventDefault();
    
    // Remove visual feedback
    if (this.touchTarget) {
      this.touchTarget.style.opacity = '';
    }
    
    // Only process if touch was quick (not a long press)
    if (this.touchStartTime && Date.now() - this.touchStartTime < 500) {
      // Get the square from the touch target
      let square = event.target;
      while (square && !square.dataset.row) {
        square = square.parentElement;
      }
      
      if (square && square.dataset.row !== undefined) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        this.handleSquareSelection(row, col);
      }
    }
    
    this.touchStartTime = null;
    this.touchTarget = null;
  }

  handleTouchCancel(event) {
    event.preventDefault();
    
    // Remove visual feedback
    if (this.touchTarget) {
      this.touchTarget.style.opacity = '';
    }
    
    this.touchStartTime = null;
    this.touchTarget = null;
  }

  // Convert display coordinates to logical coordinates based on board flip
  getLogicalCoordinates(displayRow, displayCol) {
    if (this.game.shouldFlipBoard()) {
      return {
        row: 7 - displayRow,
        col: 7 - displayCol
      };
    }
    return { row: displayRow, col: displayCol };
  }

  // Convert logical coordinates to display coordinates based on board flip
  getDisplayCoordinates(logicalRow, logicalCol) {
    if (this.game.shouldFlipBoard()) {
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
      // Update the board display at the midpoint of the animation
      this.game.boardFlipped = !this.game.boardFlipped;
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
    const gameMode = this.game.gameMode;
    const isBotTurn = this.game.isBotTurn();
    const gameStatus = this.game.gameStatus;
    const currentPlayer = this.game.currentPlayer;
    const humanColor = this.game.getHumanColor();


    // Validate bot turn conditions
    if (gameMode !== 'human-vs-bot') {
      return;
    }

    if (!isBotTurn) {
      return;
    }

    // Check if game is over
    if (gameStatus !== 'playing') {
      this.showBotThinking(false);
      this.setInputEnabled(false); // Keep disabled for game end
      return;
    }

    // Determine if this is an initial bot move (first move of game)
    const isInitialBotMove = this.game.moveHistory.length === 0 && isBotTurn;
    const moveType = isInitialBotMove ? 'INITIAL' : 'SUBSEQUENT';


    // Always ensure user input is disabled and thinking indicator is shown
    this.setInputEnabled(false);
    this.showBotThinking(true);
    
    // Update UI state to reflect bot's turn
    this.updateGameStateIndicators();

    try {
      // Add slight delay for initial moves to allow UI to settle
      if (isInitialBotMove) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Execute bot move with enhanced error handling
      const success = await this.game.executeBotMove();
      
      if (success) {
        
        // Update display after bot move
        this.updateDisplay();
        
        // Play move sound if enabled
        if (this.game.soundEnabled && this.game.sounds) {
          this.game.sounds.move.play().catch(() => {
          });
        }
        
        // Hide thinking indicator and re-enable input only after successful move
        this.showBotThinking(false);
        
        // Check if game ended after bot move
        if (this.game.gameStatus !== 'playing') {
          this.setInputEnabled(false); // Keep disabled for game end
          this.handleGameEnd();
        } else {
          // Game continues - enable input for human's turn
          this.setInputEnabled(true);
        }
        
      } else {
        
        // Hide thinking indicator and show error
        this.showBotThinking(false);
        this.showInstructionLabel('Bot move failed - your turn');
        this.setInputEnabled(true);
        
        setTimeout(() => {
          this.hideInstructionLabel();
        }, 3000);
      }
    } catch (error) {
      
      // Hide thinking indicator and re-enable input on error
      this.showBotThinking(false);
      this.setInputEnabled(true);
      this.showInstructionLabel('Bot error - your turn');
      
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
    
    if (show && gameMode === 'human-vs-bot' && isBotTurn && gameStatus === 'playing') {
      // Show thinking indicator only when appropriate
      this.showInstructionLabel('Bot is thinking...');
      
      // Add bot thinking CSS class for enhanced styling
      if (instructionLabel) {
        instructionLabel.classList.add('bot-thinking');
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
      
      // Remove bot thinking CSS class
      if (instructionLabel) {
        instructionLabel.classList.remove('bot-thinking');
      }
      
      // Update turn indicator when thinking stops
      if (gameMode === 'human-vs-bot') {
        this.updatePlayerTurnIndicator(this.game.currentPlayer, gameMode);
      }
    }
  }

  // Enhanced UI feedback system for game state transitions
  handleGameEnd() {
    const gameStatus = this.game.gameStatus;
    const currentPlayer = this.game.currentPlayer;
    
    
    // Disable all input
    this.setInputEnabled(false);
    
    // Show appropriate end game message
    let message = '';
    let isVictory = false;
    
    if (gameStatus === 'checkmate') {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      if (this.game.gameMode === 'human-vs-bot') {
        if ((this.game.humanColor === 'white' && winner === 'White') || 
            (this.game.humanColor === 'black' && winner === 'Black')) {
          message = 'Checkmate! You won!';
          isVictory = true;
        } else {
          message = 'Checkmate! Bot won!';
          isVictory = false;
        }
      } else {
        message = `Checkmate! ${winner} wins!`;
        isVictory = true;
      }
    } else if (gameStatus === 'stalemate') {
      message = 'Stalemate! Game is a draw.';
      isVictory = false;
    } else if (gameStatus === 'draw') {
      message = 'Game is a draw.';
      isVictory = false;
    }
    
    // Show the message with appropriate styling
    this.showGameEndMessage(message, isVictory);
    
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
  showGameEndMessage(message, isVictory) {
    const instructionLabel = document.getElementById('instruction-label');
    if (instructionLabel) {
      instructionLabel.textContent = message;
      instructionLabel.classList.remove('hidden');
      
      // Add special styling for game end
      instructionLabel.classList.add('game-end');
      if (isVictory) {
        instructionLabel.classList.add('victory');
      } else {
        instructionLabel.classList.add('defeat');
      }
      
      // Keep message visible longer for game end
      setTimeout(() => {
        instructionLabel.classList.remove('game-end', 'victory', 'defeat');
      }, 5000);
    }
  }

  // Enhanced game state feedback
  updateGameStateIndicators() {
    const gameStatus = this.game.gameStatus;
    const currentPlayer = this.game.currentPlayer;
    const gameMode = this.game.gameMode;
    
    // Update player turn indicator
    this.updatePlayerTurnIndicator(currentPlayer, gameMode);
    
    // Update game status indicator
    this.updateGameStatusIndicator(gameStatus);
    
    // Update move history display
    this.updateMoveHistoryDisplay();
  }

  // Enhanced player turn indicator with synchronized bot state
  updatePlayerTurnIndicator(currentPlayer, gameMode) {
    const turnIndicator = document.getElementById('current-player');
    if (!turnIndicator) return;
    
    let message = '';
    let indicatorClass = `player-indicator ${currentPlayer}`;
    
    if (gameMode === 'human-vs-bot') {
      const humanColor = this.game.getHumanColor();
      const isBotTurn = this.game.isBotTurn();
      const gameStatus = this.game.gameStatus;
      
      if (gameStatus !== 'playing') {
        // Game ended - show final state
        message = `Game Over (${gameStatus})`;
        indicatorClass += ' game-ended';
      } else if (isBotTurn) {
        // Check if bot is currently thinking
        const instructionLabel = document.getElementById('instruction-label');
        const isBotThinking = instructionLabel && 
                             !instructionLabel.classList.contains('hidden') && 
                             instructionLabel.textContent.includes('Bot is thinking');
        
        if (isBotThinking) {
          message = "Bot is thinking...";
          indicatorClass += ' bot-thinking';
        } else {
          message = "Bot's turn";
          indicatorClass += ' bot-turn';
        }
      } else {
        // Human's turn
        message = `Your turn (${humanColor})`;
        indicatorClass += ' human-turn';
      }
    } else {
      // Human vs Human mode
      message = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    }
    
    turnIndicator.textContent = message;
    turnIndicator.className = indicatorClass;
    
  }

  // Update game status indicator
  updateGameStatusIndicator(gameStatus) {
    const statusIndicator = document.getElementById('game-status');
    if (!statusIndicator) return;
    
    let statusText = '';
    let statusClass = '';
    
    switch (gameStatus) {
      case 'playing':
        statusText = 'In Progress';
        statusClass = 'playing';
        break;
      case 'check':
        statusText = 'Check!';
        statusClass = 'check';
        break;
      case 'checkmate':
        statusText = 'Checkmate!';
        statusClass = 'checkmate';
        break;
      case 'stalemate':
        statusText = 'Stalemate';
        statusClass = 'stalemate';
        break;
      case 'draw':
        statusText = 'Draw';
        statusClass = 'draw';
        break;
      default:
        statusText = 'Unknown';
        statusClass = 'unknown';
    }
    
    statusIndicator.textContent = statusText;
    statusIndicator.className = `status-indicator ${statusClass}`;
  }

  // Enhanced move history display
  updateMoveHistoryDisplay() {
    const moveHistoryElement = document.getElementById('move-history');
    if (!moveHistoryElement || !this.game.moveHistory.length) return;
    
    const recentMoves = this.game.moveHistory.slice(-6); // Show last 6 moves
    let historyHTML = '<div class="move-history-title">Recent Moves:</div>';
    
    recentMoves.forEach((move, index) => {
      const moveClass = move.isBotMove ? 'bot-move' : 'human-move';
      const playerIcon = move.isBotMove ? '🤖' : '👤';
      
      historyHTML += `
        <div class="move-entry ${moveClass}">
          <span class="move-player">${playerIcon}</span>
          <span class="move-notation">${move.notation}</span>
          <span class="move-number">#${move.moveNumber}</span>
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
    

    // Ensure game is in playing state
    if (this.game.gameStatus !== 'playing') {
      return;
    }

    // Check if bot should make the first move
    if (isBotTurn) {
      
      // Show bot thinking immediately
      this.showBotThinking(true);
      this.setInputEnabled(false);
      
      // Ensure UI is properly updated before bot move
      this.updateGameStateIndicators();
      
      // Small delay to allow UI to settle, then execute bot move
      setTimeout(() => {
        this.handleBotTurn();
      }, 1000);
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
    this.checkInitialBotTurn();
  }

  handleSquareSelection(row, col) {
    // Prevent interactions during board flip or when input is disabled
    if (this.isFlipping || this.inputEnabled === false) return;
    
    // In human-vs-bot mode, prevent human from moving during bot's turn
    if (this.game.gameMode === 'human-vs-bot' && this.game.isBotTurn()) {
      // Only show message if bot thinking message isn't already displayed
      const instructionLabel = document.getElementById('instruction-label');
      if (!instructionLabel || instructionLabel.classList.contains('hidden') || 
          !instructionLabel.textContent.includes('Bot is thinking')) {
        this.showInstructionLabel("Wait for bot's move...");
      }
      return;
    }
    
    // Convert display coordinates to logical coordinates
    const logical = this.getLogicalCoordinates(row, col);
    const logicalRow = logical.row;
    const logicalCol = logical.col;
    
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
          if (this.game.makeMove(fromRow, fromCol, logicalRow, logicalCol)) {
            this.game.selectedSquare = null;
            
            // Handle post-move actions based on game mode
            if (this.game.gameMode === 'human-vs-human' && !this.game.isUndoRedoAction) {
              // Flip the board after a successful move in human-vs-human mode
              setTimeout(() => {
                this.flipBoard();
              }, 200); // Small delay to show the move first
            } else if (this.game.gameMode === 'human-vs-bot' && !this.game.isUndoRedoAction) {
              // In vs Bot mode, board remains static - no flipping
              
              // Check if game is still in progress and it's bot's turn
              if (this.game.gameStatus === 'playing' && this.game.isBotTurn()) {
                
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
                if (this.game.gameStatus !== 'playing') {
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
          // Move is not in possible moves - check why and provide feedback
          const piece = this.game.board[fromRow][fromCol];
          
          // Check if the move would be valid without check consideration
          const wouldBeInCheck = this.game.wouldBeInCheck(fromRow, fromCol, logicalRow, logicalCol);
          
          if (wouldBeInCheck) {
            // Move is rejected due to check conditions
            if (this.game.isInCheck()) {
              // Player is currently in check
              this.showCheckAlert("You're in check! Must move to safety.");
              this.highlightKing(this.game.currentPlayer);
            } else {
              // Move would put king in check
              this.showCheckAlert("Can't move - would put king in check!");
              this.highlightKing(this.game.currentPlayer);
            }
          } else {
            // Move is invalid for other reasons (piece movement rules, etc.)
            // Select new piece if it belongs to current player
            const targetPiece = this.game.board[logicalRow][logicalCol];
            if (targetPiece && targetPiece.color === this.game.currentPlayer) {
              this.game.selectedSquare = { row: logicalRow, col: logicalCol };
            } else {
              this.game.selectedSquare = null;
            }
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
        pieceElement.textContent = this.game.getPieceSymbol(piece);
        square.appendChild(pieceElement);
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
      
      // Highlight last move (based on current position in history)
      const currentIndex = this.game.getCurrentMoveIndex();
      if (currentIndex >= 0 && this.game.moveHistory.length > 0) {
        const lastMove = this.game.moveHistory[currentIndex];
        if (lastMove && ((lastMove.from.row === logical.row && lastMove.from.col === logical.col) ||
            (lastMove.to.row === logical.row && lastMove.to.col === logical.col))) {
          square.classList.add('last-move');
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
    
    this.currentPlayerElement.textContent = `${this.game.currentPlayer.charAt(0).toUpperCase() + this.game.currentPlayer.slice(1)}'s Move${balanceText}`;
    
    // Update move count based on current position in history
    const currentIndex = this.game.getCurrentMoveIndex();
    const currentMoveNumber = Math.ceil((currentIndex + 1) / 2);
    const moveCountElement = document.getElementById('move-count');
    if (moveCountElement) {
      if (currentIndex >= 0) {
        moveCountElement.textContent = `Move: ${currentMoveNumber}`;
      } else {
        moveCountElement.textContent = 'Move: 0';
      }
    }
    
    // Update last move commentary and status based on current position
    const lastMoveElement = document.getElementById('last-move');
    if (lastMoveElement && currentIndex >= 0 && this.game.moveHistory.length > 0) {
      const currentMove = this.game.moveHistory[currentIndex];
      if (currentMove) {
        const commentary = currentMove.commentary || currentMove.notation;
        
        // Add game status if applicable
        let statusText = '';
        if (this.game.gameStatus === 'checkmate') {
          statusText = ' - <span style="color: #FE5F00; font-weight: bold;">Checkmate!</span>';
        } else if (this.game.gameStatus === 'check') {
          statusText = ' - <span style="color: #FE5F00; font-weight: bold;">Check!</span>';
        } else if (this.game.gameStatus === 'stalemate') {
          statusText = ' - <span style="color: #FE5F00; font-weight: bold;">Stalemate!</span>';
        }
        
        lastMoveElement.innerHTML = `${commentary}${statusText}`;
      } else {
        lastMoveElement.textContent = '';
      }
    } else if (lastMoveElement) {
      lastMoveElement.textContent = '';
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
  }

  updateOptionsButtons() {
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
    
    // Show/hide color group based on game mode
    const colorGroup = document.getElementById('color-group');
    if (colorGroup) {
      if (this.game.gameMode === 'human-vs-bot') {
        colorGroup.classList.remove('hidden');
      } else {
        colorGroup.classList.add('hidden');
      }
    }
  }

  setupOptionsEventListeners() {
    // Game Mode radio buttons
    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
    gameModeRadios.forEach(radio => {
      radio.addEventListener('change', async () => {
        if (radio.checked && radio.value !== this.game.gameMode) {
          
          // Save current game state before switching
          await this.game.autoSave();
          
          // Switch to new game mode
          const oldMode = this.game.gameMode;
          this.game.setGameMode(radio.value);
          
          // Try to load saved state for the new game mode
          const newModeKey = this.game.getStorageKey();
          const savedState = await loadFromStorage(newModeKey);
          
          if (savedState && this.isValidSavedState(savedState)) {
            this.game.loadGameState(savedState);
            this.updateDisplay();
            this.showMessage(`Switched to ${radio.value === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot'} - Game restored!`);
          } else {
            this.game.newGame();
            this.onNewGameStart();
            this.showMessage(`Switched to ${radio.value === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot'} - New game started!`);
          }
          
          this.updateOptionsButtons(); // This will show/hide color group
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
    this.hideOptionsMenu();
    
    // Clear saved state and start new game
    this.clearSavedState();
    this.game.newGame();
    this.onNewGameStart(); // This handles display update and bot turn check
    // Don't save initial game state - let it save after first move
    this.showMessage('New game started!');
  }

  async clearSavedState() {
    const keysToRemove = [
      'chess_game_state_human_vs_human',
      'chess_game_state_human_vs_bot',
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

  showInstructionLabel(text) {
    const label = document.getElementById('instruction-label');
    if (label) {
      label.textContent = text;
      label.classList.remove('hidden');
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        label.classList.add('hidden');
      }, 2000);
    }
  }

  // Show temporary alert for check-related move rejections
  showCheckAlert(message) {
    // Prevent double alerts with cooldown
    const currentTime = Date.now();
    if (currentTime - this.lastAlertTime < this.alertCooldown) {
      return;
    }
    
    this.lastAlertTime = currentTime;
    
    const label = document.getElementById('instruction-label');
    if (label) {
      // Clear any existing timeout first
      if (this.alertTimeout) {
        clearTimeout(this.alertTimeout);
      }
      
      label.textContent = message;
      label.classList.remove('hidden');
      label.style.backgroundColor = '#FE5F00'; // Orange color for check alerts
      label.style.color = 'white';
      label.style.fontWeight = 'bold';
      
      
      // Auto-hide after 3 seconds for check alerts
      this.alertTimeout = setTimeout(() => {
        label.classList.add('hidden');
        label.style.backgroundColor = '';
        label.style.color = '';
        label.style.fontWeight = '';
        this.alertTimeout = null;
      }, 3000);
    }
  }

  // Highlight king piece to indicate check condition
  highlightKing(color) {
    // Find the king of the specified color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.game.board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          const square = this.boardElement.children[row * 8 + col];
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

  animateUndoRedo(type) {
    // Add a subtle animation effect for undo/redo
    const board = this.boardElement;
    if (board) {
      board.style.transform = type === 'undo' ? 'scale(0.98)' : 'scale(1.02)';
      board.style.transition = 'transform 0.1s ease';
      
      setTimeout(() => {
        board.style.transform = 'scale(1)';
        setTimeout(() => {
          board.style.transition = '';
        }, 100);
      }, 100);
    }
    
    // Show move information
    const currentIndex = this.game.getCurrentMoveIndex();
    const totalMoves = this.game.moveHistory.length;
    const currentMoveNumber = Math.ceil((currentIndex + 1) / 2);
    
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

  async loadGameState() {
    try {
      
      // Try to load state for current game mode first
      const currentModeKey = this.game.getStorageKey();
      let state = await loadFromStorage(currentModeKey);
      
      if (!state) {
        // Try to load from the other game mode
        const otherMode = this.game.gameMode === 'human-vs-human' ? 'human-vs-bot' : 'human-vs-human';
        const otherModeKey = `chess_game_state_${otherMode.replace('-', '_')}`;
        state = await loadFromStorage(otherModeKey);
        
        if (state) {
          // Keep current game mode and settings, only restore board state
          state.gameMode = this.game.gameMode;
          state.humanColor = this.game.humanColor;
        }
      }
      
      if (!state) {
        // Finally try legacy key for backward compatibility
        state = await loadFromStorage('chess_game_state');
        if (state) {
        }
      }
      
      if (!state) {
        return false;
      }
      
      
      if (this.isValidSavedState(state)) {
        this.game.loadGameState(state);
        this.applyTheme();
        this.updateDisplay();
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
    if (state.gameStatus && state.gameStatus !== 'playing') {
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
    const initialBoard = this.game ? this.game.initializeBoard() : this.initializeBoard();
    
    for (let row = 0; row < 8; row++) {
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
window.addEventListener('scrollUp', () => {
  
  if (chessGame && gameUI) {
    if (chessGame.allowUndo) {
      if (chessGame.redoMove()) {
        chessGame.selectedSquare = null; // Clear any selected piece
        gameUI.updateBoardPerspective(); // Update perspective without animation
        gameUI.updateDisplay();
        gameUI.animateUndoRedo('redo');
        
        // Handle mode-specific updates after redo
        if (chessGame.gameMode === 'human-vs-bot') {
          // Check if it's now bot's turn and show appropriate message
          if (chessGame.isBotTurn()) {
            gameUI.showBotThinking(true);
            gameUI.setInputEnabled(false);
            setTimeout(() => {
              gameUI.handleBotTurn();
            }, 500);
          } else {
            // Ensure thinking message is hidden if it's human's turn
            gameUI.showBotThinking(false);
            gameUI.setInputEnabled(true);
          }
        } else if (chessGame.gameMode === 'human-vs-human') {
          // In human vs human, ensure board shows current player's perspective
          gameUI.setInputEnabled(true);
        }
        // Don't save state during undo/redo operations
      }
    } else {
      gameUI.showInstructionLabel('Push button to enable undo');
    }
  }
});

window.addEventListener('scrollDown', () => {
  
  if (chessGame && gameUI) {
    if (chessGame.allowUndo) {
      if (chessGame.undoMove()) {
        chessGame.selectedSquare = null; // Clear any selected piece
        gameUI.updateBoardPerspective(); // Update perspective without animation
        gameUI.updateDisplay();
        gameUI.animateUndoRedo('undo');
        
        // Handle mode-specific updates after undo
        if (chessGame.gameMode === 'human-vs-bot') {
          // Check if it's now bot's turn and show appropriate message
          if (chessGame.isBotTurn()) {
            gameUI.showBotThinking(true);
            gameUI.setInputEnabled(false);
            setTimeout(() => {
              gameUI.handleBotTurn();
            }, 500);
          } else {
            // Ensure thinking message is hidden if it's human's turn
            gameUI.showBotThinking(false);
            gameUI.setInputEnabled(true);
          }
        } else if (chessGame.gameMode === 'human-vs-human') {
          // In human vs human, ensure board shows current player's perspective
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
    gameUI.showOptionsMenu();
  }
});

window.addEventListener('longPressStart', () => {
});

window.addEventListener('longPressEnd', () => {
  // Long press triggers new game
  if (chessGame && gameUI) {
    gameUI.clearSavedState();
    chessGame.newGame();
    gameUI.updateDisplay();
    // Don't save initial game state - let it save after first move
    gameUI.showMessage('New game started!');
    
    sendGameEvent('new_game_started');
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

// Save data to persistent storage with robust error handling
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
    }
  }

  // Fallback to localStorage
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (e) {
  }

  return false;
}

// Load data from persistent storage
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
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch (e) {
  }

  return null;
}

// ===========================================
// Chess Game Initialization
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  
  // Add keyboard fallback for development (Space = side button)
  if (typeof PluginMessageHandler === 'undefined') {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('sideClick'));
      }
      
      // Additional keyboard shortcuts for development
      if (event.code === 'KeyN') {
        gameUI.clearSavedState();
        chessGame.newGame();
        gameUI.updateDisplay();
        // Don't save initial game state - let it save after first move
      }
    });
  }

  // Initialize chess game
  chessGame = new ChessGame();
  
  gameUI = new ChessUI(chessGame);
  
  // Try to load saved game state
  const loaded = await gameUI.loadGameState();
  if (loaded) {
    gameUI.updateDisplay();
    gameUI.gameStatusElement.textContent = 'Game resumed';
    setTimeout(() => {
      gameUI.gameStatusElement.textContent = '';
    }, 2000);
  } else {
    chessGame.newGame();
    gameUI.updateDisplay();
  }
  
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

