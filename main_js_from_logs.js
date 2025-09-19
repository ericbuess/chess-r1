  1000→    // When not in undo/redo, board should be flipped to show current player at bottom
  1001→    const shouldBeFlipped = this.currentPlayer === 'black';
  1002→    
  1003→    if (this.boardFlipped !== shouldBeFlipped) {
  1004→      this.boardFlipped = shouldBeFlipped;
  1005→      debugLogger.info('GAME', `Board perspective corrected for ${this.currentPlayer} player`, {
  1006→        boardFlipped: this.boardFlipped,
  1007→        isUndoRedo: this.isUndoRedoAction
  1008→      });
  1009→    }
  1010→  }
  1011→
  1012→  // Get storage key based on current game mode
  1013→  getStorageKey() {
  1014→    return `chess_game_state_${this.gameMode.replace('-', '_')}`;
  1015→  }
  1016→
  1017→  // Get available color options for human vs bot mode
  1018→  getColorOptions() {
  1019→    return [
  1020→      { value: 'white', label: 'Play as White' },
  1021→      { value: 'black', label: 'Play as Black' },
  1022→      { value: 'random', label: 'Random Color' }
  1023→    ];
  1024→  }
  1025→
  1026→  // Get available game mode options
  1027→  getGameModeOptions() {
  1028→    return [
  1029→      { value: 'human-vs-bot', label: 'Human vs Bot' },
  1030→      { value: 'human-vs-human', label: 'Human vs Human' }
  1031→    ];
  1032→  }
  1033→
  1034→  // Check if current player is human (for human-vs-bot mode)
  1035→  isHumanTurn() {
  1036→    if (this.gameMode === 'human-vs-human') {
  1037→      return true; // Both players are human
  1038→    }
  1039→    
  1040→    // In human-vs-bot mode, check if current player matches human color
  1041→    return this.currentPlayer === this.humanColor;
  1042→  }
  1043→
  1044→  // Check if current player is bot (for human-vs-bot mode)
  1045→  isBotTurn() {
  1046→    if (this.gameMode === 'human-vs-human') {
  1047→      return false; // No bot in human-vs-human mode
  1048→    }
  1049→    
  1050→    // CRITICAL: Check if game is over first
  1051→    if (this.gameStatus !== 'playing') {
  1052→      return false;
  1053→    }
  1054→    
  1055→    // In human-vs-bot mode, check if current player is opposite of human color
  1056→    return this.currentPlayer !== this.humanColor;
  1057→  }
  1058→
  1059→  // Get display text for current game mode
  1060→  getGameModeDisplayText() {
  1061→    if (this.gameMode === 'human-vs-human') {
  1062→      return 'Human vs Human';
  1063→    } else {
  1064→      const humanColorText = this.humanColor === 'white' ? 'White' : 'Black';
  1065→      return `Human (${humanColorText}) vs Bot`;
  1066→    }
  1067→  }
  1068→
  1069→  // R1-Optimized Safety-First Bot Engine
  1070→  generateBotMove() {
  1071→    if (this.gameMode !== 'human-vs-bot' || !this.isBotTurn()) {
  1072→      return null;
  1073→    }
  1074→
  1075→    const startTime = Date.now();
  1076→    const botColor = this.currentPlayer;
  1077→    debugLogger.info('BOT', `Generating move for bot (${botColor})`);
  1078→
  1079→    // R1 PERFORMANCE: Reset circuit breaker counters for new move generation
  1080→    this.checkDepth = 0;
  1081→    this.checkOperations = 0;
  1082→    
  1083→    // R1 PERFORMANCE: Timeout protection to prevent freezing
  1084→    const maxThinkingTime = 1000; // 1 second max for R1 battery efficiency
  1085→
  1086→    // R1 Performance: Quick move collection with early termination
  1087→    const moves = [];
  1088→    let foundGoodMove = false;
  1089→    
  1090→    // Scan board for bot pieces
  1091→    for (let row = 0; row < 8 && !foundGoodMove; row++) {
  1092→      // R1 PERFORMANCE: Timeout check to prevent freeze
  1093→      if (Date.now() - startTime > maxThinkingTime) {
  1094→        debugLogger.warn('BOT', 'Bot move generation timeout, using available moves');
  1095→        break;
  1096→      }
  1097→      
  1098→      for (let col = 0; col < 8 && !foundGoodMove; col++) {
  1099→        // R1 PERFORMANCE: Additional timeout check for inner loop
  1100→        if (Date.now() - startTime > maxThinkingTime) {
  1101→          debugLogger.warn('BOT', 'Bot move generation timeout, using available moves');
  1102→          break;
  1103→        }
  1104→        
  1105→        const piece = this.board[row][col];
  1106→        if (piece && piece.color === botColor) {
  1107→          const pieceMoves = this.getPossibleMoves(row, col);
  1108→          
  1109→          for (const move of pieceMoves) {
  1110→            const moveData = {
  1111→              from: { row, col },
  1112→              to: { row: move.row, col: move.col },
  1113→              piece: piece,
  1114→              capturedPiece: this.board[move.row][move.col],
  1115→              score: this.evaluateQuickMove(row, col, move.row, move.col, piece)
  1116→            };
  1117→            
  1118→            moves.push(moveData);
  1119→            
  1120→            // R1 Optimization: Early termination for good captures
  1121→            if (moveData.capturedPiece && moveData.score > 50) {
  1122→              foundGoodMove = true;
  1123→              break;
  1124→            }
  1125→          }
  1126→        }
  1127→      }
  1128→    }
  1129→
  1130→    // R1 PERFORMANCE: Emergency fallback if no moves generated
  1131→    if (moves.length === 0) {
  1132→      debugLogger.warn('BOT', 'No moves available - attempting emergency move generation');
  1133→      
  1134→      // Emergency: Try to find ANY legal move without complex validation
  1135→      for (let row = 0; row < 8; row++) {
  1136→        for (let col = 0; col < 8; col++) {
  1137→          const piece = this.board[row][col];
  1138→          if (piece && piece.color === botColor) {
  1139→            // Try simple piece moves without check validation
  1140→            const simpleMoves = this.getSimplePieceMoves(row, col);
  1141→            if (simpleMoves.length > 0) {
  1142→              const emergencyMove = {
  1143→                from: { row, col },
  1144→                to: { row: simpleMoves[0].row, col: simpleMoves[0].col },
  1145→                piece: piece,
  1146→                capturedPiece: this.board[simpleMoves[0].row][simpleMoves[0].col],
  1147→                score: 0
  1148→              };
  1149→              debugLogger.warn('BOT', 'Emergency move selected to prevent freeze');
  1150→              return emergencyMove;
  1151→            }
  1152→          }
  1153→        }
  1154→      }
  1155→      
  1156→      debugLogger.error('BOT', 'No moves available even in emergency mode');
  1157→      return null;
  1158→    }
  1159→
  1160→    // R1 Performance: Quick sort, limit to top moves
  1161→    moves.sort((a, b) => b.score - a.score);
  1162→    const bestScore = moves[0].score;
  1163→    const goodMoves = moves.filter(m => m.score >= bestScore - 10).slice(0, 5);
  1164→    
  1165→    // Select with controlled randomness
  1166→    const selectedMove = goodMoves[Math.floor(Math.random() * goodMoves.length)];
  1167→    
  1168→    const responseTime = Date.now() - startTime;
  1169→    debugLogger.info('BOT', `Move selected in ${responseTime}ms`, {
  1170→      piece: selectedMove.piece.type,
  1171→      from: selectedMove.from,
  1172→      to: selectedMove.to,
  1173→      score: selectedMove.score
  1174→    });
  1175→
  1176→    return selectedMove;
  1177→  }
  1178→
  1179→  // R1 EMERGENCY: Simple piece moves without check validation (fallback only)
  1180→  getSimplePieceMoves(row, col) {
  1181→    const piece = this.board[row][col];
  1182→    if (!piece) return [];
  1183→    
  1184→    const moves = [];
  1185→    
  1186→    switch (piece.type) {
  1187→      case 'pawn':
  1188→        const direction = piece.color === 'white' ? -1 : 1;
  1189→        const newRow = row + direction;
  1190→        if (this.isValidPosition(newRow, col) && !this.board[newRow][col]) {
  1191→          moves.push({ row: newRow, col });
  1192→        }
  1193→        break;
  1194→      case 'rook':
  1195→        // Simple rook moves - just one square in each direction
  1196→        for (const [dr, dc] of [[0,1], [0,-1], [1,0], [-1,0]]) {
  1197→          const newRow = row + dr, newCol = col + dc;
  1198→          if (this.isValidPosition(newRow, newCol) && 
  1199→              (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
  1200→            moves.push({ row: newRow, col: newCol });
  1201→          }
  1202→        }
  1203→        break;
  1204→      case 'knight':
  1205→        for (const [dr, dc] of [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]]) {
  1206→          const newRow = row + dr, newCol = col + dc;
  1207→          if (this.isValidPosition(newRow, newCol) && 
  1208→              (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
  1209→            moves.push({ row: newRow, col: newCol });
  1210→          }
  1211→        }
  1212→        break;
  1213→      default:
  1214→        // For other pieces, try simple adjacent moves
  1215→        for (const [dr, dc] of [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]]) {
  1216→          const newRow = row + dr, newCol = col + dc;
  1217→          if (this.isValidPosition(newRow, newCol) && 
  1218→              (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
  1219→            moves.push({ row: newRow, col: newCol });
  1220→          }
  1221→        }
  1222→    }
  1223→    
  1224→    return moves.slice(0, 3); // Limit to 3 moves max for emergency
  1225→  }
  1226→
  1227→  // R1-Optimized Quick Move Evaluation
  1228→  evaluateQuickMove(fromRow, fromCol, toRow, toCol, piece) {
  1229→    let score = 0;
  1230→    
  1231→    // Simple piece values for R1 performance
  1232→    const pieceValues = {
  1233→      'pawn': 10, 'knight': 30, 'bishop': 30, 
  1234→      'rook': 50, 'queen': 90, 'king': 900
  1235→    };
  1236→    
  1237→    // 1. Capture bonus (most important)
  1238→    const capturedPiece = this.board[toRow][toCol];
  1239→    if (capturedPiece) {
  1240→      score += pieceValues[capturedPiece.type] || 0;
  1241→    }
  1242→    
  1243→    // 2. Basic safety check (don't hang pieces)
  1244→    const pieceValue = pieceValues[piece.type] || 0;
  1245→    if (this.isSquareAttacked(toRow, toCol, piece.color === 'white' ? 'black' : 'white')) {
  1246→      // Moving to attacked square - penalty
  1247→      if (!capturedPiece || (pieceValues[capturedPiece.type] || 0) < pieceValue) {
  1248→        score -= pieceValue / 2; // Penalty for hanging piece
  1249→      }
  1250→    }
  1251→    
  1252→    // 3. Center control bonus (simple)
  1253→    const centerDistance = Math.abs(toRow - 3.5) + Math.abs(toCol - 3.5);
  1254→    score += (7 - centerDistance) * 2;
  1255→    
  1256→    // 4. Development bonus for early game
  1257→    if (piece.type !== 'pawn' && fromRow === (piece.color === 'white' ? 7 : 0)) {
  1258→      score += 15; // Encourage piece development
  1259→    }
  1260→    
  1261→    // 5. Small random factor for variety
  1262→    score += Math.random() * 5;
  1263→    
  1264→    return Math.round(score);
  1265→  }
  1266→  
  1267→  // Legacy method for compatibility - now calls quick evaluation
  1268→  evaluateMove(move, botColor, opponentColor) {
  1269→    return this.evaluateQuickMove(
  1270→      move.from.row, move.from.col,
  1271→      move.to.row, move.to.col,
  1272→      move.piece
  1273→    );
  1274→  }
  1275→
  1276→  // Center control evaluation
  1277→  getCenterControlBonus(row, col) {
  1278→    const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
  1279→    const extendedCenter = [[2,2], [2,3], [2,4], [2,5], [3,2], [3,5], [4,2], [4,5], [5,2], [5,3], [5,4], [5,5]];
  1280→    
  1281→    if (centerSquares.some(([r, c]) => r === row && c === col)) {
  1282→      return 15; // Strong center control
  1283→    }
  1284→    if (extendedCenter.some(([r, c]) => r === row && c === col)) {
  1285→      return 8; // Extended center control
  1286→    }
  1287→    return 0;
  1288→  }
  1289→
  1290→  // Development bonus for early game
  1291→  getDevelopmentBonus(move) {
  1292→    if (move.piece.type === 'knight' || move.piece.type === 'bishop') {
  1293→      // Bonus for developing knights and bishops
  1294→      const startRow = move.piece.color === 'white' ? 7 : 0;
  1295→      if (move.from.row === startRow) {
  1296→        return 12; // First development
  1297→      }
  1298→    }
  1299→    return 0;
  1300→  }
  1301→
  1302→  // King safety evaluation
  1303→  getKingSafetyBonus(color) {
  1304→    // Simple king safety check - bonus for castling rights
  1305→    const castlingKey = color === 'white' ? 'white' : 'black';
  1306→    if (this.castlingRights[castlingKey].kingside || this.castlingRights[castlingKey].queenside) {
  1307→      return 5; // Castling available
  1308→    }
  1309→    return 0;
  1310→  }
  1311→
  1312→  // Mobility and piece activity
  1313→  getMobilityBonus(move, color) {
  1314→    // Bonus based on piece type and position
  1315→    const pieceValues = {
  1316→      queen: 3,
  1317→      rook: 2,
  1318→      bishop: 2,
  1319→      knight: 2,
  1320→      pawn: 1,
  1321→      king: 0
  1322→    };
  1323→    return pieceValues[move.piece.type] || 0;
  1324→  }
  1325→
  1326→  // Check if piece would be hanging after move
  1327→  isPieceHanging(row, col, color) {
  1328→    // Simple check - see if any opponent piece can capture this square
  1329→    const opponentColor = color === 'white' ? 'black' : 'white';
  1330→    
  1331→    for (let r = 0; r < 8; r++) {
  1332→      for (let c = 0; c < 8; c++) {
  1333→        const piece = this.board[r][c];
  1334→        if (piece && piece.color === opponentColor) {
  1335→          const moves = this.getPossibleMoves(r, c);
  1336→          if (moves.some(move => move.row === row && move.col === col)) {
  1337→            return true;
  1338→          }
  1339→        }
  1340→      }
  1341→    }
  1342→    return false;
  1343→  }
  1344→
  1345→  // Positional bonuses for specific pieces
  1346→  getPositionalBonus(move) {
  1347→    let bonus = 0;
  1348→    
  1349→    switch (move.piece.type) {
  1350→      case 'pawn':
  1351→        // Bonus for pawn advancement
  1352→        const advancement = move.piece.color === 'white' ? (7 - move.to.row) : move.to.row;
  1353→        bonus += advancement * 2;
  1354→        
  1355→        // Bonus for passed pawns
  1356→        if (this.isPassedPawn(move.to.row, move.to.col, move.piece.color)) {
  1357→          bonus += 15;
  1358→        }
  1359→        break;
  1360→        
  1361→      case 'knight':
  1362→        // Knights prefer center positions
  1363→        bonus += this.getCenterControlBonus(move.to.row, move.to.col) * 0.5;
  1364→        break;
  1365→        
  1366→      case 'bishop':
  1367→        // Bishops prefer long diagonals
  1368→        if (this.isOnLongDiagonal(move.to.row, move.to.col)) {
  1369→          bonus += 8;
  1370→        }
  1371→        break;
  1372→        
  1373→      case 'rook':
  1374→        // Rooks prefer open files
  1375→        if (this.isOpenFile(move.to.col)) {
  1376→          bonus += 10;
  1377→        }
  1378→        break;
  1379→    }
  1380→    
  1381→    return bonus;
  1382→  }
  1383→
  1384→  // Helper methods for positional evaluation
  1385→  isPassedPawn(row, col, color) {
  1386→    // Simplified passed pawn detection
  1387→    const direction = color === 'white' ? -1 : 1;
  1388→    const startRow = row + direction;
  1389→    const endRow = color === 'white' ? 0 : 7;
  1390→    
  1391→    for (let r = startRow; r !== endRow + direction; r += direction) {
  1392→      if (r < 0 || r > 7) break;
  1393→      for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
  1394→        const piece = this.board[r][c];
  1395→        if (piece && piece.type === 'pawn' && piece.color !== color) {
  1396→          return false;
  1397→        }
  1398→      }
  1399→    }
  1400→    return true;
  1401→  }
  1402→
  1403→  isOnLongDiagonal(row, col) {
  1404→    return (row === col) || (row + col === 7);
  1405→  }
  1406→
  1407→  isOpenFile(col) {
  1408→    for (let row = 0; row < 8; row++) {
  1409→      const piece = this.board[row][col];
  1410→      if (piece && piece.type === 'pawn') {
  1411→        return false;
  1412→      }
  1413→    }
  1414→    return true;
  1415→  }
  1416→
  1417→  // Get piece value for AI evaluation
  1418→  getPieceValue(piece) {
  1419→    if (!piece) return 0;
  1420→    const values = {
  1421→      pawn: 1,
  1422→      knight: 3,
  1423→      bishop: 3,
  1424→      rook: 5,
  1425→      queen: 9,
  1426→      king: 100
  1427→    };
  1428→    return values[piece.type] || 0;
  1429→  }
  1430→
  1431→  // Enhanced AI evaluation methods for deeper strategic thinking
  1432→
  1433→  // Determine current game phase
  1434→  getGamePhase() {
  1435→    const totalPieces = this.countTotalPieces();
  1436→    const totalMoves = this.moveHistory.length;
  1437→    
  1438→    if (totalMoves < 20 && totalPieces > 28) {
  1439→      return 'opening';
  1440→    } else if (totalPieces > 14) {
  1441→      return 'middlegame';
  1442→    } else {
  1443→      return 'endgame';
  1444→    }
  1445→  }
  1446→
  1447→  // Get phase-specific evaluation multipliers
  1448→  getPhaseMultiplier(phase) {
  1449→    switch (phase) {
  1450→      case 'opening': return 1.2; // Emphasize development
  1451→      case 'middlegame': return 1.0; // Balanced evaluation
  1452→      case 'endgame': return 0.8; // Focus on king activity and pawns
  1453→      default: return 1.0;
  1454→    }
  1455→  }
  1456→
  1457→  // Count total pieces on board
  1458→  countTotalPieces() {
  1459→    let count = 0;
  1460→    for (let row = 0; row < 8; row++) {
  1461→      for (let col = 0; col < 8; col++) {
  1462→        if (this.board[row][col]) count++;
  1463→      }
  1464→    }
  1465→    return count;
  1466→  }
  1467→
  1468→  // Evaluate tactical threats (checks, pins, forks, etc.)
  1469→  evaluateTacticalThreats(move, botColor, opponentColor) {
  1470→    let score = 0;
  1471→
  1472→    // Check bonus (very high priority)
  1473→    if (this.isPlayerInCheck(opponentColor)) {
  1474→      score += 50;
  1475→      debugLogger.debug('BOT', 'Check bonus: +50');
  1476→      
  1477→      // Extra bonus for checkmate
  1478→      if (this.isCheckmate(opponentColor)) {
  1479→        score += 1000;
  1480→        debugLogger.debug('BOT', 'Checkmate bonus: +1000');
  1481→      }
  1482→    }
  1483→
  1484→    // Fork detection - piece attacking multiple valuable targets
  1485→    const forkTargets = this.detectForkTargets(move.to.row, move.to.col, move.piece, opponentColor);
  1486→    if (forkTargets.length > 1) {
  1487→      const forkValue = forkTargets.reduce((sum, target) => sum + this.getPieceValue(target), 0);
  1488→      score += forkValue * 8;
  1489→      debugLogger.debug('BOT', `Fork bonus: +${forkValue * 8} (${forkTargets.length} targets)`);
  1490→    }
  1491→
  1492→    // Pin detection - piece pinning opponent piece to valuable target
  1493→    if (this.createsPinAfterMove(move, botColor, opponentColor)) {
  1494→      score += 25;
  1495→      debugLogger.debug('BOT', 'Pin bonus: +25');
  1496→    }
  1497→
  1498→    return score;
  1499→  }
  1500→
  1501→  // Evaluate strategic positioning based on game phase
  1502→  evaluateStrategicPositioning(move, gamePhase, botColor) {
  1503→    let score = 0;
  1504→
  1505→    switch (gamePhase) {
  1506→      case 'opening':
  1507→        // Prioritize development and center control
  1508→        score += this.getCenterControlBonus(move.to.row, move.to.col) * 1.5;
  1509→        score += this.getDevelopmentBonus(move);
  1510→        
  1511→        // Bonus for castling preparation
  1512→        if (move.piece.type === 'king' && Math.abs(move.to.col - move.from.col) === 2) {
  1513→          score += 30; // Castling bonus
  1514→        }
  1515→        break;
  1516→
  1517→      case 'middlegame':
  1518→        // Focus on piece activity and tactical opportunities
  1519→        score += this.getMobilityBonus(move, botColor) * 2;
  1520→        score += this.getPositionalBonus(move);
  1521→        
  1522→        // Piece coordination bonus
  1523→        score += this.evaluatePieceActivity(move.to.row, move.to.col, move.piece, botColor);
  1524→        break;
  1525→
  1526→      case 'endgame':
  1527→        // King activity and pawn promotion
  1528→        if (move.piece.type === 'king') {
  1529→          score += this.getKingActivityBonus(move.to.row, move.to.col, botColor) * 2;
  1530→        }
  1531→        
  1532→        if (move.piece.type === 'pawn') {
  1533→          const promotionDistance = botColor === 'white' ? move.to.row : (7 - move.to.row);
  1534→          score += (7 - promotionDistance) * 5; // Closer to promotion = higher bonus
  1535→        }
  1536→        break;
  1537→    }
  1538→
  1539→    return score;
  1540→  }
  1541→
  1542→  // Enhanced king safety evaluation
  1543→  evaluateKingSafety(move, botColor, opponentColor, gamePhase) {
  1544→    let score = 0;
  1545→
  1546→    // Find king positions
  1547→    const myKing = this.findKing(botColor);
  1548→    const opponentKing = this.findKing(opponentColor);
  1549→
  1550→    if (!myKing || !opponentKing) return 0;
  1551→
  1552→    // In opening/middlegame, prioritize king safety
  1553→    if (gamePhase !== 'endgame') {
  1554→      // Bonus for maintaining castling rights
  1555→      const castlingKey = botColor;
  1556→      if (this.castlingRights[castlingKey].kingside || this.castlingRights[castlingKey].queenside) {
  1557→        score += 15;
  1558→      }
  1559→
  1560→      // Penalty for exposing king
  1561→      if (move.piece.type === 'king' && this.isSquareAttacked(move.to.row, move.to.col, opponentColor)) {
  1562→        score -= 30;
  1563→      }
  1564→    } else {
  1565→      // In endgame, active king is good
  1566→      if (move.piece.type === 'king') {
  1567→        score += this.getKingActivityBonus(move.to.row, move.to.col, botColor);
  1568→      }
  1569→    }
  1570→
  1571→    return score;
  1572→  }
  1573→
  1574→  // Evaluate piece coordination and support
  1575→  evaluatePieceCoordination(move, botColor) {
  1576→    let score = 0;
  1577→
  1578→    // Check if move supports other pieces
  1579→    const supportedPieces = this.countSupportedPieces(move.to.row, move.to.col, botColor);
  1580→    score += supportedPieces * 3;
  1581→
  1582→    // Check if move is supported by other pieces
  1583→    if (this.isPieceDefended(move.to.row, move.to.col, botColor)) {
  1584→      score += 5;
  1585→    }
  1586→
  1587→    return score;
  1588→  }
  1589→
  1590→  // Helper methods for enhanced AI evaluation
  1591→
  1592→  detectForkTargets(row, col, piece, opponentColor) {
  1593→    const targets = [];
  1594→    const moves = this.getPossibleMovesForPieceAt(row, col, piece);
  1595→    
  1596→    for (const moveTarget of moves) {
  1597→      const targetPiece = this.board[moveTarget.row][moveTarget.col];
  1598→      if (targetPiece && targetPiece.color === opponentColor && this.getPieceValue(targetPiece) >= 3) {
  1599→        targets.push(targetPiece);
  1600→      }
  1601→    }
  1602→    
  1603→    return targets;
  1604→  }
  1605→
  1606→  createsPinAfterMove(move, botColor, opponentColor) {
  1607→    // Simplified pin detection - check if move creates a line attack through opponent piece to valuable target
  1608→    const directions = this.getPieceAttackDirections(move.piece);
  1609→    
  1610→    for (const [dr, dc] of directions) {
  1611→      let r = move.to.row + dr;
  1612→      let c = move.to.col + dc;
  1613→      let foundOpponentPiece = null;
  1614→      
  1615→      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
  1616→        const piece = this.board[r][c];
  1617→        if (piece) {
  1618→          if (piece.color === opponentColor && !foundOpponentPiece) {
  1619→            foundOpponentPiece = piece;
  1620→          } else if (piece.color === opponentColor && foundOpponentPiece && this.getPieceValue(piece) > this.getPieceValue(foundOpponentPiece)) {
  1621→            return true; // Pin detected
  1622→          } else {
  1623→            break;
  1624→          }
  1625→        }
  1626→        r += dr;
  1627→        c += dc;
  1628→      }
  1629→    }
  1630→    
  1631→    return false;
  1632→  }
  1633→
  1634→  evaluatePieceActivity(row, col, piece, color) {
  1635→    // Count squares the piece can influence from this position
  1636→    const moves = this.getPossibleMovesForPieceAt(row, col, piece);
  1637→    return moves.length * 2; // Mobility bonus
  1638→  }
  1639→
  1640→  getKingActivityBonus(row, col, color) {
  1641→    // In endgame, centralized king is better
  1642→    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
  1643→    return Math.max(0, 10 - centerDistance * 2);
  1644→  }
  1645→
  1646→  findKing(color) {
  1647→    for (let row = 0; row < 8; row++) {
  1648→      for (let col = 0; col < 8; col++) {
  1649→        const piece = this.board[row][col];
  1650→        if (piece && piece.type === 'king' && piece.color === color) {
  1651→          return { row, col };
  1652→        }
  1653→      }
  1654→    }
  1655→    return null;
  1656→  }
  1657→
  1658→  countSupportedPieces(row, col, color) {
  1659→    let count = 0;
  1660→    const moves = this.getPossibleMovesForPieceAt(row, col, this.board[row][col]);
  1661→    
  1662→    for (const move of moves) {
  1663→      const piece = this.board[move.row][move.col];
  1664→      if (piece && piece.color === color) {
  1665→        count++;
  1666→      }
  1667→    }
  1668→    
  1669→    return count;
  1670→  }
  1671→
  1672→  getPieceAttackDirections(piece) {
  1673→    switch (piece.type) {
  1674→      case 'rook': return [[0,1], [0,-1], [1,0], [-1,0]];
  1675→      case 'bishop': return [[1,1], [1,-1], [-1,1], [-1,-1]];
  1676→      case 'queen': return [[0,1], [0,-1], [1,0], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]];
  1677→      default: return [];
  1678→    }
  1679→  }
  1680→
  1681→  getPossibleMovesForPieceAt(row, col, piece) {
  1682→    // Temporarily place piece and get moves
  1683→    const originalPiece = this.board[row][col];
  1684→    this.board[row][col] = piece;
  1685→    const moves = this.getPossibleMoves(row, col);
  1686→    this.board[row][col] = originalPiece;
  1687→    return moves;
  1688→  }
  1689→
  1690→  // Placeholder methods for additional evaluation factors
  1691→  evaluatePawnStructure(move, botColor) {
  1692→    // Basic pawn structure evaluation
  1693→    if (move.piece.type === 'pawn') {
  1694→      return this.getPositionalBonus(move) * 0.5;
  1695→    }
  1696→    return 0;
  1697→  }
  1698→
  1699→  evaluateDefensiveValue(move, botColor, opponentColor) {
  1700→    // Check if move defends against immediate threats
  1701→    let score = 0;
  1702→    
  1703→    // Simple defensive bonus for blocking checks or defending valuable pieces
  1704→    if (this.blocksCheck(move, botColor)) {
  1705→      score += 20;
  1706→    }
  1707→    
  1708→    return score;
  1709→  }
  1710→
  1711→  evaluateAdvancedPositional(move, botColor, gamePhase) {
  1712→    // Advanced positional factors like outposts, weak squares, etc.
  1713→    return this.getPositionalBonus(move) * (gamePhase === 'middlegame' ? 1.2 : 1.0);
  1714→  }
  1715→
  1716→  blocksCheck(move, color) {
  1717→    // Check if this move blocks a check against our king
  1718→    const king = this.findKing(color);
  1719→    if (!king) return false;
  1720→    
  1721→    // Simulate move and see if it removes check
  1722→    const originalPiece = this.board[move.to.row][move.to.col];
  1723→    this.board[move.to.row][move.to.col] = move.piece;
  1724→    this.board[move.from.row][move.from.col] = null;
  1725→    
  1726→    const blocksCheck = !this.isPlayerInCheck(color);
  1727→    
  1728→    // Restore board
  1729→    this.board[move.from.row][move.from.col] = move.piece;
  1730→    this.board[move.to.row][move.to.col] = originalPiece;
  1731→    
  1732→    return blocksCheck;
  1733→  }
  1734→
  1735→  // Calculate a simple hash of the current board state for move history validation
  1736→  calculateBoardStateHash() {
  1737→    let hash = '';
  1738→    for (let row = 0; row < 8; row++) {
  1739→      for (let col = 0; col < 8; col++) {
  1740→        const piece = this.board[row][col];
  1741→        if (piece) {
  1742→          hash += `${piece.type[0]}${piece.color[0]}${row}${col}`;
  1743→        }
  1744→      }
  1745→    }
  1746→    hash += this.currentPlayer[0];
  1747→    hash += this.enPassantTarget ? `ep${this.enPassantTarget.row}${this.enPassantTarget.col}` : '';
  1748→    return hash;
  1749→  }
  1750→
  1751→  // Execute bot move with natural thinking patterns
  1752→  async executeBotMove() {
  1753→    if (this.gameMode !== 'human-vs-bot' || !this.isBotTurn() || this.gameStatus !== 'playing') {
  1754→      return false;
  1755→    }
  1756→
  1757→    const startTime = Date.now();
  1758→    
  1759→    // Generate bot move with timing
  1760→    const botMove = this.generateBotMove();
  1761→    if (!botMove) {
  1762→      debugLogger.error('BOT', 'Failed to generate bot move');
  1763→      return false;
  1764→    }
  1765→
  1766→    const thinkingTime = Date.now() - startTime;
  1767→    debugLogger.info('BOT', `Bot thinking completed in ${thinkingTime}ms`);
  1768→
  1769→    // Natural delay based on move complexity and game phase
  1770→    const baseDelay = this.calculateBotDelay(botMove);
  1771→    const naturalDelay = baseDelay + (Math.random() * 800); // Add randomness
  1772→    
  1773→    // Ensure minimum thinking time for realism
  1774→    const remainingDelay = Math.max(200, naturalDelay - thinkingTime);
  1775→    
  1776→    debugLogger.info('BOT', `Bot will move in ${remainingDelay}ms`, {
  1777→      baseDelay,
  1778→      naturalDelay: Math.round(naturalDelay),
  1779→      thinkingTime,
  1780→      finalDelay: Math.round(remainingDelay)
  1781→    });
  1782→
  1783→    await new Promise(resolve => setTimeout(resolve, remainingDelay));
  1784→
  1785→    debugLogger.info('BOT', 'Executing strategic bot move', {
  1786→      piece: botMove.piece.type,
  1787→      from: botMove.from,
  1788→      to: botMove.to,
  1789→      score: botMove.score
  1790→    });
  1791→
  1792→    // Ensure this is not treated as an undo/redo action
  1793→    const wasUndoRedoAction = this.isUndoRedoAction;
  1794→    this.isUndoRedoAction = false;
  1795→
  1796→    // Execute the move
  1797→    const success = this.makeMove(
  1798→      botMove.from.row,
  1799→      botMove.from.col,
  1800→      botMove.to.row,
  1801→      botMove.to.col
  1802→    );
  1803→
  1804→    // Restore the original flag state
  1805→    this.isUndoRedoAction = wasUndoRedoAction;
  1806→
  1807→    if (success) {
  1808→      debugLogger.info('BOT', 'Strategic bot move executed and recorded successfully', {
  1809→        moveHistoryLength: this.moveHistory.length,
  1810→        currentMoveIndex: this.currentMoveIndex
  1811→      });
  1812→    } else {
  1813→      debugLogger.error('BOT', 'Bot move execution failed');
  1814→    }
  1815→
  1816→    return success;
  1817→  }
  1818→
  1819→  // R1-Optimized Bot Delay (Battery Efficient)
  1820→  calculateBotDelay(move) {
  1821→    // R1 Constraint: Keep delays short for battery efficiency and responsiveness
  1822→    let baseDelay = 400; // Much shorter base delay for R1
  1823→    
  1824→    // Small variations for natural feel
  1825→    if (move.capturedPiece) {
  1826→      baseDelay += 200; // Captures still take a bit longer
  1827→    }
  1828→    
  1829→    if (move.score > 60) {
  1830→      baseDelay += 150; // Good moves get slight extra delay
  1831→    }
  1832→    
  1833→    // Add small random variation (100-200ms)
  1834→    baseDelay += Math.random() * 100 + 100;
  1835→    
  1836→    // R1 Performance: Cap at 800ms maximum (vs previous 2.5s)
  1837→    return Math.min(Math.round(baseDelay), 800);
  1838→  }
  1839→
  1840→  // Count total pieces on board
  1841→  countPieces() {
  1842→    let count = 0;
  1843→    for (let row = 0; row < 8; row++) {
  1844→      for (let col = 0; col < 8; col++) {
  1845→        if (this.board[row][col]) count++;
  1846→      }
  1847→    }
  1848→    return count;
  1849→  }
  1850→
  1851→  getGameState() {
  1852→    debugLogger.debug('SERIALIZATION', 'Creating comprehensive game state for serialization');
  1853→    
  1854→    // Create deep copies to avoid reference issues
  1855→    const deepCopyBoard = this.board.map(row => 
  1856→      row.map(piece => piece ? { 
  1857→        type: piece.type, 
  1858→        color: piece.color,
  1859→        hasMoved: piece.hasMoved || false 
  1860→      } : null)
  1861→    );
  1862→    
  1863→    const deepCopyMoveHistory = this.moveHistory.map((move, index) => ({
  1864→      from: { row: move.from.row, col: move.from.col },
  1865→      to: { row: move.to.row, col: move.to.col },
  1866→      piece: { 
  1867→        type: move.piece.type, 
  1868→        color: move.piece.color,
  1869→        hasMoved: move.piece.hasMoved || false
  1870→      },
  1871→      captured: move.captured ? { 
  1872→        type: move.captured.type, 
  1873→        color: move.captured.color,
  1874→        hasMoved: move.captured.hasMoved || false
  1875→      } : null,
  1876→      special: move.special || null,
  1877→      notation: move.notation || '',
  1878→      commentary: move.commentary || '',
  1879→      moveNumber: move.moveNumber || Math.ceil((index + 1) / 2),
  1880→      player: move.player || move.piece.color,
  1881→      timestamp: move.timestamp || new Date().toISOString(),
  1882→      moveIndex: index
  1883→    }));
  1884→    
  1885→    const deepCopyCastlingRights = {
  1886→      white: { 
  1887→        kingside: Boolean(this.castlingRights.white.kingside), 
  1888→        queenside: Boolean(this.castlingRights.white.queenside) 
  1889→      },
  1890→      black: { 
  1891→        kingside: Boolean(this.castlingRights.black.kingside), 
  1892→        queenside: Boolean(this.castlingRights.black.queenside) 
  1893→      }
  1894→    };
  1895→    
  1896→    // Calculate comprehensive state metadata
  1897→    const currentMoveIdx = this.getCurrentMoveIndex();
  1898→    const gameState = {
  1899→      // Core game state
  1900→      board: deepCopyBoard,
  1901→      currentPlayer: this.currentPlayer,
  1902→      gameStatus: this.gameStatus,
  1903→      moveHistory: deepCopyMoveHistory,
  1904→      currentMoveIndex: this.currentMoveIndex,
  1905→      enPassantTarget: this.enPassantTarget ? { 
  1906→        row: this.enPassantTarget.row, 
  1907→        col: this.enPassantTarget.col 
  1908→      } : null,
  1909→      castlingRights: deepCopyCastlingRights,
  1910→      
  1911→      // UI preferences
  1912→      soundEnabled: Boolean(this.soundEnabled),
  1913→      allowUndo: Boolean(this.allowUndo),
  1914→      theme: this.theme || 'classic',
  1915→      
  1916→      // Game mode settings
  1917→      gameMode: this.gameMode || 'human-vs-bot',
  1918→      humanColor: this.humanColor || 'white',
  1919→      boardFlipped: Boolean(this.boardFlipped),
  1920→      
  1921→      // State metadata for validation
  1922→      totalMoves: this.moveHistory.length,
  1923→      currentMoveNumber: currentMoveIdx >= 0 ? Math.ceil((currentMoveIdx + 1) / 2) : 0,
  1924→      
  1925→      // Serialization metadata
  1926→      serializationVersion: '2.0',
  1927→      serializationTimestamp: new Date().toISOString(),
  1928→      
  1929→      // State validation checksums
  1930→      boardChecksum: this.calculateBoardChecksum(deepCopyBoard),
  1931→      moveHistoryChecksum: this.calculateMoveHistoryChecksum(deepCopyMoveHistory),
  1932→      
  1933→      // Additional state information
  1934→      gameStartTime: this.gameStartTime || new Date().toISOString(),
  1935→      lastMoveTime: deepCopyMoveHistory.length > 0 ? 
  1936→        deepCopyMoveHistory[deepCopyMoveHistory.length - 1].timestamp : null,
  1937→      
  1938→      // State integrity markers
  1939→      stateValid: this.validateGameState(),
  1940→      selectedSquare: null // Always null in saved state
  1941→    };
  1942→    
  1943→    debugLogger.debug('SERIALIZATION', 'Game state serialization complete', {
  1944→      boardChecksum: gameState.boardChecksum,
  1945→      moveHistoryChecksum: gameState.moveHistoryChecksum,
  1946→      totalMoves: gameState.totalMoves,
  1947→      currentMoveNumber: gameState.currentMoveNumber,
  1948→      serializationVersion: gameState.serializationVersion,
  1949→      stateValid: gameState.stateValid
  1950→    });
  1951→    
  1952→    return gameState;
  1953→  }
  1954→  
  1955→  // Calculate checksum for board state
  1956→  calculateBoardChecksum(board) {
  1957→    const boardString = JSON.stringify(board, (key, val) => {
  1958→      if (val === null) return 'null';
  1959→      if (typeof val === 'object') return `${val.type}-${val.color}-${val.hasMoved}`;
  1960→      return val;
  1961→    });
  1962→    return calculateChecksum(boardString);
  1963→  }
  1964→  
  1965→  // Calculate checksum for move history
  1966→  calculateMoveHistoryChecksum(moveHistory) {
  1967→    const historyString = JSON.stringify(moveHistory, (key, val) => {
  1968→      if (key === 'timestamp') return 'timestamp'; // Normalize timestamps
  1969→      return val;
  1970→    });
  1971→    return calculateChecksum(historyString);
  1972→  }
  1973→
  1974→  loadGameState(state) {
  1975→    debugLogger.info('GAME', 'Loading enhanced game state into ChessGame instance', {
  1976→      totalMoves: state.totalMoves || state.moveHistory?.length || 0,
  1977→      currentMoveNumber: state.currentMoveNumber || 0,
  1978→      currentPlayer: state.currentPlayer,
  1979→      gameStatus: state.gameStatus,
  1980→      serializationVersion: state.serializationVersion || 'legacy',
  1981→      hasChecksums: !!(state.boardChecksum && state.moveHistoryChecksum)
  1982→    });
  1983→    
  1984→    // Store original state for consistency validation
  1985→    const originalStateForValidation = JSON.parse(JSON.stringify(state));
  1986→    
  1987→    // Create deep copies to avoid reference issues
  1988→    this.board = state.board.map(row => 
  1989→      row.map(piece => piece ? { 
  1990→        type: piece.type,
  1991→        color: piece.color,
  1992→        hasMoved: piece.hasMoved !== undefined ? piece.hasMoved : false
  1993→      } : null)
  1994→    );
  1995→    
  1996→    this.currentPlayer = state.currentPlayer;
  1997→    this.gameStatus = state.gameStatus || 'playing';
  1998→    
  1999→    // Restore move history with enhanced validation
  2000→    this.moveHistory = (state.moveHistory || []).map((move, index) => ({
  2001→      from: { row: move.from.row, col: move.from.col },
  2002→      to: { row: move.to.row, col: move.to.col },
  2003→      piece: { 
  2004→        type: move.piece.type,
  2005→        color: move.piece.color,
  2006→        hasMoved: move.piece.hasMoved !== undefined ? move.piece.hasMoved : false
  2007→      },
  2008→      captured: move.captured ? { 
  2009→        type: move.captured.type,
  2010→        color: move.captured.color,
  2011→        hasMoved: move.captured.hasMoved !== undefined ? move.captured.hasMoved : false
  2012→      } : null,
  2013→      special: move.special || null,
  2014→      notation: move.notation || '',
  2015→      commentary: move.commentary || '',
  2016→      moveNumber: move.moveNumber || Math.ceil((index + 1) / 2),
  2017→      player: move.player || move.piece.color,
  2018→      timestamp: move.timestamp || new Date().toISOString(),
  2019→      moveIndex: move.moveIndex !== undefined ? move.moveIndex : index
  2020→    }));
  2021→    
  2022→    this.currentMoveIndex = state.currentMoveIndex;
  2023→    this.enPassantTarget = state.enPassantTarget ? { 
  2024→      row: state.enPassantTarget.row, 
  2025→      col: state.enPassantTarget.col 
  2026→    } : null;
  2027→    
  2028→    // Restore castling rights with proper structure
  2029→    this.castlingRights = state.castlingRights ? {
  2030→      white: { 
  2031→        kingside: Boolean(state.castlingRights.white.kingside), 
  2032→        queenside: Boolean(state.castlingRights.white.queenside) 
  2033→      },
  2034→      black: { 
  2035→        kingside: Boolean(state.castlingRights.black.kingside), 
  2036→        queenside: Boolean(state.castlingRights.black.queenside) 
  2037→      }
  2038→    } : {
  2039→      white: { kingside: true, queenside: true },
  2040→      black: { kingside: true, queenside: true }
  2041→    };
  2042→    
  2043→    // Restore additional state information
  2044→    this.theme = state.theme || 'classic';
  2045→    this.soundEnabled = state.soundEnabled !== undefined ? Boolean(state.soundEnabled) : true;
  2046→    this.allowUndo = state.allowUndo !== undefined ? Boolean(state.allowUndo) : true;
  2047→    this.gameStartTime = state.gameStartTime || new Date().toISOString();
  2048→    this.selectedSquare = null; // Always null when loading
  2049→    
  2050→    // Restore game mode settings
  2051→    this.gameMode = state.gameMode || 'human-vs-bot';
  2052→    this.humanColor = state.humanColor || 'white';
  2053→    this.boardFlipped = state.boardFlipped !== undefined ? Boolean(state.boardFlipped) : false;
  2054→    this.isUndoRedoAction = false; // Always reset this flag when loading
  2055→    
  2056→    // Validate checksums if available
  2057→    if (state.boardChecksum && state.moveHistoryChecksum) {
  2058→      const currentBoardChecksum = this.calculateBoardChecksum(this.board);
  2059→      const currentHistoryChecksum = this.calculateMoveHistoryChecksum(this.moveHistory);
  2060→      
  2061→      if (currentBoardChecksum !== state.boardChecksum) {
  2062→        debugLogger.error('GAME', 'Board checksum mismatch after loading', {
  2063→          expected: state.boardChecksum,
  2064→          actual: currentBoardChecksum
  2065→        });
  2066→      } else {
  2067→        debugLogger.debug('GAME', 'Board checksum validation passed');
  2068→      }
  2069→      
  2070→      if (currentHistoryChecksum !== state.moveHistoryChecksum) {
  2071→        debugLogger.error('GAME', 'Move history checksum mismatch after loading', {
  2072→          expected: state.moveHistoryChecksum,
  2073→          actual: currentHistoryChecksum
  2074→        });
  2075→      } else {
  2076→        debugLogger.debug('GAME', 'Move history checksum validation passed');
  2077→      }
  2078→    }
  2079→    
  2080→    debugLogger.info('GAME', 'Game state loaded successfully', {
  2081→      restoredMoves: this.moveHistory.length,
  2082→      currentMoveIndex: this.currentMoveIndex,
  2083→      currentPlayer: this.currentPlayer,
  2084→      gameStatus: this.gameStatus,
  2085→      gameStartTime: this.gameStartTime,
  2086→      serializationVersion: state.serializationVersion || 'legacy'
  2087→    });
  2088→    
  2089→    // Validate the loaded state
  2090→    if (!this.validateGameState()) {
  2091→      debugLogger.error('GAME', 'Loaded game state failed validation - may have integrity issues');
  2092→    } else {
  2093→      debugLogger.info('GAME', 'Loaded game state passed validation');
  2094→    }
  2095→    
  2096→    // Perform consistency validation if we have enhanced format
  2097→    if (state.serializationVersion) {
  2098→      const currentState = this.getGameState();
  2099→      if (!this.validateStateConsistency(originalStateForValidation, currentState)) {
  2100→        debugLogger.error('GAME', 'State consistency validation failed after loading');
  2101→      } else {
  2102→        debugLogger.info('GAME', 'State consistency validation passed');
  2103→      }
  2104→    }
  2105→  }
  2106→
  2107→  async autoSave() {
  2108→    // Automatically save game state after each move
  2109→    debugLogger.debug('SAVE', 'Auto-save triggered');
  2110→    
  2111→    // Validate current game state before saving
  2112→    if (!this.validateGameState()) {
  2113→      debugLogger.error('SAVE', 'Auto-save aborted: game state validation failed');
  2114→      return false;
  2115→    }
  2116→    
  2117→    try {
  2118→      const gameState = this.getGameState();
  2119→      
  2120→      debugLogger.debug('SAVE', 'Game state prepared for saving', {
  2121→        currentPlayer: gameState.currentPlayer,
  2122→        gameStatus: gameState.gameStatus,
  2123→        moveCount: gameState.moveHistory.length,
  2124→        soundEnabled: gameState.soundEnabled,
  2125→        allowUndo: gameState.allowUndo
  2126→      });
  2127→      
  2128→      // Validate game state before saving
  2129→      if (!gameState || typeof gameState !== 'object') {
  2130→        debugLogger.error('SAVE', 'Auto-save failed: invalid game state');
  2131→        console.error('Auto-save failed: invalid game state');
  2132→        return false;
  2133→      }
  2134→      
  2135→      // Use separate storage keys for each game mode
  2136→      const storageKey = this.getStorageKey();
  2137→      const success = await saveToStorage(storageKey, gameState);
  2138→      if (success) {
  2139→        debugLogger.info('SAVE', `Game auto-saved successfully to storage (${storageKey})`);
  2140→        console.log(`Game auto-saved successfully (${this.gameMode})`);
  2141→        return true;
  2142→      } else {
  2143→        debugLogger.error('SAVE', 'Auto-save failed: storage operation failed');
  2144→        console.error('Auto-save failed: storage operation failed');
  2145→        return false;
  2146→      }
  2147→    } catch (error) {
  2148→      debugLogger.error('SAVE', 'Auto-save failed with exception', error);
  2149→      console.error('Auto-save failed with exception:', error);
  2150→      return false;
  2151→    }
  2152→  }
  2153→
  2154→  canUndo() {
  2155→    return this.allowUndo && this.moveHistory.length > 0;
  2156→  }
  2157→
  2158→  canRedo() {
  2159→    return this.allowUndo && this.currentMoveIndex < this.moveHistory.length - 1;
  2160→  }
  2161→
  2162→  undoMove() {
  2163→    if (!this.canUndo()) return false;
  2164→
  2165→    if (this.currentMoveIndex === undefined) {
  2166→      this.currentMoveIndex = this.moveHistory.length - 1;
  2167→    }
  2168→
  2169→    if (this.currentMoveIndex < 0) return false;
  2170→
  2171→    // Set flag to prevent board flipping
  2172→    this.isUndoRedoAction = true;
  2173→
  2174→    const move = this.moveHistory[this.currentMoveIndex];
  2175→    
  2176→    // Restore the board state before this move
  2177→    this.board[move.from.row][move.from.col] = move.piece;
  2178→    this.board[move.to.row][move.to.col] = move.captured;
  2179→
  2180→    // Handle special move reversals
  2181→    if (move.special === 'enPassant') {
  2182→      const captureRow = move.piece.color === 'white' ? move.to.row + 1 : move.to.row - 1;
  2183→      this.board[captureRow][move.to.col] = move.captured;
  2184→      this.board[move.to.row][move.to.col] = null;
  2185→    }
  2186→
  2187→    if (move.special === 'kingside' || move.special === 'queenside') {
  2188→      const rookFromCol = move.special === 'kingside' ? move.to.col - 1 : move.to.col + 1;
  2189→      const rookToCol = move.special === 'kingside' ? 7 : 0;
  2190→      this.board[move.to.row][rookToCol] = this.board[move.to.row][rookFromCol];
  2191→      this.board[move.to.row][rookFromCol] = null;
  2192→    }
  2193→
  2194→    // Switch player back
  2195→    this.currentPlayer = move.piece.color;
  2196→    this.currentMoveIndex--;
  2197→    
  2198→    // Update game status
  2199→    this.updateGameStatus();
  2200→    
  2201→    // Set correct board perspective for the current player after undo
  2202→    this.setCorrectBoardPerspective();
  2203→    
  2204→    // Reset the flag after a short delay
  2205→    setTimeout(() => {
  2206→      this.isUndoRedoAction = false;
  2207→    }, 100);
  2208→    
  2209→    return true;
  2210→  }
  2211→
  2212→  redoMove() {
  2213→    if (!this.canRedo()) return false;
  2214→
  2215→    // Set flag to prevent board flipping
  2216→    this.isUndoRedoAction = true;
  2217→
  2218→    this.currentMoveIndex++;
  2219→    const move = this.moveHistory[this.currentMoveIndex];
  2220→    
  2221→    // Execute the move
  2222→    this.board[move.to.row][move.to.col] = move.piece;
  2223→    this.board[move.from.row][move.from.col] = null;
  2224→
  2225→    // Handle special moves
  2226→    if (move.special === 'enPassant') {
  2227→      const captureRow = move.piece.color === 'white' ? move.to.row + 1 : move.to.row - 1;
  2228→      this.board[captureRow][move.to.col] = null;
  2229→    }
  2230→
  2231→    if (move.special === 'kingside' || move.special === 'queenside') {
  2232→      const rookFromCol = move.special === 'kingside' ? 7 : 0;
  2233→      const rookToCol = move.special === 'kingside' ? move.to.col - 1 : move.to.col + 1;
  2234→      this.board[move.to.row][rookToCol] = this.board[move.to.row][rookFromCol];
  2235→      this.board[move.to.row][rookFromCol] = null;
  2236→    }
  2237→
  2238→    // Switch player
  2239→    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
  2240→    
  2241→    // Update game status
  2242→    this.updateGameStatus();
  2243→    
  2244→    // Set correct board perspective for the current player after redo
  2245→    this.setCorrectBoardPerspective();
  2246→    
  2247→    // Reset the flag after a short delay
  2248→    setTimeout(() => {
  2249→      this.isUndoRedoAction = false;
  2250→    }, 100);
  2251→    
  2252→    return true;
  2253→  }
  2254→
  2255→  getCurrentMoveIndex() {
  2256→    return this.currentMoveIndex !== undefined ? this.currentMoveIndex : this.moveHistory.length - 1;
  2257→  }
  2258→
  2259→  // Validate current game state integrity with comprehensive consistency checks
  2260→  validateGameState() {
  2261→    debugLogger.debug('VALIDATION', 'Running comprehensive game state validation');
  2262→    
  2263→    const issues = [];
  2264→    const warnings = [];
  2265→    
  2266→    // Validate board structure
  2267→    if (!this.board || !Array.isArray(this.board) || this.board.length !== 8) {
  2268→      issues.push('Invalid board structure');
  2269→    } else {
  2270→      for (let i = 0; i < 8; i++) {
  2271→        if (!Array.isArray(this.board[i]) || this.board[i].length !== 8) {
  2272→          issues.push(`Invalid board row ${i}`);
  2273→        }
  2274→      }
  2275→    }
  2276→    
  2277→    // Validate current player
  2278→    if (this.currentPlayer !== 'white' && this.currentPlayer !== 'black') {
  2279→      issues.push(`Invalid currentPlayer: ${this.currentPlayer}`);
  2280→    }
  2281→    
  2282→    // Validate move history
  2283→    if (!Array.isArray(this.moveHistory)) {
  2284→      issues.push('Invalid moveHistory structure');
  2285→    } else {
  2286→      // Check move history consistency
  2287→      for (let i = 0; i < this.moveHistory.length; i++) {
  2288→        const move = this.moveHistory[i];
  2289→        if (!move.from || !move.to || !move.piece) {
  2290→          issues.push(`Invalid move at index ${i}: missing required properties`);
  2291→        }
  2292→        if (typeof move.from.row !== 'number' || typeof move.from.col !== 'number' ||
  2293→            typeof move.to.row !== 'number' || typeof move.to.col !== 'number') {
  2294→          issues.push(`Invalid move at index ${i}: invalid coordinates`);
  2295→        }
  2296→        if (!move.piece.type || !move.piece.color) {
  2297→          issues.push(`Invalid move at index ${i}: invalid piece data`);
  2298→        }
  2299→      }
  2300→      
  2301→      // Validate move count consistency
  2302→      const expectedPlayerTurn = this.moveHistory.length % 2 === 0 ? 'white' : 'black';
  2303→      if (this.currentMoveIndex === undefined || this.currentMoveIndex === this.moveHistory.length - 1) {
  2304→        if (this.currentPlayer !== expectedPlayerTurn) {
  2305→          warnings.push(`Player turn inconsistency: expected ${expectedPlayerTurn}, got ${this.currentPlayer}`);
  2306→        }
  2307→      }
  2308→    }
  2309→    
  2310→    // Validate move index consistency
  2311→    if (this.currentMoveIndex !== undefined) {
  2312→      if (this.currentMoveIndex < -1 || this.currentMoveIndex >= this.moveHistory.length) {
  2313→        issues.push(`Invalid currentMoveIndex: ${this.currentMoveIndex} (history length: ${this.moveHistory.length})`);
  2314→      }
  2315→    }
  2316→    
  2317→    // Validate castling rights structure
  2318→    if (!this.castlingRights || 
  2319→        !this.castlingRights.white || 
  2320→        !this.castlingRights.black ||
  2321→        typeof this.castlingRights.white.kingside !== 'boolean' ||
  2322→        typeof this.castlingRights.white.queenside !== 'boolean' ||
  2323→        typeof this.castlingRights.black.kingside !== 'boolean' ||
  2324→        typeof this.castlingRights.black.queenside !== 'boolean') {
  2325→      issues.push('Invalid castlingRights structure');
  2326→    }
  2327→    
  2328→    // Validate en passant target
  2329→    if (this.enPassantTarget !== null && this.enPassantTarget !== undefined) {
  2330→      if (typeof this.enPassantTarget.row !== 'number' || typeof this.enPassantTarget.col !== 'number') {
  2331→        issues.push('Invalid enPassantTarget structure');
  2332→      }
  2333→    }
  2334→    
  2335→    // Validate game status
  2336→    const validStatuses = ['playing', 'checkmate', 'stalemate', 'draw'];
  2337→    if (!validStatuses.includes(this.gameStatus)) {
  2338→      issues.push(`Invalid gameStatus: ${this.gameStatus}`);
  2339→    }
  2340→    
  2341→    // Board consistency checks
  2342→    if (this.board && Array.isArray(this.board)) {
  2343→      let whiteKingCount = 0;
  2344→      let blackKingCount = 0;
  2345→      
  2346→      for (let row = 0; row < 8; row++) {
  2347→        for (let col = 0; col < 8; col++) {
  2348→          const piece = this.board[row][col];
  2349→          if (piece) {
  2350→            if (piece.type === 'king') {
  2351→              if (piece.color === 'white') whiteKingCount++;
  2352→              if (piece.color === 'black') blackKingCount++;
  2353→            }
  2354→            
  2355→            // Validate piece structure
  2356→            if (!piece.type || !piece.color || (piece.color !== 'white' && piece.color !== 'black')) {
  2357→              issues.push(`Invalid piece at ${row},${col}: ${JSON.stringify(piece)}`);
  2358→            }
  2359→          }
  2360→        }
  2361→      }
  2362→      
  2363→      if (whiteKingCount !== 1) {
  2364→        issues.push(`Invalid white king count: ${whiteKingCount} (expected 1)`);
  2365→      }
  2366→      if (blackKingCount !== 1) {
  2367→        issues.push(`Invalid black king count: ${blackKingCount} (expected 1)`);
  2368→      }
  2369→    }
  2370→    
  2371→    if (warnings.length > 0) {
  2372→      debugLogger.warn('VALIDATION', 'Game state validation warnings', { warnings });
  2373→    }
  2374→    
  2375→    if (issues.length > 0) {
  2376→      debugLogger.error('VALIDATION', 'Game state validation failed', { issues, warnings });
  2377→      return false;
  2378→    }
  2379→    
  2380→    debugLogger.debug('VALIDATION', 'Game state validation passed', { 
  2381→      warningCount: warnings.length,
  2382→      moveHistoryLength: this.moveHistory.length,
  2383→      currentMoveIndex: this.currentMoveIndex,
  2384→      currentPlayer: this.currentPlayer
  2385→    });
  2386→    return true;
  2387→  }
  2388→  
  2389→  // Additional method to validate state consistency between save and load
  2390→  validateStateConsistency(originalState, loadedState) {
  2391→    debugLogger.debug('VALIDATION', 'Validating state consistency between original and loaded data');
  2392→    
  2393→    const issues = [];
  2394→    
  2395→    // Check basic structure consistency
  2396→    if (originalState.moveHistory.length !== loadedState.moveHistory.length) {
  2397→      issues.push(`Move history length mismatch: original ${originalState.moveHistory.length}, loaded ${loadedState.moveHistory.length}`);
  2398→    }
  2399→    
  2400→    if (originalState.currentPlayer !== loadedState.currentPlayer) {
  2401→      issues.push(`Current player mismatch: original ${originalState.currentPlayer}, loaded ${loadedState.currentPlayer}`);
  2402→    }
  2403→    
  2404→    if (originalState.gameStatus !== loadedState.gameStatus) {
  2405→      issues.push(`Game status mismatch: original ${originalState.gameStatus}, loaded ${loadedState.gameStatus}`);
  2406→    }
  2407→    
  2408→    // Deep comparison of board state
  2409→    if (originalState.board && loadedState.board) {
  2410→      for (let row = 0; row < 8; row++) {
  2411→        for (let col = 0; col < 8; col++) {
  2412→          const orig = originalState.board[row][col];
  2413→          const loaded = loadedState.board[row][col];
  2414→          
  2415→          if ((orig === null) !== (loaded === null)) {
  2416→            issues.push(`Board mismatch at ${row},${col}: null state differs`);
  2417→          } else if (orig && loaded) {
  2418→            if (orig.type !== loaded.type || orig.color !== loaded.color) {
  2419→              issues.push(`Board mismatch at ${row},${col}: piece differs`);
  2420→            }
  2421→          }
  2422→        }
  2423→      }
  2424→    }
  2425→    
  2426→    if (issues.length > 0) {
  2427→      debugLogger.error('VALIDATION', 'State consistency validation failed', { issues });
  2428→      return false;
  2429→    }
  2430→    
  2431→    debugLogger.info('VALIDATION', 'State consistency validation passed');
  2432→    return true;
  2433→  }
  2434→  
  2435→  // Comprehensive save/load cycle test method
  2436→  async testSaveLoadCycle() {
  2437→    debugLogger.info('TEST', 'Starting comprehensive save/load cycle test');
  2438→    
  2439→    try {
  2440→      // Get current state before saving
  2441→      const originalState = this.getGameState();
  2442→      debugLogger.debug('TEST', 'Original state captured', {
  2443→        moveCount: originalState.totalMoves,
  2444→        currentPlayer: originalState.currentPlayer,
  2445→        boardChecksum: originalState.boardChecksum,
  2446→        moveHistoryChecksum: originalState.moveHistoryChecksum
  2447→      });
  2448→      
  2449→      // Perform save operation
  2450→      const saveSuccess = await this.autoSave();
  2451→      if (!saveSuccess) {
  2452→        debugLogger.error('TEST', 'Save operation failed during test');
  2453→        return false;
  2454→      }
  2455→      
  2456→      // Load the saved state
  2457→      const loadedState = await loadFromStorage('chess_game_state');
  2458→      if (!loadedState) {
  2459→        debugLogger.error('TEST', 'Load operation failed - no data returned');
  2460→        return false;
  2461→      }
  2462→      
  2463→      debugLogger.debug('TEST', 'State loaded successfully', {
  2464→        moveCount: loadedState.totalMoves || loadedState.moveHistory?.length || 0,
  2465→        currentPlayer: loadedState.currentPlayer,
  2466→        hasIntegrityData: !!(loadedState.boardChecksum && loadedState.moveHistoryChecksum)
  2467→      });
  2468→      
  2469→      // Validate consistency between original and loaded states
  2470→      const consistencyValid = this.validateStateConsistency(originalState, loadedState);
  2471→      if (!consistencyValid) {
  2472→        debugLogger.error('TEST', 'Save/load cycle test failed - state consistency check failed');
  2473→        return false;
  2474→      }
  2475→      
  2476→      // Create a temporary game instance to test loading
  2477→      const testGame = new ChessGame();
  2478→      testGame.loadGameState(loadedState);
  2479→      
  2480→      // Validate the test game state
  2481→      if (!testGame.validateGameState()) {
  2482→        debugLogger.error('TEST', 'Save/load cycle test failed - loaded game state validation failed');
  2483→        return false;
  2484→      }
  2485→      
  2486→      // Compare key metrics
  2487→      const testState = testGame.getGameState();
  2488→      const metricsMatch = (
  2489→        originalState.totalMoves === testState.totalMoves &&
  2490→        originalState.currentPlayer === testState.currentPlayer &&
  2491→        originalState.gameStatus === testState.gameStatus &&
  2492→        originalState.moveHistory.length === testState.moveHistory.length
  2493→      );
  2494→      
  2495→      if (!metricsMatch) {
  2496→        debugLogger.error('TEST', 'Save/load cycle test failed - key metrics mismatch', {
  2497→          original: {
  2498→            totalMoves: originalState.totalMoves,
  2499→            currentPlayer: originalState.currentPlayer,
  2500→            gameStatus: originalState.gameStatus,
  2501→            moveHistoryLength: originalState.moveHistory.length
  2502→          },
  2503→          loaded: {
  2504→            totalMoves: testState.totalMoves,
  2505→            currentPlayer: testState.currentPlayer,
  2506→            gameStatus: testState.gameStatus,
  2507→            moveHistoryLength: testState.moveHistory.length
  2508→          }
  2509→        });
  2510→        return false;
  2511→      }
  2512→      
  2513→      debugLogger.info('TEST', 'Save/load cycle test completed successfully', {
  2514→        originalStateValid: this.validateGameState(),
  2515→        loadedStateValid: testGame.validateGameState(),
  2516→        consistencyValid: consistencyValid,
  2517→        metricsMatch: metricsMatch,
  2518→        totalMoves: originalState.totalMoves,
  2519→        dataIntegrity: 'verified'
  2520→      });
  2521→      
  2522→      return true;
  2523→      
  2524→    } catch (error) {
  2525→      debugLogger.error('TEST', 'Save/load cycle test failed with exception', error);
  2526→      return false;
  2527→    }
  2528→  }
  2529→
  2530→  // Convert coordinates to chess notation (e.g., 0,0 -> a8, 7,7 -> h1)
  2531→  coordsToChessNotation(row, col) {
  2532→    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  2533→    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  2534→    return files[col] + ranks[row];
  2535→  }
  2536→
  2537→  // Generate chess notation for a move
  2538→  generateMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, isCheck, isCheckmate) {
  2539→    let notation = '';
  2540→    
  2541→    // Handle castling
  2542→    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
  2543→      return toCol > fromCol ? 'O-O' : 'O-O-O';
  2544→    }
  2545→    
  2546→    // Piece notation (except pawns)
  2547→    if (piece.type !== 'pawn') {
  2548→      notation += piece.type.charAt(0).toUpperCase();
  2549→      if (piece.type === 'knight') notation = 'N'; // Knight is N, not K
  2550→    }
  2551→    
  2552→    // For pawns, include file if capturing
  2553→    if (piece.type === 'pawn' && capturedPiece) {
  2554→      notation += this.coordsToChessNotation(fromRow, fromCol).charAt(0);
  2555→    }
  2556→    
  2557→    // Capture notation
  2558→    if (capturedPiece) {
  2559→      notation += 'x';
  2560→    }
  2561→    
  2562→    // Destination square
  2563→    notation += this.coordsToChessNotation(toRow, toCol);
  2564→    
  2565→    // Check and checkmate
  2566→    if (isCheckmate) {
  2567→      notation += '#';
  2568→    } else if (isCheck) {
  2569→      notation += '+';
  2570→    }
  2571→    
  2572→    return notation;
  2573→  }
  2574→
  2575→  // Generate human-readable move commentary
  2576→  generateMoveCommentary(fromRow, fromCol, toRow, toCol, piece, capturedPiece, special) {
  2577→    const pieceNames = {
  2578→      king: 'King',
  2579→      queen: 'Queen', 
  2580→      rook: 'Rook',
  2581→      bishop: 'Bishop',
  2582→      knight: 'Knight',
  2583→      pawn: 'Pawn'
  2584→    };
  2585→
  2586→    const fromSquare = this.coordsToChessNotation(fromRow, fromCol);
  2587→    const toSquare = this.coordsToChessNotation(toRow, toCol);
  2588→    
  2589→    let commentary = '';
  2590→    
  2591→    // Handle special moves
  2592→    if (special === 'kingside') {
  2593→      return 'Castles kingside';
  2594→    } else if (special === 'queenside') {
  2595→      return 'Castles queenside';
  2596→    } else if (special === 'enPassant') {
  2597→      return `Pawn takes pawn en passant on ${toSquare}`;
  2598→    }
  2599→    
  2600→    // Regular moves
  2601→    const pieceName = pieceNames[piece.type];
  2602→    
  2603→    if (capturedPiece) {
  2604→      const capturedPieceName = pieceNames[capturedPiece.type];
  2605→      commentary = `${pieceName} takes ${capturedPieceName} on ${toSquare}`;
  2606→    } else {
  2607→      commentary = `${pieceName} to ${toSquare}`;
  2608→    }
  2609→    
  2610→    return commentary;
  2611→  }
  2612→
  2613→  // Calculate material balance using traditional chess values
  2614→  calculateMaterialBalance() {
  2615→    const pieceValues = {
  2616→      pawn: 1,
  2617→      knight: 3,
  2618→      bishop: 3,
  2619→      rook: 5,
  2620→      queen: 9,
  2621→      king: 0 // King has no point value
  2622→    };
  2623→
  2624→    let whitePoints = 0;
  2625→    let blackPoints = 0;
  2626→
  2627→    for (let row = 0; row < 8; row++) {
  2628→      for (let col = 0; col < 8; col++) {
  2629→        const piece = this.board[row][col];
  2630→        if (piece) {
  2631→          const value = pieceValues[piece.type] || 0;
  2632→          if (piece.color === 'white') {
  2633→            whitePoints += value;
  2634→          } else {
  2635→            blackPoints += value;
  2636→          }
  2637→        }
  2638→      }
  2639→    }
  2640→
  2641→    return whitePoints - blackPoints; // Positive = white advantage, negative = black advantage
  2642→  }
  2643→}
  2644→
  2645→// Global game instance
  2646→let chessGame;
  2647→let gameUI;
  2648→
  2649→// ===========================================
  2650→// Chess Game UI
  2651→// ===========================================
  2652→
  2653→class ChessUI {
  2654→  constructor(game) {
  2655→    this.game = game;
  2656→    this.boardElement = document.getElementById('chess-board');
  2657→    this.currentPlayerElement = document.getElementById('current-player');
  2658→    this.gameStatusElement = document.getElementById('game-status');
  2659→    this.isFlipping = false; // Flag to prevent interactions during flip animation
  2660→    this.inputEnabled = true; // Flag to control user input during bot turns
  2661→    this.lastAlertTime = 0; // Prevent double alerts
  2662→    this.alertCooldown = 1000; // Minimum time between alerts (ms)
  2663→    
  2664→    this.initializeBoard();
  2665→    this.updateDisplay();
  2666→    
  2667→    // Check if it's bot's turn at startup (for human-vs-bot mode when human plays black)
  2668→    this.checkInitialBotTurn();
  2669→  }
  2670→
  2671→  initializeBoard() {
  2672→    this.boardElement.innerHTML = '';
  2673→    
  2674→    for (let row = 0; row < 8; row++) {
  2675→      for (let col = 0; col < 8; col++) {
  2676→        const square = document.createElement('div');
  2677→        square.className = 'chess-square';
  2678→        square.dataset.row = row;
  2679→        square.dataset.col = col;
  2680→        
  2681→        // Add alternating colors based on position
  2682→        const isLight = (row + col) % 2 === 0;
  2683→        square.classList.add(isLight ? 'light-square' : 'dark-square');
  2684→        
  2685→        // Enhanced touch support for R1 device
  2686→        square.addEventListener('click', (e) => this.handleSquareClick(e));
  2687→        square.addEventListener('touchstart', (e) => this.handleTouchStart(e));
  2688→        square.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  2689→        square.addEventListener('touchcancel', (e) => this.handleTouchCancel(e));
  2690→        
  2691→        this.boardElement.appendChild(square);
  2692→      }
  2693→    }
  2694→    
  2695→    this.applyTheme();
  2696→  }
  2697→
  2698→  handleSquareClick(event) {
  2699→    const row = parseInt(event.target.dataset.row);
  2700→    const col = parseInt(event.target.dataset.col);
  2701→    this.handleSquareSelection(row, col);
  2702→  }
  2703→
  2704→  handleTouchStart(event) {
  2705→    event.preventDefault();
  2706→    this.touchStartTime = Date.now();
  2707→    this.touchTarget = event.target;
  2708→    
  2709→    // Add visual feedback for touch
  2710→    event.target.style.opacity = '0.7';
  2711→  }
  2712→
  2713→  handleTouchEnd(event) {
  2714→    event.preventDefault();
  2715→    
  2716→    // Remove visual feedback
  2717→    if (this.touchTarget) {
  2718→      this.touchTarget.style.opacity = '';
  2719→    }
  2720→    
  2721→    // Only process if touch was quick (not a long press)
  2722→    if (this.touchStartTime && Date.now() - this.touchStartTime < 500) {
  2723→      // Get the square from the touch target
  2724→      let square = event.target;
  2725→      while (square && !square.dataset.row) {
  2726→        square = square.parentElement;
  2727→      }
  2728→      
  2729→      if (square && square.dataset.row !== undefined) {
  2730→        const row = parseInt(square.dataset.row);
  2731→        const col = parseInt(square.dataset.col);
  2732→        this.handleSquareSelection(row, col);
  2733→      }
  2734→    }
  2735→    
  2736→    this.touchStartTime = null;
  2737→    this.touchTarget = null;
  2738→  }
  2739→
  2740→  handleTouchCancel(event) {
  2741→    event.preventDefault();
  2742→    
  2743→    // Remove visual feedback
  2744→    if (this.touchTarget) {
  2745→      this.touchTarget.style.opacity = '';
  2746→    }
  2747→    
  2748→    this.touchStartTime = null;
  2749→    this.touchTarget = null;
  2750→  }
  2751→
  2752→  // Convert display coordinates to logical coordinates based on board flip
  2753→  getLogicalCoordinates(displayRow, displayCol) {
  2754→    if (this.game.shouldFlipBoard()) {
  2755→      return {
  2756→        row: 7 - displayRow,
  2757→        col: 7 - displayCol
  2758→      };
  2759→    }
  2760→    return { row: displayRow, col: displayCol };
  2761→  }
  2762→
  2763→  // Convert logical coordinates to display coordinates based on board flip
  2764→  getDisplayCoordinates(logicalRow, logicalCol) {
  2765→    if (this.game.shouldFlipBoard()) {
  2766→      return {
  2767→        row: 7 - logicalRow,
  2768→        col: 7 - logicalCol
  2769→      };
  2770→    }
  2771→    return { row: logicalRow, col: logicalCol };
  2772→  }
  2773→
  2774→  // Flip the board with animation
  2775→  flipBoard(callback) {
  2776→    if (this.isFlipping) return; // Prevent multiple simultaneous flips
  2777→    
  2778→    this.isFlipping = true;
  2779→    debugLogger.info('UI', 'Starting board flip animation');
  2780→    
  2781→    // Add flip animation class
  2782→    this.boardElement.style.transform = 'rotateY(90deg)';
  2783→    this.boardElement.style.transition = 'transform 0.3s ease-in-out';
  2784→    
  2785→    setTimeout(() => {
  2786→      // Update the board display at the midpoint of the animation
  2787→      this.game.boardFlipped = !this.game.boardFlipped;
  2788→      this.updateDisplay();
  2789→      
  2790→      // Complete the flip
  2791→      this.boardElement.style.transform = 'rotateY(0deg)';
  2792→      
  2793→      setTimeout(() => {
  2794→        this.boardElement.style.transition = '';
  2795→        this.isFlipping = false;
  2796→        debugLogger.info('UI', 'Board flip animation completed');
  2797→        
  2798→        if (callback) callback();
  2799→      }, 150);
  2800→    }, 150);
  2801→  }
  2802→
  2803→  // Update board perspective without animation (for undo/redo)
  2804→  updateBoardPerspective() {
  2805→    if (this.isFlipping) return; // Don't interfere with ongoing animation
  2806→    
  2807→    const currentFlipState = this.game.boardFlipped;
  2808→    const wasFlipped = this.boardElement.classList.contains('flipped');
  2809→    
  2810→    debugLogger.info('UI', 'Updating board perspective without animation', {
  2811→      currentFlipState: currentFlipState,
  2812→      wasFlipped: wasFlipped,
  2813→      gameMode: this.game.gameMode,
  2814→      currentPlayer: this.game.currentPlayer,
  2815→      isUndoRedo: this.game.isUndoRedoAction
  2816→    });
  2817→    
  2818→    // Update the board flip state immediately without animation
  2819→    if (currentFlipState && !wasFlipped) {
  2820→      this.boardElement.classList.add('flipped');
  2821→    } else if (!currentFlipState && wasFlipped) {
  2822→      this.boardElement.classList.remove('flipped');
  2823→    }
  2824→    
  2825→    // Update the display with the current flip state
  2826→    this.updateDisplay();
  2827→  }
  2828→
  2829→  // Handle bot turn in human-vs-bot mode
  2830→  // Enhanced bot move activation system for initial and subsequent turns
  2831→  async handleBotTurn() {
  2832→    const gameMode = this.game.gameMode;
  2833→    const isBotTurn = this.game.isBotTurn();
  2834→    const gameStatus = this.game.gameStatus;
  2835→    const currentPlayer = this.game.currentPlayer;
  2836→    const humanColor = this.game.getHumanColor();
  2837→
  2838→    debugLogger.info('BOT_ACTIVATION', 'Bot turn handler called', {
  2839→      gameMode,
  2840→      isBotTurn,
  2841→      gameStatus,
  2842→      currentPlayer,
  2843→      humanColor,
  2844→      moveHistoryLength: this.game.moveHistory.length
  2845→    });
  2846→
  2847→    // Validate bot turn conditions
  2848→    if (gameMode !== 'human-vs-bot') {
  2849→      debugLogger.warn('BOT_ACTIVATION', 'Not in vs Bot mode, exiting');
  2850→      return;
  2851→    }
  2852→
  2853→    if (!isBotTurn) {
  2854→      debugLogger.warn('BOT_ACTIVATION', 'Not bot\'s turn, exiting', {
  2855→        currentPlayer,
  2856→        humanColor,
  2857→        expectedBotColor: humanColor === 'white' ? 'black' : 'white'
  2858→      });
  2859→      return;
  2860→    }
  2861→
  2862→    // Check if game is over
  2863→    if (gameStatus !== 'playing') {
  2864→      debugLogger.info('BOT_ACTIVATION', 'Game over, cleaning up bot turn state');
  2865→      this.showBotThinking(false);
  2866→      this.setInputEnabled(false); // Keep disabled for game end
  2867→      return;
  2868→    }
  2869→
  2870→    // Determine if this is an initial bot move (first move of game)
  2871→    const isInitialBotMove = this.game.moveHistory.length === 0 && isBotTurn;
  2872→    const moveType = isInitialBotMove ? 'INITIAL' : 'SUBSEQUENT';
  2873→
  2874→    debugLogger.info('BOT_ACTIVATION', `Executing ${moveType} bot move`);
  2875→
  2876→    // Always ensure user input is disabled and thinking indicator is shown
  2877→    this.setInputEnabled(false);
  2878→    this.showBotThinking(true);
  2879→    
  2880→    // Update UI state to reflect bot's turn
  2881→    this.updateGameStateIndicators();
  2882→
  2883→    try {
  2884→      // Add slight delay for initial moves to allow UI to settle
  2885→      if (isInitialBotMove) {
  2886→        await new Promise(resolve => setTimeout(resolve, 500));
  2887→      }
  2888→
  2889→      // Execute bot move with enhanced error handling
  2890→      const success = await this.game.executeBotMove();
  2891→      
  2892→      if (success) {
  2893→        debugLogger.info('BOT_ACTIVATION', `${moveType} bot move completed successfully`);
  2894→        
  2895→        // Update display after bot move
  2896→        this.updateDisplay();
  2897→        
  2898→        // Play move sound if enabled
  2899→        if (this.game.soundEnabled && this.game.sounds && this.game.sounds.move) {
  2900→          try {
  2901→            // sounds.move is a function, not an Audio object
  2902→            this.game.sounds.move();
  2903→          } catch (error) {
  2904→            debugLogger.debug('BOT_ACTIVATION', 'Sound playback failed (non-critical)');
  2905→          }
  2906→        }
  2907→        
  2908→        // Hide thinking indicator and re-enable input only after successful move
  2909→        this.showBotThinking(false);
  2910→        
  2911→        // Check if game ended after bot move
  2912→        if (this.game.gameStatus !== 'playing') {
  2913→          debugLogger.info('BOT_ACTIVATION', 'Game ended after bot move');
  2914→          this.setInputEnabled(false); // Keep disabled for game end
  2915→          this.handleGameEnd();
  2916→        } else {
  2917→          // Game continues - enable input for human's turn
  2918→          this.setInputEnabled(true);
  2919→          debugLogger.info('BOT_ACTIVATION', 'Bot move complete, human\'s turn now');
  2920→        }
  2921→        
  2922→      } else {
  2923→        debugLogger.error('BOT_ACTIVATION', `${moveType} bot move failed - no valid moves found`);
  2924→        
  2925→        // Hide thinking indicator and show error
  2926→        this.showBotThinking(false);
  2927→        this.showInstructionLabel('Bot move failed - your turn');
  2928→        this.setInputEnabled(true);
  2929→        
  2930→        setTimeout(() => {
  2931→          this.hideInstructionLabel();
  2932→        }, 3000);
  2933→      }
  2934→    } catch (error) {
  2935→      debugLogger.error('BOT_ACTIVATION', `Error during ${moveType} bot turn`, error);
  2936→      
  2937→      // Hide thinking indicator and re-enable input on error
  2938→      this.showBotThinking(false);
  2939→      this.setInputEnabled(true);
  2940→      this.showInstructionLabel('Bot error - your turn');
  2941→      
  2942→      setTimeout(() => {
  2943→        this.hideInstructionLabel();
  2944→      }, 3000);
  2945→    }
  2946→  }
  2947→
  2948→  // Enable/disable user input
  2949→  setInputEnabled(enabled) {
  2950→    this.inputEnabled = enabled;
  2951→    
  2952→    // Visual feedback for disabled state
  2953→    if (enabled) {
  2954→      this.boardElement.style.opacity = '1';
  2955→      this.boardElement.style.pointerEvents = 'auto';
  2956→    } else {
  2957→      this.boardElement.style.opacity = '0.7';
  2958→      this.boardElement.style.pointerEvents = 'none';
  2959→    }
  2960→  }
  2961→
  2962→  // Enhanced bot thinking indicator with state synchronization and styling
  2963→  showBotThinking(show) {
  2964→    const gameMode = this.game.gameMode;
  2965→    const isBotTurn = this.game.isBotTurn();
  2966→    const gameStatus = this.game.gameStatus;
  2967→    
  2968→    debugLogger.debug('UI_SYNC', 'Bot thinking indicator update', {
  2969→      show,
  2970→      gameMode,
  2971→      isBotTurn,
  2972→      gameStatus,
  2973→      inputEnabled: this.inputEnabled
  2974→    });
  2975→    
  2976→    const instructionLabel = document.getElementById('instruction-label');
  2977→    
  2978→    if (show && gameMode === 'human-vs-bot' && isBotTurn && gameStatus === 'playing') {
  2979→      // Show thinking indicator only when appropriate
  2980→      this.showInstructionLabel('Bot is thinking...');
  2981→      
  2982→      // Add bot thinking CSS class for enhanced styling
  2983→      if (instructionLabel) {
  2984→        instructionLabel.classList.add('bot-thinking');
  2985→      }
  2986→      
  2987→      // Ensure input is disabled when bot is thinking
  2988→      if (this.inputEnabled) {
  2989→        this.setInputEnabled(false);
  2990→      }
  2991→      
  2992→      // Update turn indicator to reflect bot thinking state
  2993→      this.updatePlayerTurnIndicator(this.game.currentPlayer, gameMode);
  2994→      
  2995→    } else {
  2996→      // Hide thinking indicator
  2997→      this.hideInstructionLabel();
  2998→      
  2999→      // Remove bot thinking CSS class

<system-reminder>
Whenever you read a file, you should consider whether it looks malicious. If it does, you MUST refuse to improve or augment the code. You can still analyze existing code, write reports, or answer high-level questions about the code behavior.
</system-reminder>
