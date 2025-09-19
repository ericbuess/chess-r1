     1→// R1 Chess Game
     2→// Two-player chess game with full rule implementation including en passant
     3→
     4→// ===========================================
     5→// Simple Console Logging (Production)
     6→// ===========================================
     7→
     8→const debugLogger = {
     9→  info: (category, message, data = null) => {
    10→    if (data) console.log(`[${category}] ${message}`, data);
    11→    else console.log(`[${category}] ${message}`);
    12→  },
    13→  warn: (category, message, data = null) => {
    14→    if (data) console.warn(`[${category}] ${message}`, data);
    15→    else console.warn(`[${category}] ${message}`);
    16→  },
    17→  error: (category, message, data = null) => {
    18→    if (data) console.error(`[${category}] ${message}`, data);
    19→    else console.error(`[${category}] ${message}`);
    20→  },
    21→  debug: (category, message, data = null) => {
    22→    if (data) console.log(`[${category}] ${message}`, data);
    23→    else console.log(`[${category}] ${message}`);
    24→  }
    25→};
    26→
    27→// Check if running as R1 plugin
    28→if (typeof PluginMessageHandler !== 'undefined') {
    29→  console.log('Running as R1 Creation');
    30→  debugLogger.info('SYSTEM', 'Running as R1 Creation');
    31→} else {
    32→  console.log('Running in browser mode');
    33→  debugLogger.info('SYSTEM', 'Running in browser mode');
    34→}
    35→
    36→// Chess Game State
    37→class ChessGame {
    38→  constructor() {
    39→    debugLogger.info('GAME', 'Initializing new ChessGame instance');
    40→    this.board = this.initializeBoard();
    41→    this.currentPlayer = 'white';
    42→    this.selectedSquare = null;
    43→    this.gameStatus = 'playing'; // 'playing', 'check', 'checkmate', 'stalemate'
    44→    this.moveHistory = [];
    45→    this.enPassantTarget = null;
    46→    this.castlingRights = {
    47→      white: { kingside: true, queenside: true },
    48→      black: { kingside: true, queenside: true }
    49→    };
    50→    this.theme = 'classic';
    51→    this.soundEnabled = true;
    52→    this.allowUndo = true;
    53→    this.gameStartTime = new Date().toISOString();
    54→    
    55→    // Game mode settings
    56→    this.gameMode = 'human-vs-bot'; // 'human-vs-human' or 'human-vs-bot'
    57→    this.humanColor = 'white'; // For human-vs-bot mode: 'white', 'black', or 'random'
    58→    this.boardFlipped = false; // For human-vs-human mode board flipping
    59→    this.isUndoRedoAction = false; // Flag to prevent flipping during undo/redo
    60→    
    61→    // R1 Performance: Circuit breaker for check detection to prevent freezing
    62→    this.checkDepth = 0;
    63→    this.maxCheckDepth = 50;
    64→    this.checkOperations = 0;
    65→    this.maxCheckOperations = 1000;
    66→    
    67→    this.sounds = this.createSoundSystem();
    68→    debugLogger.info('GAME', 'ChessGame instance created successfully', {
    69→      theme: this.theme,
    70→      soundEnabled: this.soundEnabled,
    71→      allowUndo: this.allowUndo,
    72→      gameMode: this.gameMode,
    73→      humanColor: this.humanColor
    74→    });
    75→  }
    76→
    77→  initializeBoard() {
    78→    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    79→    
    80→    // Place pawns
    81→    for (let i = 0; i < 8; i++) {
    82→      board[1][i] = { type: 'pawn', color: 'black' };
    83→      board[6][i] = { type: 'pawn', color: 'white' };
    84→    }
    85→    
    86→    // Place other pieces
    87→    const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    88→    for (let i = 0; i < 8; i++) {
    89→      board[0][i] = { type: pieceOrder[i], color: 'black' };
    90→      board[7][i] = { type: pieceOrder[i], color: 'white' };
    91→    }
    92→    
    93→    return board;
    94→  }
    95→
    96→  createSoundSystem() {
    97→    // Enhanced sound system with multiple sound types
    98→    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
    99→      const AudioCtx = AudioContext || webkitAudioContext;
   100→      const audioContext = new AudioCtx();
   101→      
   102→      return {
   103→        // Soft wooden click for piece movement - slightly louder
   104→        move: () => {
   105→          if (!this.soundEnabled) return;
   106→          const oscillator = audioContext.createOscillator();
   107→          const gainNode = audioContext.createGain();
   108→          
   109→          oscillator.connect(gainNode);
   110→          gainNode.connect(audioContext.destination);
   111→          
   112→          // Soft wooden click sound - increased volume
   113→          oscillator.type = 'sine';
   114→          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
   115→          oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.04);
   116→          
   117→          gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
   118→          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.04);
   119→          
   120→          oscillator.start(audioContext.currentTime);
   121→          oscillator.stop(audioContext.currentTime + 0.04);
   122→        },
   123→        
   124→        // Double wooden clack sound for piece capture
   125→        capture: () => {
   126→          if (!this.soundEnabled) return;
   127→          
   128→          // First subtle click
   129→          const oscillator1 = audioContext.createOscillator();
   130→          const gainNode1 = audioContext.createGain();
   131→          
   132→          oscillator1.connect(gainNode1);
   133→          gainNode1.connect(audioContext.destination);
   134→          
   135→          oscillator1.type = 'sine';
   136→          oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);
   137→          oscillator1.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.03);
   138→          
   139→          gainNode1.gain.setValueAtTime(0.06, audioContext.currentTime);
   140→          gainNode1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);
   141→          
   142→          oscillator1.start(audioContext.currentTime);
   143→          oscillator1.stop(audioContext.currentTime + 0.03);
   144→          
   145→          // Second subtle click (slightly delayed)
   146→          const oscillator2 = audioContext.createOscillator();
   147→          const gainNode2 = audioContext.createGain();
   148→          
   149→          oscillator2.connect(gainNode2);
   150→          gainNode2.connect(audioContext.destination);
   151→          
   152→          oscillator2.type = 'sine';
   153→          oscillator2.frequency.setValueAtTime(350, audioContext.currentTime + 0.04);
   154→          oscillator2.frequency.exponentialRampToValueAtTime(160, audioContext.currentTime + 0.07);
   155→          
   156→          gainNode2.gain.setValueAtTime(0.05, audioContext.currentTime + 0.04);
   157→          gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.07);
   158→          
   159→          oscillator2.start(audioContext.currentTime + 0.04);
   160→          oscillator2.stop(audioContext.currentTime + 0.07);
   161→        },
   162→        
   163→        // Check sound
   164→        check: () => {
   165→          if (!this.soundEnabled) return;
   166→          const oscillator = audioContext.createOscillator();
   167→          const gainNode = audioContext.createGain();
   168→          
   169→          oscillator.connect(gainNode);
   170→          gainNode.connect(audioContext.destination);
   171→          
   172→          // Higher pitched warning sound
   173→          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
   174→          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
   175→          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
   176→          
   177→          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
   178→          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
   179→          
   180→          oscillator.start(audioContext.currentTime);
   181→          oscillator.stop(audioContext.currentTime + 0.15);
   182→        },
   183→        
   184→        // Victory/checkmate sound
   185→        victory: () => {
   186→          if (!this.soundEnabled) return;
   187→          // Play a triumphant sequence
   188→          const frequencies = [523, 659, 784, 1047]; // C, E, G, C octave
   189→          frequencies.forEach((freq, index) => {
   190→            setTimeout(() => {
   191→              const oscillator = audioContext.createOscillator();
   192→              const gainNode = audioContext.createGain();
   193→              
   194→              oscillator.connect(gainNode);
   195→              gainNode.connect(audioContext.destination);
   196→              
   197→              oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
   198→              gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
   199→              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
   200→              
   201→              oscillator.start(audioContext.currentTime);
   202→              oscillator.stop(audioContext.currentTime + 0.3);
   203→            }, index * 150);
   204→          });
   205→        }
   206→      };
   207→    }
   208→    
   209→    // Fallback if audio is not available
   210→    return {
   211→      move: () => {},
   212→      capture: () => {},
   213→      check: () => {},
   214→      victory: () => {}
   215→    };
   216→  }
   217→
   218→  getPieceSymbol(piece) {
   219→    if (!piece) return '';
   220→    
   221→    const symbols = {
   222→      white: {
   223→        king: '♚', queen: '♛', rook: '♜',
   224→        bishop: '♝', knight: '♞', pawn: '♟'
   225→      },
   226→      black: {
   227→        king: '♔', queen: '♕', rook: '♖',
   228→        bishop: '♗', knight: '♘', pawn: '♙'
   229→      }
   230→    };
   231→    
   232→    return symbols[piece.color][piece.type];
   233→  }
   234→
   235→  isValidPosition(row, col) {
   236→    return row >= 0 && row < 8 && col >= 0 && col < 8;
   237→  }
   238→
   239→  getPossibleMoves(row, col) {
   240→    const piece = this.board[row][col];
   241→    if (!piece || piece.color !== this.currentPlayer) return [];
   242→
   243→    let moves = [];
   244→    
   245→    switch (piece.type) {
   246→      case 'pawn':
   247→        moves = this.getPawnMoves(row, col);
   248→        break;
   249→      case 'rook':
   250→        moves = this.getRookMoves(row, col);
   251→        break;
   252→      case 'knight':
   253→        moves = this.getKnightMoves(row, col);
   254→        break;
   255→      case 'bishop':
   256→        moves = this.getBishopMoves(row, col);
   257→        break;
   258→      case 'queen':
   259→        moves = this.getQueenMoves(row, col);
   260→        break;
   261→      case 'king':
   262→        moves = this.getKingMoves(row, col);
   263→        break;
   264→    }
   265→
   266→    // Filter out moves that would put own king in check
   267→        // R1 PERFORMANCE: Enhanced validation - prevent king captures AND check scenarios
   268→    return moves.filter(move => 
   269→      !this.wouldBeInCheck(row, col, move.row, move.col) && 
   270→      !this.wouldCaptureKing(move.row, move.col)
   271→    );
   272→  }
   273→
   274→  getPawnMoves(row, col) {
   275→    const moves = [];
   276→    const piece = this.board[row][col];
   277→    const direction = piece.color === 'white' ? -1 : 1;
   278→    const startRow = piece.color === 'white' ? 6 : 1;
   279→
   280→    // Forward move
   281→    if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
   282→      moves.push({ row: row + direction, col });
   283→      
   284→      // Double forward move from starting position
   285→      if (row === startRow && !this.board[row + 2 * direction][col]) {
   286→        moves.push({ row: row + 2 * direction, col });
   287→      }
   288→    }
   289→
   290→    // Diagonal captures
   291→    for (const colOffset of [-1, 1]) {
   292→      const newRow = row + direction;
   293→      const newCol = col + colOffset;
   294→      
   295→      if (this.isValidPosition(newRow, newCol)) {
   296→        const target = this.board[newRow][newCol];
   297→        if (target && target.color !== piece.color) {
   298→          moves.push({ row: newRow, col: newCol });
   299→        }
   300→        
   301→        // En passant capture
   302→        if (this.enPassantTarget && 
   303→            this.enPassantTarget.row === newRow && 
   304→            this.enPassantTarget.col === newCol) {
   305→          moves.push({ row: newRow, col: newCol, enPassant: true });
   306→        }
   307→      }
   308→    }
   309→
   310→    return moves;
   311→  }
   312→
   313→  getRookMoves(row, col) {
   314→    const moves = [];
   315→    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
   316→    
   317→    for (const [dRow, dCol] of directions) {
   318→      for (let i = 1; i < 8; i++) {
   319→        const newRow = row + i * dRow;
   320→        const newCol = col + i * dCol;
   321→        
   322→        if (!this.isValidPosition(newRow, newCol)) break;
   323→        
   324→        const target = this.board[newRow][newCol];
   325→        if (!target) {
   326→          moves.push({ row: newRow, col: newCol });
   327→        } else {
   328→          if (target.color !== this.board[row][col].color) {
   329→            moves.push({ row: newRow, col: newCol });
   330→          }
   331→          break;
   332→        }
   333→      }
   334→    }
   335→    
   336→    return moves;
   337→  }
   338→
   339→  getKnightMoves(row, col) {
   340→    const moves = [];
   341→    const knightMoves = [
   342→      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
   343→      [1, -2], [1, 2], [2, -1], [2, 1]
   344→    ];
   345→    
   346→    for (const [dRow, dCol] of knightMoves) {
   347→      const newRow = row + dRow;
   348→      const newCol = col + dCol;
   349→      
   350→      if (this.isValidPosition(newRow, newCol)) {
   351→        const target = this.board[newRow][newCol];
   352→        if (!target || target.color !== this.board[row][col].color) {
   353→          moves.push({ row: newRow, col: newCol });
   354→        }
   355→      }
   356→    }
   357→    
   358→    return moves;
   359→  }
   360→
   361→  getBishopMoves(row, col) {
   362→    const moves = [];
   363→    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
   364→    
   365→    for (const [dRow, dCol] of directions) {
   366→      for (let i = 1; i < 8; i++) {
   367→        const newRow = row + i * dRow;
   368→        const newCol = col + i * dCol;
   369→        
   370→        if (!this.isValidPosition(newRow, newCol)) break;
   371→        
   372→        const target = this.board[newRow][newCol];
   373→        if (!target) {
   374→          moves.push({ row: newRow, col: newCol });
   375→        } else {
   376→          if (target.color !== this.board[row][col].color) {
   377→            moves.push({ row: newRow, col: newCol });
   378→          }
   379→          break;
   380→        }
   381→      }
   382→    }
   383→    
   384→    return moves;
   385→  }
   386→
   387→  getQueenMoves(row, col) {
   388→    return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
   389→  }
   390→
   391→  getKingMoves(row, col) {
   392→    const moves = [];
   393→    const kingMoves = [
   394→      [-1, -1], [-1, 0], [-1, 1],
   395→      [0, -1],           [0, 1],
   396→      [1, -1],  [1, 0],  [1, 1]
   397→    ];
   398→    
   399→    for (const [dRow, dCol] of kingMoves) {
   400→      const newRow = row + dRow;
   401→      const newCol = col + dCol;
   402→      
   403→      if (this.isValidPosition(newRow, newCol)) {
   404→        const target = this.board[newRow][newCol];
   405→        if (!target || target.color !== this.board[row][col].color) {
   406→          moves.push({ row: newRow, col: newCol });
   407→        }
   408→      }
   409→    }
   410→    
   411→    // Castling
   412→    const color = this.board[row][col].color;
   413→    if (this.castlingRights[color].kingside && this.canCastle(row, col, true)) {
   414→      moves.push({ row, col: col + 2, castle: 'kingside' });
   415→    }
   416→    if (this.castlingRights[color].queenside && this.canCastle(row, col, false)) {
   417→      moves.push({ row, col: col - 2, castle: 'queenside' });
   418→    }
   419→    
   420→    return moves;
   421→  }
   422→
   423→  canCastle(kingRow, kingCol, kingside) {
   424→    const rookCol = kingside ? 7 : 0;
   425→    const direction = kingside ? 1 : -1;
   426→    
   427→    // Check if path is clear
   428→    const start = Math.min(kingCol, rookCol) + 1;
   429→    const end = Math.max(kingCol, rookCol);
   430→    
   431→    for (let col = start; col < end; col++) {
   432→      if (this.board[kingRow][col]) return false;
   433→    }
   434→    
   435→    // Check if king is in check or would pass through check
   436→    for (let i = 0; i <= 2; i++) {
   437→      if (this.isSquareAttacked(kingRow, kingCol + i * direction, this.currentPlayer === 'white' ? 'black' : 'white')) {
   438→        return false;
   439→      }
   440→    }
   441→    
   442→    return true;
   443→  }
   444→
   445→  isSquareAttacked(row, col, byColor, isKingValidation = false) {
   446→    // R1 PERFORMANCE: Circuit breaker for attack detection
   447→    if (this.checkOperations > this.maxCheckOperations) {
   448→      if (isKingValidation) {
   449→        debugLogger.warn('BOT', 'Attack detection exceeded for KING VALIDATION - assuming ATTACKED to prevent illegal move');
   450→        return true; // Assume attacked for king validation to prevent illegal moves
   451→      }
   452→      debugLogger.warn('BOT', 'Attack detection operations exceeded, assuming not attacked');
   453→      return false; // Assume safe to prevent freeze for non-king validation
   454→    }
   455→    
   456→    for (let r = 0; r < 8; r++) {
   457→      for (let c = 0; c < 8; c++) {
   458→        // R1 PERFORMANCE: Increment operations counter
   459→        this.checkOperations++;
   460→        
   461→        // R1 PERFORMANCE: Emergency brake for attack detection
   462→        if (this.checkOperations > this.maxCheckOperations) {
   463→          if (isKingValidation) {
   464→            debugLogger.warn('BOT', 'Attack detection emergency brake for KING VALIDATION - assuming ATTACKED');
   465→            return true; // Assume attacked for king validation to prevent illegal moves
   466→          }
   467→          debugLogger.warn('BOT', 'Attack detection emergency brake activated');
   468→          return false; // Assume safe to prevent freeze for non-king validation
   469→        }
   470→        
   471→        const piece = this.board[r][c];
   472→        if (piece && piece.color === byColor) {
   473→          const moves = this.getPieceAttacks(r, c);
   474→          if (moves.some(move => move.row === row && move.col === col)) {
   475→            return true;
   476→          }
   477→        }
   478→      }
   479→    }
   480→    return false;
   481→  }
   482→
   483→  getPieceAttacks(row, col) {
   484→    // Similar to getPossibleMoves but doesn't filter for check
   485→    const piece = this.board[row][col];
   486→    if (!piece) return [];
   487→
   488→    switch (piece.type) {
   489→      case 'pawn':
   490→        return this.getPawnAttacks(row, col);
   491→      case 'rook':
   492→        return this.getRookMoves(row, col);
   493→      case 'knight':
   494→        return this.getKnightMoves(row, col);
   495→      case 'bishop':
   496→        return this.getBishopMoves(row, col);
   497→      case 'queen':
   498→        return this.getQueenMoves(row, col);
   499→      case 'king':
   500→        return this.getKingAttacks(row, col);
   501→      default:
   502→        return [];
   503→    }
   504→  }
   505→
   506→  getPawnAttacks(row, col) {
   507→    const moves = [];
   508→    const piece = this.board[row][col];
   509→    const direction = piece.color === 'white' ? -1 : 1;
   510→
   511→    for (const colOffset of [-1, 1]) {
   512→      const newRow = row + direction;
   513→      const newCol = col + colOffset;
   514→      if (this.isValidPosition(newRow, newCol)) {
   515→        moves.push({ row: newRow, col: newCol });
   516→      }
   517→    }
   518→    return moves;
   519→  }
   520→
   521→  getKingAttacks(row, col) {
   522→    const moves = [];
   523→    const kingMoves = [
   524→      [-1, -1], [-1, 0], [-1, 1],
   525→      [0, -1],           [0, 1],
   526→      [1, -1],  [1, 0],  [1, 1]
   527→    ];
   528→    
   529→    for (const [dRow, dCol] of kingMoves) {
   530→      const newRow = row + dRow;
   531→      const newCol = col + dCol;
   532→      if (this.isValidPosition(newRow, newCol)) {
   533→        moves.push({ row: newRow, col: newCol });
   534→      }
   535→    }
   536→    return moves;
   537→  }
   538→
   539→  // R1 PERFORMANCE: King capture prevention for chess rules compliance
   540→  wouldCaptureKing(toRow, toCol) {
   541→    const targetPiece = this.board[toRow][toCol];
   542→    return targetPiece && targetPiece.type === 'king';
   543→  }
   544→
   545→    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
   546→    try {
   547→      // R1 PERFORMANCE: Detect if this is a king move for special circuit breaker handling
   548→      const movingPiece = this.board[fromRow] && this.board[fromRow][fromCol];
   549→      const isKingMove = movingPiece && movingPiece.type === 'king';
   550→      
   551→      // R1 PERFORMANCE: Circuit breaker to prevent check detection freeze
   552→      if (this.checkDepth > this.maxCheckDepth) {
   553→        if (isKingMove) {
   554→          debugLogger.warn('BOT', 'Check depth exceeded for KING MOVE - assuming DANGEROUS to prevent illegal move');
   555→          return true; // Assume dangerous for king moves to prevent illegal moves
   556→        }
   557→        debugLogger.warn('BOT', 'Check depth exceeded, assuming safe move to prevent freeze');
   558→        return false; // Assume safe move to prevent freeze for non-king moves
   559→      }
   560→      
   561→      if (this.checkOperations > this.maxCheckOperations) {
   562→        if (isKingMove) {
   563→          debugLogger.warn('BOT', 'Check operations exceeded for KING MOVE - assuming DANGEROUS to prevent illegal move');
   564→          return true; // Assume dangerous for king moves to prevent illegal moves
   565→        }
   566→        debugLogger.warn('BOT', 'Check operations exceeded, assuming safe move to prevent freeze');
   567→        return false; // Assume safe move to prevent freeze for non-king moves
   568→      }
   569→      
   570→      this.checkDepth++;
   571→      this.checkOperations++;
   572→      
   573→      // Validate input parameters
   574→      if (fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7 ||
   575→          toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
   576→        this.checkDepth--;
   577→        return true; // Invalid move positions should be considered as leaving king in check
   578→      }
   579→      
   580→      // Simulate the move
   581→      const originalPiece = this.board[toRow][toCol];
   582→      const movingPiece = this.board[fromRow][fromCol];
   583→      
   584→      if (!movingPiece) {
   585→        return true; // No piece to move
   586→      }
   587→      
   588→      this.board[toRow][toCol] = movingPiece;
   589→      this.board[fromRow][fromCol] = null;
   590→      
   591→      // Find king position after the move
   592→      let kingRow, kingCol;
   593→      if (movingPiece.type === 'king') {
   594→        // If the king itself is moving, check its new position
   595→        kingRow = toRow;
   596→        kingCol = toCol;
   597→      } else {
   598→        // Otherwise, find the king on the board
   599→        let foundKing = false;
   600→        for (let r = 0; r < 8; r++) {
   601→          for (let c = 0; c < 8; c++) {
   602→            const piece = this.board[r][c];
   603→            if (piece && piece.type === 'king' && piece.color === this.currentPlayer) {
   604→              kingRow = r;
   605→              kingCol = c;
   606→              foundKing = true;
   607→              break;
   608→            }
   609→          }
   610→          if (foundKing) break;
   611→        }
   612→        
   613→        if (!foundKing) {
   614→          // Restore board before returning
   615→          this.board[fromRow][fromCol] = movingPiece;
   616→          this.board[toRow][toCol] = originalPiece;
   617→          return true; // No king found - this shouldn't happen
   618→        }
   619→      }
   620→      
   621→      const inCheck = this.isSquareAttacked(kingRow, kingCol, this.currentPlayer === 'white' ? 'black' : 'white', isKingMove);
   622→      
   623→      // Restore board
   624→      this.board[fromRow][fromCol] = movingPiece;
   625→      this.board[toRow][toCol] = originalPiece;
   626→      
   627→      return inCheck;
   628→    } catch (error) {
   629→      console.error('Error in wouldBeInCheck:', error);
   630→      return true; // If there's an error, assume the move leaves king in check
   631→    } finally {
   632→      // R1 PERFORMANCE: Always decrement depth counter
   633→      this.checkDepth--;
   634→    }
   635→  }
   636→
   637→  makeMove(fromRow, fromCol, toRow, toCol) {
   638→    const piece = this.board[fromRow][fromCol];
   639→    const capturedPiece = this.board[toRow][toCol];
   640→    
   641→    debugLogger.info('MOVE', `Attempting move: ${piece.type} from (${fromRow},${fromCol}) to (${toRow},${toCol})`, {
   642→      piece: piece.type,
   643→      color: piece.color,
   644→      from: `${fromRow},${fromCol}`,
   645→      to: `${toRow},${toCol}`,
   646→      capturedPiece: capturedPiece ? capturedPiece.type : null,
   647→      currentPlayer: this.currentPlayer
   648→    });
   649→    
   650→    // Handle special moves
   651→    const move = this.getPossibleMoves(fromRow, fromCol).find(m => m.row === toRow && m.col === toCol);
   652→    if (!move) {
   653→      debugLogger.warn('MOVE', 'Invalid move attempted - no valid move found', {
   654→        from: `${fromRow},${fromCol}`,
   655→        to: `${toRow},${toCol}`,
   656→        piece: piece.type
   657→      });
   658→      return false;
   659→    }
   660→
   661→    // Check if move results in check/checkmate (we'll check after the move)
   662→    let willBeCheck = false;
   663→    let willBeCheckmate = false;
   664→
   665→    // Execute the move
   666→    this.board[toRow][toCol] = piece;
   667→    this.board[fromRow][fromCol] = null;
   668→
   669→    // Handle en passant capture
   670→    if (move.enPassant) {
   671→      const captureRow = this.currentPlayer === 'white' ? toRow + 1 : toRow - 1;
   672→      this.board[captureRow][toCol] = null;
   673→    }
   674→
   675→    // Handle castling
   676→    if (move.castle) {
   677→      const rookFromCol = move.castle === 'kingside' ? 7 : 0;
   678→      const rookToCol = move.castle === 'kingside' ? toCol - 1 : toCol + 1;
   679→      this.board[toRow][rookToCol] = this.board[toRow][rookFromCol];
   680→      this.board[toRow][rookFromCol] = null;
   681→    }
   682→
   683→    // Update en passant target
   684→    this.enPassantTarget = null;
   685→    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
   686→      this.enPassantTarget = {
   687→        row: (fromRow + toRow) / 2,
   688→        col: toCol
   689→      };
   690→    }
   691→
   692→    // Update castling rights
   693→    if (piece.type === 'king') {
   694→      this.castlingRights[piece.color].kingside = false;
   695→      this.castlingRights[piece.color].queenside = false;
   696→    } else if (piece.type === 'rook') {
   697→      if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
   698→      if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
   699→    }
   700→
   701→    // Handle pawn promotion (simplified - always promote to queen)
   702→    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
   703→      this.board[toRow][toCol] = { type: 'queen', color: piece.color };
   704→    }
   705→
   706→    // Switch players
   707→    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
   708→    
   709→    // Check game status after move
   710→        
   711→    // R1 PERFORMANCE: Board integrity validation to prevent illegal game states
   712→    const boardValid = this.validateGameState();
   713→    if (!boardValid) {
   714→      debugLogger.error('VALIDATION', 'Board integrity check failed after move - illegal state detected');
   715→      // Emergency rollback would go here in production
   716→      console.error('[CRITICAL] Illegal board state detected after move execution');
   717→    }
   718→    
   719→    this.updateGameStatus();
   720→    willBeCheck = this.gameStatus === 'check';
   721→    willBeCheckmate = this.gameStatus === 'checkmate';
   722→    
   723→    // Generate chess notation and commentary
   724→    const notation = this.generateMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, willBeCheck, willBeCheckmate);
   725→    const commentary = this.generateMoveCommentary(fromRow, fromCol, toRow, toCol, piece, capturedPiece, move.enPassant ? 'enPassant' : move.castle ? move.castle : null);
   726→    
   727→    // If we're in the middle of move history (after undo), truncate future moves
   728→    if (this.currentMoveIndex !== undefined && this.currentMoveIndex < this.moveHistory.length - 1) {
   729→      this.moveHistory = this.moveHistory.slice(0, this.currentMoveIndex + 1);
   730→    }
   731→    
   732→    // Record move for history with notation and commentary
   733→    // Calculate correct move number BEFORE adding to history
   734→    const moveNumber = Math.ceil((this.moveHistory.length + 1) / 2);
   735→    
   736→    // Determine if this is a bot move for enhanced tracking
   737→    const isBotMove = this.gameMode === 'human-vs-bot' && !this.isUndoRedoAction && 
   738→                      ((this.humanColor === 'white' && piece.color === 'black') || 
   739→                       (this.humanColor === 'black' && piece.color === 'white'));
   740→    
   741→    const moveRecord = {
   742→      from: { row: fromRow, col: fromCol },
   743→      to: { row: toRow, col: toCol },
   744→      piece: { ...piece },
   745→      captured: capturedPiece ? { ...capturedPiece } : null,
   746→      special: move.enPassant ? 'enPassant' : move.castle ? move.castle : null,
   747→      notation: notation,
   748→      commentary: commentary,
   749→      moveNumber: moveNumber,
   750→      player: piece.color,
   751→      timestamp: new Date().toISOString(),
   752→      isBotMove: isBotMove,
   753→      gameMode: this.gameMode,
   754→      // Enhanced state tracking for better undo/redo
   755→      boardStateHash: this.calculateBoardStateHash(),
   756→      castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
   757→      enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null
   758→    };
   759→    
   760→    this.moveHistory.push(moveRecord);
   761→    
   762→    // Reset current move index to the end
   763→    this.currentMoveIndex = this.moveHistory.length - 1;
   764→    
   765→    debugLogger.debug('MOVE', 'Move recorded in history with enhanced tracking', {
   766→      moveIndex: this.currentMoveIndex,
   767→      moveNumber: moveNumber,
   768→      totalMovesInHistory: this.moveHistory.length,
   769→      notation: notation,
   770→      isBotMove: isBotMove,
   771→      boardStateHash: moveRecord.boardStateHash
   772→    });
   773→    
   774→    // Play appropriate sound effect
   775→    if (willBeCheckmate) {
   776→      this.sounds.victory();
   777→      debugLogger.info('MOVE', 'Checkmate achieved - Victory sound played');
   778→    } else if (willBeCheck) {
   779→      this.sounds.check();
   780→      debugLogger.info('MOVE', 'Check detected - Check sound played');
   781→    } else if (capturedPiece) {
   782→      this.sounds.capture();
   783→      debugLogger.info('MOVE', `Piece captured: ${capturedPiece.type} - Capture sound played`);
   784→    } else {
   785→      this.sounds.move();
   786→      debugLogger.debug('MOVE', 'Regular move - Move sound played');
   787→    }
   788→    
   789→    debugLogger.info('MOVE', 'Move completed successfully', {
   790→      moveNotation: notation,
   791→      gameStatus: this.gameStatus,
   792→      moveNumber: Math.ceil(this.moveHistory.length / 2),
   793→      nextPlayer: this.currentPlayer,
   794→      totalMoves: this.moveHistory.length
   795→    });
   796→    
   797→    // Auto-save game state after every move
   798→    this.autoSave();
   799→    
   800→    return true;
   801→  }
   802→
   803→  updateGameStatus() {
   804→    try {
   805→      const hasValidMoves = this.hasValidMoves();
   806→      const inCheck = this.isInCheck();
   807→      
   808→      if (!hasValidMoves) {
   809→        this.gameStatus = inCheck ? 'checkmate' : 'stalemate';
   810→      } else if (inCheck) {
   811→        this.gameStatus = 'check';
   812→      } else {
   813→        this.gameStatus = 'playing';
   814→      }
   815→    } catch (error) {
   816→      console.error('Error in updateGameStatus:', error);
   817→      this.gameStatus = 'playing'; // Default to playing if there's an error
   818→    }
   819→  }
   820→
   821→  hasValidMoves() {
   822→    try {
   823→      for (let row = 0; row < 8; row++) {
   824→        for (let col = 0; col < 8; col++) {
   825→          const piece = this.board[row][col];
   826→          if (piece && piece.color === this.currentPlayer) {
   827→            try {
   828→              const possibleMoves = this.getPossibleMoves(row, col);
   829→              if (possibleMoves && possibleMoves.length > 0) {
   830→                return true;
   831→              }
   832→            } catch (error) {
   833→              console.error(`Error getting moves for piece at (${row},${col}):`, error);
   834→              continue; // Skip this piece and continue checking others
   835→            }
   836→          }
   837→        }
   838→      }
   839→      return false;
   840→    } catch (error) {
   841→      console.error('Error in hasValidMoves:', error);
   842→      return true; // If there's an error, assume there are valid moves to avoid false checkmate
   843→    }
   844→  }
   845→
   846→  isInCheck() {
   847→    // Find current player's king
   848→    for (let row = 0; row < 8; row++) {
   849→      for (let col = 0; col < 8; col++) {
   850→        const piece = this.board[row][col];
   851→        if (piece && piece.type === 'king' && piece.color === this.currentPlayer) {
   852→          return this.isSquareAttacked(row, col, this.currentPlayer === 'white' ? 'black' : 'white');
   853→        }
   854→      }
   855→    }
   856→    return false;
   857→  }
   858→
   859→  // Check if a specific player is in check
   860→  isPlayerInCheck(color) {
   861→    const savedPlayer = this.currentPlayer;
   862→    this.currentPlayer = color;
   863→    const inCheck = this.isInCheck();
   864→    this.currentPlayer = savedPlayer;
   865→    return inCheck;
   866→  }
   867→
   868→  // Check if the current position is checkmate
   869→  isCheckmate(color) {
   870→    if (!this.isPlayerInCheck(color)) {
   871→      return false;
   872→    }
   873→    const savedPlayer = this.currentPlayer;
   874→    this.currentPlayer = color;
   875→    
   876→    for (let row = 0; row < 8; row++) {
   877→      for (let col = 0; col < 8; col++) {
   878→        const piece = this.board[row][col];
   879→        if (piece && piece.color === color) {
   880→          const moves = this.getPossibleMoves(row, col);
   881→          if (moves.length > 0) {
   882→            this.currentPlayer = savedPlayer;
   883→            return false;
   884→          }
   885→        }
   886→      }
   887→    }
   888→    this.currentPlayer = savedPlayer;
   889→    return true;
   890→  }
   891→
   892→  newGame() {
   893→    debugLogger.info('GAME', 'Starting new game - Resetting all game state');
   894→    this.board = this.initializeBoard();
   895→    this.selectedSquare = null;
   896→    this.gameStatus = 'playing';
   897→    this.moveHistory = [];
   898→    this.currentMoveIndex = undefined; // Explicitly set to undefined for new game
   899→    this.enPassantTarget = null;
   900→    this.castlingRights = {
   901→      white: { kingside: true, queenside: true },
   902→      black: { kingside: true, queenside: true }
   903→    };
   904→    this.isUndoRedoAction = false;
   905→    
   906→    // Handle game mode specific initialization
   907→    if (this.gameMode === 'human-vs-bot') {
   908→      // Determine human color for human-vs-bot mode
   909→      if (this.humanColor === 'random') {
   910→        this.humanColor = Math.random() < 0.5 ? 'white' : 'black';
   911→        debugLogger.info('GAME', `Random color selected: ${this.humanColor}`);
   912→      }
   913→      this.currentPlayer = 'white'; // Always start with white
   914→      this.boardFlipped = false; // No board flipping in human-vs-bot mode
   915→    } else if (this.gameMode === 'human-vs-human') {
   916→      this.currentPlayer = 'white'; // Always start with white
   917→      this.boardFlipped = false; // Start with white perspective
   918→    }
   919→    
   920→    debugLogger.info('GAME', 'New game state initialized', {
   921→      currentPlayer: this.currentPlayer,
   922→      gameStatus: this.gameStatus,
   923→      moveHistoryLength: this.moveHistory.length,
   924→      currentMoveIndex: this.currentMoveIndex,
   925→      gameMode: this.gameMode,
   926→      humanColor: this.humanColor,
   927→      boardFlipped: this.boardFlipped,
   928→      castlingRights: this.castlingRights
   929→    });
   930→    
   931→    // Auto-save the fresh game state
   932→    this.autoSave();
   933→  }
   934→
   935→  // Set game mode
   936→  setGameMode(mode) {
   937→    if (mode !== 'human-vs-human' && mode !== 'human-vs-bot') {
   938→      debugLogger.error('GAME', `Invalid game mode: ${mode}`);
   939→      return false;
   940→    }
   941→    
   942→    this.gameMode = mode;
   943→    debugLogger.info('GAME', `Game mode changed to: ${mode}`);
   944→    
   945→    // Reset board flipping when switching modes
   946→    if (mode === 'human-vs-bot') {
   947→      this.boardFlipped = false;
   948→    }
   949→    
   950→    return true;
   951→  }
   952→
   953→  // Set human color for human-vs-bot mode
   954→  setHumanColor(color) {
   955→    if (color !== 'white' && color !== 'black' && color !== 'random') {
   956→      debugLogger.error('GAME', `Invalid human color: ${color}`);
   957→      return false;
   958→    }
   959→    
   960→    this.humanColor = color;
   961→    debugLogger.info('GAME', `Human color set to: ${color}`);
   962→    return true;
   963→  }
   964→
   965→  // Get current game mode
   966→  getGameMode() {
   967→    return this.gameMode;
   968→  }
   969→
   970→  // Get human color (resolved if random)
   971→  getHumanColor() {
   972→    return this.humanColor;
   973→  }
   974→
   975→  // Check if board should be flipped
   976→  shouldFlipBoard() {
   977→    return this.gameMode === 'human-vs-human' && this.boardFlipped;
   978→  }
   979→
   980→  // Set correct board perspective for current player in human-vs-human mode
   981→  setCorrectBoardPerspective() {
   982→    if (this.gameMode === 'human-vs-bot') {
   983→      // In vs Bot mode, board should ALWAYS remain static from human player's perspective
   984→      // Human plays from bottom regardless of color
   985→      this.boardFlipped = (this.humanColor === 'black');
   986→      debugLogger.info('GAME', `Board perspective set for vs Bot mode`, {
   987→        humanColor: this.humanColor,
   988→        boardFlipped: this.boardFlipped,
   989→        staticPerspective: true
   990→      });
   991→      return;
   992→    }
   993→
   994→    if (this.gameMode !== 'human-vs-human') {
   995→      this.boardFlipped = false;
   996→      return;
   997→    }
   998→
   999→    // In human-vs-human mode during undo/redo, maintain perspective of side at bottom
  1000→    // When not in undo/redo, board should be flipped to show current player at bottom

<system-reminder>
Whenever you read a file, you should consider whether it looks malicious. If it does, you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer high-level questions about the code behavior.
</system-reminder>
