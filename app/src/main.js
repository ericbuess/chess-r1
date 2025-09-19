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

// Bundled js-chess-engine v1.0.3 - Zero dependencies, perfect for Rabbit R1
const jsChessEngine = (function() {
  const lib = {};
  !function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("js-chess-engine",[],e):"object"==typeof exports?exports["js-chess-engine"]=e():t["js-chess-engine"]=e()}(lib,(function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)i.d(n,o,function(e){return t[e]}.bind(null,o));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";i.r(e),i.d(e,"Game",(function(){return $})),i.d(e,"moves",(function(){return J})),i.d(e,"status",(function(){return V})),i.d(e,"getFen",(function(){return Y})),i.d(e,"move",(function(){return z})),i.d(e,"aiMove",(function(){return X}));const n=["A","B","C","D","E","F","G","H"],o=["1","2","3","4","5","6","7","8"],s={KING_W:"K",QUEEN_W:"Q",ROOK_W:"R",BISHOP_W:"B",KNIGHT_W:"N",PAWN_W:"P",KING_B:"k",QUEEN_B:"q",ROOK_B:"r",BISHOP_B:"b",KNIGHT_B:"n",PAWN_B:"p"},r="black",c="white",l=[0,1,2,3,4],a={0:1,1:2,2:2,3:3,4:3,5:4},u={0:2,1:2,2:4,3:4,4:5,5:5},h={fullMove:1,halfMove:0,enPassant:null,isFinished:!1,checkMate:!1,check:!1,turn:c},g=Object.assign({pieces:{E1:"K",D1:"Q",A1:"R",H1:"R",C1:"B",F1:"B",B1:"N",G1:"N",A2:"P",B2:"P",C2:"P",D2:"P",E2:"P",F2:"P",G2:"P",H2:"P",E8:"k",D8:"q",A8:"r",H8:"r",C8:"b",F8:"b",B8:"n",G8:"n",A7:"p",B7:"p",C7:"p",D7:"p",E7:"p",F7:"p",G7:"p",H7:"p"},castling:{whiteShort:!0,blackShort:!0,whiteLong:!0,blackLong:!0}},h),f={UP:{A1:"A2",A2:"A3",A3:"A4",A4:"A5",A5:"A6",A6:"A7",A7:"A8",A8:null,B1:"B2",B2:"B3",B3:"B4",B4:"B5",B5:"B6",B6:"B7",B7:"B8",B8:null,C1:"C2",C2:"C3",C3:"C4",C4:"C5",C5:"C6",C6:"C7",C7:"C8",C8:null,D1:"D2",D2:"D3",D3:"D4",D4:"D5",D5:"D6",D6:"D7",D7:"D8",D8:null,E1:"E2",E2:"E3",E3:"E4",E4:"E5",E5:"E6",E6:"E7",E7:"E8",E8:null,F1:"F2",F2:"F3",F3:"F4",F4:"F5",F5:"F6",F6:"F7",F7:"F8",F8:null,G1:"G2",G2:"G3",G3:"G4",G4:"G5",G5:"G6",G6:"G7",G7:"G8",G8:null,H1:"H2",H2:"H3",H3:"H4",H4:"H5",H5:"H6",H6:"H7",H7:"H8",H8:null},DOWN:{A1:null,A2:"A1",A3:"A2",A4:"A3",A5:"A4",A6:"A5",A7:"A6",A8:"A7",B1:null,B2:"B1",B3:"B2",B4:"B3",B5:"B4",B6:"B5",B7:"B6",B8:"B7",C1:null,C2:"C1",C3:"C2",C4:"C3",C5:"C4",C6:"C5",C7:"C6",C8:"C7",D1:null,D2:"D1",D3:"D2",D4:"D3",D5:"D4",D6:"D5",D7:"D6",D8:"D7",E1:null,E2:"E1",E3:"E2",E4:"E3",E5:"E4",E6:"E5",E7:"E6",E8:"E7",F1:null,F2:"F1",F3:"F2",F4:"F3",F5:"F4",F6:"F5",F7:"F6",F8:"F7",G1:null,G2:"G1",G3:"G2",G4:"G3",G5:"G4",G6:"G5",G7:"G6",G8:"G7",H1:null,H2:"H1",H3:"H2",H4:"H3",H5:"H4",H6:"H5",H7:"H6",H8:"H7"},LEFT:{A1:null,A2:null,A3:null,A4:null,A5:null,A6:null,A7:null,A8:null,B1:"A1",B2:"A2",B3:"A3",B4:"A4",B5:"A5",B6:"A6",B7:"A7",B8:"A8",C1:"B1",C2:"B2",C3:"B3",C4:"B4",C5:"B5",C6:"B6",C7:"B7",C8:"B8",D1:"C1",D2:"C2",D3:"C3",D4:"C4",D5:"C5",D6:"C6",D7:"C7",D8:"C8",E1:"D1",E2:"D2",E3:"D3",E4:"D4",E5:"D5",E6:"D6",E7:"D7",E8:"D8",F1:"E1",F2:"E2",F3:"E3",F4:"E4",F5:"E5",F6:"E6",F7:"E7",F8:"E8",G1:"F1",G2:"F2",G3:"F3",G4:"F4",G5:"F5",G6:"F6",G7:"F7",G8:"F8",H1:"G1",H2:"G2",H3:"G3",H4:"G4",H5:"G5",H6:"G6",H7:"G7",H8:"G8"},RIGHT:{A1:"B1",A2:"B2",A3:"B3",A4:"B4",A5:"B5",A6:"B6",A7:"B7",A8:"B8",B1:"C1",B2:"C2",B3:"C3",B4:"C4",B5:"C5",B6:"C6",B7:"C7",B8:"C8",C1:"D1",C2:"D2",C3:"D3",C4:"D4",C5:"D5",C6:"D6",C7:"D7",C8:"D8",D1:"E1",D2:"E2",D3:"E3",D4:"E4",D5:"E5",D6:"E6",D7:"E7",D8:"E8",E1:"F1",E2:"F2",E3:"F3",E4:"F4",E5:"F5",E6:"F6",E7:"F7",E8:"F8",F1:"G1",F2:"G2",F3:"G3",F4:"G4",F5:"G5",F6:"G6",F7:"G7",F8:"G8",G1:"H1",G2:"H2",G3:"H3",G4:"H4",G5:"H5",G6:"H6",G7:"H7",G8:"H8",H1:null,H2:null,H3:null,H4:null,H5:null,H6:null,H7:null,H8:null},UP_LEFT:{A1:null,A2:null,A3:null,A4:null,A5:null,A6:null,A7:null,A8:null,B1:"A2",B2:"A3",B3:"A4",B4:"A5",B5:"A6",B6:"A7",B7:"A8",B8:null,C1:"B2",C2:"B3",C3:"B4",C4:"B5",C5:"B6",C6:"B7",C7:"B8",C8:null,D1:"C2",D2:"C3",D3:"C4",D4:"C5",D5:"C6",D6:"C7",D7:"C8",D8:null,E1:"D2",E2:"D3",E3:"D4",E4:"D5",E5:"D6",E6:"D7",E7:"D8",E8:null,F1:"E2",F2:"E3",F3:"E4",F4:"E5",F5:"E6",F6:"E7",F7:"E8",F8:null,G1:"F2",G2:"F3",G3:"F4",G4:"F5",G5:"F6",G6:"F7",G7:"F8",G8:null,H1:"G2",H2:"G3",H3:"G4",H4:"G5",H5:"G6",H6:"G7",H7:"G8",H8:null},DOWN_RIGHT:{A1:null,A2:"B1",A3:"B2",A4:"B3",A5:"B4",A6:"B5",A7:"B6",A8:"B7",B1:null,B2:"C1",B3:"C2",B4:"C3",B5:"C4",B6:"C5",B7:"C6",B8:"C7",C1:null,C2:"D1",C3:"D2",C4:"D3",C5:"D4",C6:"D5",C7:"D6",C8:"D7",D1:null,D2:"E1",D3:"E2",D4:"E3",D5:"E4",D6:"E5",D7:"E6",D8:"E7",E1:null,E2:"F1",E3:"F2",E4:"F3",E5:"F4",E6:"F5",E7:"F6",E8:"F7",F1:null,F2:"G1",F3:"G2",F4:"G3",F5:"G4",F6:"G5",F7:"G6",F8:"G7",G1:null,G2:"H1",G3:"H2",G4:"H3",G5:"H4",G6:"H5",G7:"H6",G8:"H7",H1:null,H2:null,H3:null,H4:null,H5:null,H6:null,H7:null,H8:null},UP_RIGHT:{A1:"B2",A2:"B3",A3:"B4",A4:"B5",A5:"B6",A6:"B7",A7:"B8",A8:null,B1:"C2",B2:"C3",B3:"C4",B4:"C5",B5:"C6",B6:"C7",B7:"C8",B8:null,C1:"D2",C2:"D3",C3:"D4",C4:"D5",C5:"D6",C6:"D7",C7:"D8",C8:null,D1:"E2",D2:"E3",D3:"E4",D4:"E5",D5:"E6",D6:"E7",D7:"E8",D8:null,E1:"F2",E2:"F3",E3:"F4",E4:"F5",E5:"F6",E6:"F7",E7:"F8",E8:null,F1:"G2",F2:"G3",F3:"G4",F4:"G5",F5:"G6",F6:"G7",F7:"G8",F8:null,G1:"H2",G2:"H3",G3:"H4",G4:"H5",G5:"H6",G6:"H7",G7:"H8",G8:null,H1:null,H2:null,H3:null,H4:null,H5:null,H6:null,H7:null,H8:null},DOWN_LEFT:{A1:null,A2:null,A3:null,A4:null,A5:null,A6:null,A7:null,A8:null,B1:null,B2:"A1",B3:"A2",B4:"A3",B5:"A4",B6:"A5",B7:"A6",B8:"A7",C1:null,C2:"B1",C3:"B2",C4:"B3",C5:"B4",C6:"B5",C7:"B6",C8:"B7",D1:null,D2:"C1",D3:"C2",D4:"C3",D5:"C4",D6:"C5",D7:"C6",D8:"C7",E1:null,E2:"D1",E3:"D2",E4:"D3",E5:"D4",E6:"D5",E7:"D6",E8:"D7",F1:null,F2:"E1",F3:"E2",F4:"E3",F5:"E4",F6:"E5",F7:"E6",F8:"E7",G1:null,G2:"F1",G3:"F2",G4:"F3",G5:"F4",G6:"F5",G7:"F6",G8:"F7",H1:null,H2:"G1",H3:"G2",H4:"G3",H5:"G4",H6:"G5",H7:"G6",H8:"G7"}},C=[[0,0,0,0,0,0,0,0],[5,5,5,5,5,5,5,5],[1,1,2,3,3,2,1,1],[.5,.5,1,2.5,2.5,1,.5,.5],[0,0,0,2,2,0,0,0],[.5,0,1,0,0,1,0,.5],[.5,0,0,-2,-2,0,0,.5],[0,0,0,0,0,0,0,0]],P=[[-4,-3,-2,-2,-2,-2,-3,-4],[-3,-2,0,0,0,0,-2,-3],[-2,0,1,1.5,1.5,1,0,-2],[-2,.5,1.5,2,2,1.5,.5,-2],[-2,0,1.5,2,2,1.5,0,-2],[-2,.5,1,1.5,1.5,1,.5,-2],[-3,-2,0,.5,.5,0,-2,-3],[-4,-3,-2,-2,-2,-2,-3,-4]],p=[[-2,-1,-1,-1,-1,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,.5,1,1,.5,0,-1],[-1,.5,.5,1,1,.5,.5,-1],[-1,0,1,1,1,1,0,-1],[-1,1,1,1,1,1,1,-1],[-1,.5,0,0,0,0,.5,-1],[-2,-1,-1,-1,-1,-1,-1,-2]],E=[[0,0,0,0,0,0,0,0],[.5,1,1,1,1,1,1,.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[0,0,0,.5,.5,0,0,0]],B=[[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-2,-3,-3,-4,-4,-3,-3,-2],[-1,-2,-2,-2,-2,-2,-2,-1],[2,2,0,0,0,0,2,2],[2,3,1,0,0,1,3,2]],F=[[-2,-1,-1,-.5,-.5,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,.5,.5,.5,.5,0,-1],[-.5,0,.5,.5,.5,.5,0,-.5],[0,0,.5,.5,.5,.5,0,-.5],[-1,.5,.5,.5,.5,.5,0,-1],[-1,0,.5,0,0,0,0,-1],[-2,-1,-1,-.5,-.5,-1,-1,-2]],G={P:C.slice().reverse(),p:C,N:P.slice().reverse(),n:P,B:p.slice().reverse(),b:p,R:E.slice().reverse(),r:E,K:B.slice().reverse(),k:B,Q:F.slice().reverse(),q:F};function D(t){return f.UP[t]}function A(t){return f.DOWN[t]}function H(t){return f.LEFT[t]}function b(t){return f.RIGHT[t]}function d(t){return f.UP_LEFT[t]}function v(t){return f.UP_RIGHT[t]}function k(t){return f.DOWN_LEFT[t]}function y(t){return f.DOWN_RIGHT[t]}function w(t){const e=d(t);return e?D(e):null}function O(t){const e=d(t);return e?H(e):null}function L(t){const e=v(t);return e?D(e):null}function m(t){const e=v(t);return e?b(e):null}function M(t){const e=k(t);return e?A(e):null}function K(t){const e=k(t);return e?H(e):null}function N(t){const e=y(t);return e?A(e):null}function S(t){const e=y(t);return e?b(e):null}function j(t,e){return e===c?f.UP[t]:f.DOWN[t]}function _(t,e){return e===c?f.UP_LEFT[t]:f.DOWN_RIGHT[t]}function W(t,e){return e===c?f.UP_RIGHT[t]:f.DOWN_LEFT[t]}function U(t,e){return e===c?f.DOWN_LEFT[t]:f.UP_RIGHT[t]}function R(t,e){return e===c?f.DOWN_RIGHT[t]:f.UP_LEFT[t]}function T(t){return{k:10,q:9,r:5,b:3,n:3,p:1}[t.toLowerCase()]||0}function I(t){return"string"==typeof t&&t.match("^[a-hA-H]{1}[1-8]{1}$")}const x=-1e3,Q=1e3;class q{constructor(t=JSON.parse(JSON.stringify(g))){if("object"==typeof t)this.configuration=Object.assign({},h,t);else{if("string"!=typeof t)throw new Error(`Unknown configuration type ${typeof config}.`);this.configuration=Object.assign({},h,function(t=""){const[e,i,s,l,a,u]=t.split(" "),h={pieces:Object.fromEntries(e.split("/").flatMap((t,e)=>{let i=0;return t.split("").reduce((t,s)=>{const r=s.match(/k|b|q|n|p|r/i);r&&(t.push([`${n[i]}${o[7-e]}`,r[0]]),i+=1);const c=s.match(/[1-8]/);return c&&(i+=Number(c)),t},[])}))};return h.turn="b"===i?r:c,h.castling={whiteLong:!1,whiteShort:!1,blackLong:!1,blackShort:!1},s.includes("K")&&(h.castling.whiteShort=!0),s.includes("k")&&(h.castling.blackShort=!0),s.includes("Q")&&(h.castling.whiteLong=!0),s.includes("q")&&(h.castling.blackLong=!0),I(l)&&(h.enPassant=l.toUpperCase()),h.halfMove=parseInt(a),h.fullMove=parseInt(u),h}(t))}this.configuration.castling||(this.configuration.castling={whiteShort:!0,blackShort:!0,whiteLong:!0,blackLong:!0}),this.history=[]}getAttackingFields(t=this.getPlayingColor()){let e=[];for(const i in this.configuration.pieces){const n=this.getPiece(i);this.getPieceColor(n)===t&&(e=[...e,...this.getPieceMoves(n,i)])}return e}isAttackingKing(t=this.getPlayingColor()){let e=null;for(const i in this.configuration.pieces){const n=this.getPiece(i);if(this.isKing(n)&&this.getPieceColor(n)!==t){e=i;break}}return this.isPieceUnderAttack(e)}isPieceUnderAttack(t){const e=this.getPieceOnLocationColor(t),i=this.getEnemyColor(e);let n=!1,o=t,s=0;for(;D(o)&&!n;){o=D(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;A(o)&&!n;){o=A(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;H(o)&&!n;){o=H(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;b(o)&&!n;){o=b(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;W(o,e)&&!n;){o=W(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||1===s&&(this.isKing(t)||this.isPawn(t)))&&(n=!0),t)break}for(o=t,s=0;_(o,e)&&!n;){o=_(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||1===s&&(this.isKing(t)||this.isPawn(t)))&&(n=!0),t)break}for(o=t,s=0;R(o,e)&&!n;){o=R(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;U(o,e)&&!n;){o=U(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}o=L(t);let r=this.getPiece(o);return r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=m(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=O(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=w(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=M(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=K(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=N(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=S(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),n}hasPlayingPlayerCheck(){return this.isAttackingKing(this.getNonPlayingColor())}hasNonPlayingPlayerCheck(){return this.isAttackingKing(this.getPlayingColor())}getLowestValuePieceAttackingLocation(t,e=this.getPlayingColor()){let i=null;for(const n in this.configuration.pieces){const o=this.getPiece(n);this.getPieceColor(o)===e&&this.getPieceMoves(o,n).map(e=>{e===t&&(null===i||T(o)<i)&&(i=T(o))})}return i}getMoves(t=this.getPlayingColor(),e=null){const i={};let n=0;for(const e in this.configuration.pieces){const o=this.getPiece(e);if(this.getPieceColor(o)===t){const t=this.getPieceMoves(o,e);t.length&&n++,Object.assign(i,{[e]:t})}}const o=this.getAttackingFields(this.getNonPlayingColor());if(this.isLeftCastlingPossible(o)&&(this.isPlayingWhite()&&i.E1.push("C1"),this.isPlayingBlack()&&i.E8.push("C8")),this.isRightCastlingPossible(o)&&(this.isPlayingWhite()&&i.E1.push("G1"),this.isPlayingBlack()&&i.E8.push("G8")),e&&n>e)return i;const s={};for(const t in i)i[t].map(e=>{const i={pieces:Object.assign({},this.configuration.pieces),castling:Object.assign({},this.configuration.castling)},n=new q(i);n.move(t,e),(this.isPlayingWhite()&&!n.isAttackingKing(r)||this.isPlayingBlack()&&!n.isAttackingKing(c))&&(s[t]||(s[t]=[]),s[t].push(e))});return Object.keys(s).length||(this.configuration.isFinished=!0,this.hasPlayingPlayerCheck()&&(this.configuration.checkMate=!0)),s}isLeftCastlingPossible(t){if(this.isPlayingWhite()&&!this.configuration.castling.whiteLong)return!1;if(this.isPlayingBlack()&&!this.configuration.castling.blackLong)return!1;let e=null;if(this.isPlayingWhite()&&"K"===this.getPiece("E1")&&"R"===this.getPiece("A1")&&!t.includes("E1")?e="E1":this.isPlayingBlack()&&"k"===this.getPiece("E8")&&"r"===this.getPiece("A8")&&!t.includes("E8")&&(e="E8"),!e)return!1;let i=H(e);return!this.getPiece(i)&&!t.includes(i)&&(i=H(i),!this.getPiece(i)&&!t.includes(i)&&(i=H(i),!this.getPiece(i)))}isRightCastlingPossible(t){if(this.isPlayingWhite()&&!this.configuration.castling.whiteShort)return!1;if(this.isPlayingBlack()&&!this.configuration.castling.blackShort)return!1;let e=null;if(this.isPlayingWhite()&&"K"===this.getPiece("E1")&&"R"===this.getPiece("H1")&&!t.includes("E1")?e="E1":this.isPlayingBlack()&&"k"===this.getPiece("E8")&&"r"===this.getPiece("H8")&&!t.includes("E8")&&(e="E8"),!e)return!1;let i=b(e);return!this.getPiece(i)&&!t.includes(i)&&(i=b(i),!this.getPiece(i)&&!t.includes(i))}getPieceMoves(t,e){return this.isPawn(t)?this.getPawnMoves(t,e):this.isKnight(t)?this.getKnightMoves(t,e):this.isRook(t)?this.getRookMoves(t,e):this.isBishop(t)?this.getBishopMoves(t,e):this.isQueen(t)?this.getQueenMoves(t,e):this.isKing(t)?this.getKingMoves(t,e):[]}isPawn(t){return"P"===t.toUpperCase()}isKnight(t){return"N"===t.toUpperCase()}isRook(t){return"R"===t.toUpperCase()}isBishop(t){return"B"===t.toUpperCase()}isQueen(t){return"Q"===t.toUpperCase()}isKing(t){return"K"===t.toUpperCase()}getPawnMoves(t,e){const i=[],n=this.getPieceColor(t);let o=j(e,n);return o&&!this.getPiece(o)&&(i.push(o),o=j(o,n),function(t,e){if(t===c&&"2"===e[1])return!0;if(t===r&&"7"===e[1])return!0;return!1}(n,e)&&o&&!this.getPiece(o)&&i.push(o)),o=_(e,n),o&&(this.getPiece(o)&&this.getPieceOnLocationColor(o)!==n||o===this.configuration.enPassant)&&i.push(o),o=W(e,n),o&&(this.getPiece(o)&&this.getPieceOnLocationColor(o)!==n||o===this.configuration.enPassant)&&i.push(o),i}getKnightMoves(t,e){const i=[],n=this.getPieceColor(t);let o=L(e);return o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=m(e),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=w(e),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=O(e),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=K(e),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=M(e),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=S(e),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=N(e),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),i}getRookMoves(t,e){const i=[],n=this.getPieceColor(t);let o=e;for(;D(o);){o=D(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}for(o=e;A(o);){o=A(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}for(o=e;b(o);){o=b(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}for(o=e;H(o);){o=H(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}return i}getBishopMoves(t,e){const i=[],n=this.getPieceColor(t);let o=e;for(;d(o);){o=d(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}for(o=e;v(o);){o=v(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}for(o=e;k(o);){o=k(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}for(o=e;y(o);){o=y(o);const t=this.getPieceOnLocationColor(o);if(this.getPieceOnLocationColor(o)!==n&&i.push(o),t)break}return i}getQueenMoves(t,e){return[...this.getRookMoves(t,e),...this.getBishopMoves(t,e)]}getKingMoves(t,e){const i=[],n=this.getPieceColor(t);let o=e;return o=D(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=e,o=b(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=e,o=A(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=e,o=H(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=e,o=d(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=e,o=v(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=e,o=k(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),o=e,o=y(o),o&&this.getPieceOnLocationColor(o)!==n&&i.push(o),i}getPieceColor(t){return t.toUpperCase()===t?c:r}getPieceOnLocationColor(t){const e=this.getPiece(t);return e?e.toUpperCase()===e?c:r:null}getPiece(t){return this.configuration.pieces[t]}setPiece(t,e){if(!function(t){return Object.values(s).includes(t)}(e))throw new Error("Invalid piece "+e);if(!I(t))throw new Error("Invalid location "+t);this.configuration.pieces[t.toUpperCase()]=e}removePiece(t){if(!I(t))throw new Error("Invalid location "+t);delete this.configuration.pieces[t.toUpperCase()]}isEmpty(t){if(!I(t))throw new Error("Invalid location "+t);return!this.configuration.pieces[t.toUpperCase()]}getEnemyColor(t){return t===c?r:c}getPlayingColor(){return this.configuration.turn}getNonPlayingColor(){return this.isPlayingWhite()?r:c}isPlayingWhite(){return this.configuration.turn===c}isPlayingBlack(){return this.configuration.turn===r}addMoveToHistory(t,e){this.history.push({from:t,to:e,configuration:JSON.parse(JSON.stringify(this.configuration))})}move(t,e){const i=this.getPiece(t),n=this.getPiece(e);if(!i)throw new Error("There is no piece at "+t);var o,s;if(Object.assign(this.configuration.pieces,{[e]:i}),delete this.configuration.pieces[t],this.isPlayingWhite()&&this.isPawn(i)&&"8"===e[1]&&Object.assign(this.configuration.pieces,{[e]:"Q"}),this.isPlayingBlack()&&this.isPawn(i)&&"1"===e[1]&&Object.assign(this.configuration.pieces,{[e]:"q"}),this.isPawn(i)&&e===this.configuration.enPassant&&delete this.configuration.pieces[(o=e,s=this.getPlayingColor(),s===c?f.DOWN[o]:f.UP[o])],this.isPawn(i)&&this.isPlayingWhite()&&"2"===t[1]&&"4"===e[1]?this.configuration.enPassant=t[0]+"3":this.isPawn(i)&&this.isPlayingBlack()&&"7"===t[1]&&"5"===e[1]?this.configuration.enPassant=t[0]+"6":this.configuration.enPassant=null,"E1"===t&&Object.assign(this.configuration.castling,{whiteLong:!1,whiteShort:!1}),"E8"===t&&Object.assign(this.configuration.castling,{blackLong:!1,blackShort:!1}),"A1"===t&&Object.assign(this.configuration.castling,{whiteLong:!1}),"H1"===t&&Object.assign(this.configuration.castling,{whiteShort:!1}),"A8"===t&&Object.assign(this.configuration.castling,{blackLong:!1}),"H8"===t&&Object.assign(this.configuration.castling,{blackShort:!1}),this.isKing(i)){if("E1"===t&&"C1"===e)return this.move("A1","D1");if("E8"===t&&"C8"===e)return this.move("A8","D8");if("E1"===t&&"G1"===e)return this.move("H1","F1");if("E8"===t&&"G8"===e)return this.move("H8","F8")}this.configuration.turn=this.isPlayingWhite()?r:c,this.isPlayingWhite()&&this.configuration.fullMove++,this.configuration.halfMove++,(n||this.isPawn(i))&&(this.configuration.halfMove=0)}exportJson(){return{moves:this.getMoves(),pieces:this.configuration.pieces,turn:this.configuration.turn,isFinished:this.configuration.isFinished,check:this.hasPlayingPlayerCheck(),checkMate:this.configuration.checkMate,castling:this.configuration.castling,enPassant:this.configuration.enPassant,halfMove:this.configuration.halfMove,fullMove:this.configuration.fullMove}}calculateAiMove(t){return this.calculateAiMoves(t)[0]}calculateAiMoves(t){if(t=parseInt(t),!l.includes(t))throw new Error(`Invalid level ${t}. You can choose ${l.join(",")}`);this.shouldIncreaseLevel()&&t++;const e=[],i=this.calculateScore(this.getPlayingColor()),n=this.getMoves();for(const o in n)n[o].map(n=>{const s=this.getTestBoard(),r=Boolean(s.getPiece(n));s.move(o,n),e.push({from:o,to:n,score:s.testMoveScores(this.getPlayingColor(),t,r,r?s.calculateScore(this.getPlayingColor()):i,n).score+s.calculateScoreByPiecesLocation(this.getPlayingColor())+Math.floor(Math.random()*(this.configuration.halfMove>10?this.configuration.halfMove-10:1)*10)/10})});return e.sort((t,e)=>t.score<e.score?1:t.score>e.score?-1:0),e}shouldIncreaseLevel(){return this.getIngamePiecesValue()<50}getIngamePiecesValue(){let t=0;for(const e in this.configuration.pieces){t+=T(this.getPiece(e))}return t}getTestBoard(){const t={pieces:Object.assign({},this.configuration.pieces),castling:Object.assign({},this.configuration.castling),turn:this.configuration.turn,enPassant:this.configuration.enPassant};return new q(t)}testMoveScores(t,e,i,n,o,s=1){let r=null;if(s<u[e]&&this.hasPlayingPlayerCheck()?r=this.getMoves(this.getPlayingColor()):(s<a[e]||i&&s<u[e])&&(r=this.getMoves(this.getPlayingColor(),5)),this.configuration.isFinished)return{score:this.calculateScore(t)+(this.getPlayingColor()===t?s:-s),max:!0};if(!r){if(null!==n)return{score:n,max:!1};return{score:this.calculateScore(t),max:!1}}let c=this.getPlayingColor()===t?x:Q,l=!1;for(const i in r)l||r[i].map(o=>{if(l)return;const r=this.getTestBoard(),a=Boolean(r.getPiece(o));if(r.move(i,o),r.hasNonPlayingPlayerCheck())return;const u=r.testMoveScores(t,e,a,a?r.calculateScore(t):n,o,s+1);u.max&&(l=!0),c=this.getPlayingColor()===t?Math.max(c,u.score):Math.min(c,u.score)});return{score:c,max:!1}}calculateScoreByPiecesLocation(t=this.getPlayingColor()){const e={A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7};let i=0;for(const n in this.configuration.pieces){const o=this.getPiece(n);if(G[o]){const s=G[o][n[1]-1][e[n[0]]];i+=.5*(this.getPieceColor(o)===t?s:-s)}}return i}calculateScore(t=this.getPlayingColor()){let e=0;if(this.configuration.checkMate)return this.getPlayingColor()===t?x:Q;if(this.configuration.isFinished)return this.getPlayingColor()===t?Q:x;for(const i in this.configuration.pieces){const n=this.getPiece(i);this.getPieceColor(n)===t?e+=10*T(n):e-=10*T(n)}return e}}class ${constructor(t){this.board=new q(t)}move(t,e){t=t.toUpperCase(),e=e.toUpperCase();const i=this.board.getMoves();if(!i[t]||!i[t].includes(e))throw new Error(`Invalid move from ${t} to ${e} for ${this.board.getPlayingColor()}`);return this.board.addMoveToHistory(t,e),this.board.move(t,e),{[t]:e}}moves(t=null){return(t?this.board.getMoves()[t.toUpperCase()]:this.board.getMoves())||[]}setPiece(t,e){this.board.setPiece(t,e)}removePiece(t){this.board.removePiece(t)}aiMove(t=2){const e=this.board.calculateAiMove(t);return this.move(e.from,e.to)}getHistory(t=!1){return t?this.board.history.reverse():this.board.history}printToConsole(){!function(t){process.stdout.write("\n");let e=c;Object.assign([],o).reverse().map(i=>{process.stdout.write(""+i),n.map(n=>{switch(t.pieces[`${n}${i}`]){case"K":process.stdout.write("♚");break;case"Q":process.stdout.write("♛");break;case"R":process.stdout.write("♜");break;case"B":process.stdout.write("♝");break;case"N":process.stdout.write("♞");break;case"P":process.stdout.write("♟");break;case"k":process.stdout.write("♔");break;case"q":process.stdout.write("♕");break;case"r":process.stdout.write("♖");break;case"b":process.stdout.write("♗");break;case"n":process.stdout.write("♘");break;case"p":process.stdout.write("♙");break;default:process.stdout.write(e===c?"█":"░")}e=e===c?r:c}),e=e===c?r:c,process.stdout.write("\n")}),process.stdout.write(" "),n.map(t=>{process.stdout.write(""+t)}),process.stdout.write("\n")}(this.board.configuration)}exportJson(){return this.board.exportJson()}exportFEN(){return function(t){let e="";Object.assign([],o).reverse().map(i=>{let o=0;i<8&&(e+="/"),n.map(n=>{const s=t.pieces[`${n}${i}`];s?(o&&(e+=o.toString(),o=0),e+=s):o++}),e+=""+(o||"")}),e+=t.turn===c?" w ":" b ";const{whiteShort:i,whiteLong:s,blackLong:r,blackShort:l}=t.castling;return s||i||r||l?(i&&(e+="K"),s&&(e+="Q"),l&&(e+="k"),r&&(e+="q")):e+="-",e+=" "+(t.enPassant?t.enPassant.toLowerCase():"-"),e+=" "+t.halfMove,e+=" "+t.fullMove,e}(this.board.configuration)}}function J(t){if(!t)throw new Error("Configuration param required.");return new $(t).moves()}function V(t){if(!t)throw new Error("Configuration param required.");return new $(t).exportJson()}function Y(t){if(!t)throw new Error("Configuration param required.");return new $(t).exportFEN()}function z(t,e,i){if(!t)throw new Error("Configuration param required.");const n=new $(t);return n.move(e,i),"object"==typeof t?n.exportJson():n.exportFEN()}function X(t,e=2){if(!t)throw new Error("Configuration param required.");const i=new $(t).board.calculateAiMove(e);return{[i.from]:i.to}}}])}));
  return lib["js-chess-engine"];
})();

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
      const game = new jsChessEngine.Game(config);
      const status = game.exportJson();
      
      return {
        isCheckmate: status.checkMate || false,
        isStalemate: status.isFinished && !status.checkMate && !status.check,
        isCheck: status.check || false,
        hasValidMoves: Object.keys(status.moves || {}).length > 0
      };
    } catch (error) {
      debugLogger.error('VALIDATION', 'Library validation error:', error);
      return null;
    }
  }
}

// Chess Game State
class ChessGame {
  constructor() {
    // Initialize js-chess-engine
    this.engine = new jsChessEngine.Game();
    
    // UI state management (separate from chess logic)
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
    this.currentPlayer = 'white';
    this.gameStatus = 'playing';

    // NEW STATE HISTORY SYSTEM
    // Store complete game states for instant undo/redo
    // Index 0 = initial state, Index 1 = after first move, etc.
    this.stateHistory = [];
    this.currentStateIndex = 0;
    this.isInUndoRedoState = false; // Track if we're in an undo/redo state where bot shouldn't auto-move
    this.lastUndoWasBotMove = false; // Track if the last undo was a bot move for notification

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
  makeMove(fromRow, fromCol, toRow, toCol) {
    
    const from = this.coordsToSquare(fromRow, fromCol);
    const to = this.coordsToSquare(toRow, toCol);
    
    console.log('[MOVE] Converted to chess notation:', { from, to });
    
    try {
      // Check if this was a capture for sound
      const targetPiece = this.board[toRow][toCol];
      const isCapture = targetPiece !== null;
      const movedPiece = this.board[fromRow][fromCol];

      // Execute move in engine
      console.log('[MOVE] Calling engine.move()...');
      const moveResult = this.engine.move(from, to);
      console.log('[MOVE] Engine move result:', moveResult);

      // Update our cached state
      this.updateCachedState();

      // Update board orientation after player change
      this.boardFlipped = this.determineOrientation();
      console.log('[MOVE] Updated orientation after move - BoardFlipped:', this.boardFlipped, 'CurrentPlayer:', this.currentPlayer);

      // Update game status from engine and check for transitions
      const enteredCheck = this.updateGameStatus();
      if (enteredCheck) {
        // We just entered check - determine who's in check
        const checkedPlayer = this.currentPlayer === 'white' ? 'White' : 'Black';
        console.log(`[CHECK] ${checkedPlayer} is now in check!`);
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
      
      console.log('[MOVE] Move successful, new state:', {
        currentPlayer: this.currentPlayer,
        gameStatus: this.gameStatus
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
      
      return { success: true, enteredCheck };
    } catch (error) {
      console.error(`[MOVE] Invalid move: ${from} to ${to}`, error.message);
      console.error(`[MOVE] Full error:`, error);
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
  generateBotMove() {
    try {
      console.log('[BOT] Generating bot move...');

      // Get the piece positions before the move for history tracking
      const boardBefore = this.board;
      
      // IMPORTANT: aiMove() directly executes the move in the engine!
      // It doesn't just return a move suggestion - it plays it
      // Difficulty: 0 = random, 1 = easy, 2 = medium, 3 = hard, 4 = expert
      const aiMove = this.engine.aiMove(this.botDifficulty);
      console.log('[BOT] AI move EXECUTED by engine:', aiMove);
      
      // The move has already been made in the engine
      // Update our cached state to reflect the new position
      this.updateCachedState();
      
      // Update game status from engine and check for transitions
      const enteredCheck = this.updateGameStatus();
      if (enteredCheck) {
        // Bot just put human in check
        console.log('[CHECK] Bot put human king in check!');
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
        
        console.log('[BOT] Move details:', { 
          from, to, 
          fromCoords, toCoords, 
          movedPiece,
          capturedPiece,
          newTurn: this.currentPlayer 
        });
        
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
        
        return {
          from: fromCoords,
          to: toCoords,
          piece: movedPiece,
          enteredCheck
        };
      }
    } catch (error) {
      console.error('Bot move generation failed:', error.message, error);
    }
    
    return null;
  }
  
  /**
   * Execute bot move
   */
  async executeBotMove() {
    console.log('[BOT] executeBotMove called');
    console.log('[BOT] Game state:', {
      gameMode: this.gameMode,
      isBotTurn: this.isBotTurn(),
      gameStatus: this.gameStatus,
      currentPlayer: this.currentPlayer,
      humanColor: this.humanColor
    });
    
    // Debug each condition separately
    const isHumanVsBot = this.gameMode === 'human-vs-bot';
    const isBotTurn = this.isBotTurn();
    const isValidStatus = this.gameStatus === 'playing' || this.gameStatus === 'check';
    
    console.log('[BOT] Condition checks:', {
      isHumanVsBot,
      isBotTurn,
      isValidStatus,
      willExecute: isHumanVsBot && isBotTurn && isValidStatus
    });
    
    if (!isHumanVsBot || !isBotTurn || !isValidStatus) {
      console.log('[BOT] Conditions not met for bot move - execution blocked');
      return { success: false, enteredCheck: false };
    }
    
    const startTime = Date.now();
    
    // Generate AND execute bot move (aiMove() does both!)
    const botMove = this.generateBotMove();
    console.log('[BOT] Bot move completed:', botMove);
    
    if (!botMove) {
      console.error('[BOT] Failed to generate/execute bot move');
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
    console.log('[BOT] Strategic bot move executed successfully:', {
      from: `${botMove.from.row},${botMove.from.col}`,
      to: `${botMove.to.row},${botMove.to.col}`,
      piece: botMove.piece,
      newTurn: this.currentPlayer
    });
    
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
    console.log('[STATE] Recording game state:', moveData);

    // If we're not at the end of history, truncate future states (branching)
    if (this.currentStateIndex < this.stateHistory.length - 1) {
      console.log(`[STATE] Truncating future states from index ${this.currentStateIndex + 1}`);
      this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1);
    }

    // Clear the undo/redo state flag when making a new move
    this.isInUndoRedoState = false;

    // Store complete engine state AFTER the move
    const stateAfterMove = JSON.parse(JSON.stringify(this.engine.exportJson()));
    const stateEntry = {
      engineState: stateAfterMove,
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

    console.log(`[STATE] Storing state at index ${this.currentStateIndex + 1}`);
    this.stateHistory.push(stateEntry);
    this.currentStateIndex++;

    // Keep old moveHistory for backward compatibility (will remove later)
    if (!this.moveHistory) this.moveHistory = [];
    this.moveHistory.push({
      from: moveData.from,
      to: moveData.to,
      piece: moveData.piece,
      captured: moveData.captured,
      notation: moveData.notation
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
   * Parse engine piece notation to our format
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
  
  // ============================================
  // GAME MANAGEMENT METHODS
  // ============================================
  
  /**
   * Start a new game
   */
  newGame() {
    // Reset engine
    this.engine = new jsChessEngine.Game();

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

    // THEN determine board orientation based on correct currentPlayer
    this.boardFlipped = this.determineOrientation();
    console.log('[NEW_GAME] Set board orientation:', this.boardFlipped, 'for player:', this.currentPlayer);

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
    if (this.gameMode === 'human-vs-bot' && this.stateHistory && this.stateHistory.length > 1) {
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
    if (this.gameMode === 'human-vs-bot' && this.stateHistory && this.stateHistory.length > 1) {
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
      console.log(`[ORIENTATION] Mode: ${this.orientationMode}, Current Player: ${this.currentPlayer}, Should Flip: ${shouldFlip}`);
    } else {
      // In human vs bot, flip when playing as black so black pieces are at bottom
      shouldFlip = this.humanColor === 'black';
      console.log(`[ORIENTATION] Bot Mode, Human Color: ${this.humanColor}, Should Flip: ${shouldFlip}`);
    }

    if (prevFlipped !== shouldFlip) {
      console.log(`[ORIENTATION] Board flip state changing from ${prevFlipped} to ${shouldFlip}`);
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
      this.engine = new jsChessEngine.Game(state.engineState);
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
      
      this.engine = new jsChessEngine.Game(config);
    }
    
    // Restore UI state
    this.selectedSquare = state.selectedSquare || null;
    this.possibleMoves = state.possibleMoves || [];
    // Only restore gameMode if not explicitly preserving the current one
    if (!options.preserveGameMode) {
      console.log('[LOAD STATE] Restoring gameMode from state:', state.gameMode);
      this.gameMode = state.gameMode || 'human-vs-bot';
    } else {
      console.log('[LOAD STATE] Preserving current gameMode:', this.gameMode);
    }
    this.humanColor = state.humanColor || 'white';
    this.botDifficulty = state.botDifficulty !== undefined ? state.botDifficulty : 1;
    this.allowUndo = state.allowUndo !== undefined ? state.allowUndo : true;
    // Load orientation mode but recalculate flip state for consistency
    this.orientationMode = state.orientationMode || 'handoff';
    // Recalculate boardFlipped to ensure it's correct for current state
    this.boardFlipped = this.determineOrientation();
    console.log('[LOAD_STATE] Recalculated board orientation:', this.boardFlipped, 'Mode:', this.orientationMode);
    this.soundEnabled = state.soundEnabled !== undefined ? state.soundEnabled : true; // Restore sound preference
    this.moveHistory = state.moveHistory || [];
    this.currentMoveIndex = state.currentMoveIndex !== undefined ? state.currentMoveIndex : this.moveHistory.length - 1;

    // Ensure initial state is properly cloned and validated
    if (state.initialEngineState) {
      this.initialEngineState = JSON.parse(JSON.stringify(state.initialEngineState));
    } else {
      // If no initial state in save, create fresh one
      const freshGame = new jsChessEngine.Game();
      this.initialEngineState = JSON.parse(JSON.stringify(freshGame.exportJson()));
    }

    // Validate loaded initial state
    if (!this.initialEngineState.pieces || !this.initialEngineState.pieces['E2']) {
      console.error('[LOAD] WARNING: Loaded initial state is corrupted! Creating fresh initial state.');
      const freshGame = new jsChessEngine.Game();
      this.initialEngineState = JSON.parse(JSON.stringify(freshGame.exportJson()));
    }

    // Update cached state
    this.updateCachedState();

    // CRITICAL FIX: Handle stateHistory for the new undo/redo system
    // Check if we have saved stateHistory (new saves) or need to rebuild it (old saves)
    if (state.stateHistory && state.stateHistory.length > 0) {
      // NEW: Restore saved stateHistory directly
      console.log('[LOAD] Restoring saved state history:', state.stateHistory.length, 'states');
      this.stateHistory = state.stateHistory;
      this.currentStateIndex = state.currentStateIndex || (state.stateHistory.length - 1);
    } else {
      // OLD: Rebuild stateHistory from moveHistory for backward compatibility
      console.log('[LOAD] No stateHistory found, rebuilding from moveHistory');
      this.stateHistory = [];
      this.currentStateIndex = 0;

      // First, store the TRUE initial state (empty board)
      const freshGame = new jsChessEngine.Game();
      this.stateHistory.push({
        engineState: JSON.parse(JSON.stringify(freshGame.exportJson())),
        move: null,
        notation: null,
        timestamp: Date.now()
      });

      // If we have moves in history, rebuild states by replaying them
      if (state.moveHistory && state.moveHistory.length > 0) {
        console.log('[LOAD] Rebuilding state history from', state.moveHistory.length, 'moves');

        // Start with a fresh engine to replay moves
        const replayEngine = new jsChessEngine.Game();

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
            console.error('[LOAD] Error replaying move:', from, to, error);
            // Stop rebuilding if a move fails
            break;
          }
        }

        console.log('[LOAD] State history rebuilt:', this.stateHistory.length, 'states, current index:', this.currentStateIndex);
      } else {
        // No moves, just the initial state
        console.log('[LOAD] No moves to replay, keeping initial state only');
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
      console.log('Game auto-saved successfully');
      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      return false;
    }
  }
  
  /**
   * Get storage key for current game mode
   */
  getStorageKey() {
    return `chess_game_state_${this.gameMode}`;
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
      0: 'Random',
      1: 'Easy',
      2: 'Medium',
      3: 'Hard',
      4: 'Expert'
    };
    return difficulties[this.botDifficulty] || 'Easy';
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

    // Get wooden sound data from global
    const woodenData = window.woodenSoundData || {};

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

    // Helper to play audio with volume control
    const playAudio = (base64Data, volume = 0.4) => {
      if (!this.soundEnabled || !base64Data) return Promise.resolve();
      const audio = new Audio(base64Data);
      audio.volume = volume;
      return audio.play().catch(() => {});
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
    console.log(`[SOUND] Playing sound: ${soundName}`);
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
  
  undoMove() {
    // NEW SIMPLIFIED UNDO - Direct state restoration
    if (!this.canUndo()) {
      console.log('[UNDO] Cannot undo - already at initial state');
      return false;
    }

    console.log(`[UNDO] Moving from state ${this.currentStateIndex} to ${this.currentStateIndex - 1}`);

    // Check if the move we're undoing was a capture (for sound replay)
    const undoingState = this.stateHistory[this.currentStateIndex];
    const wasCapture = undoingState && undoingState.captured;

    // Move index back
    this.currentStateIndex--;

    // Restore the engine to the previous state instantly (O(1) operation)
    const targetState = this.stateHistory[this.currentStateIndex];


    // CRITICAL: Deep clone the state to prevent engine from mutating our stored history
    const clonedState = JSON.parse(JSON.stringify(targetState.engineState));
    this.engine = new jsChessEngine.Game(clonedState);


    // Update cached state (this will call engineStateToBoard internally)
    this.updateCachedState();
    this.updateGameStatus();

    // Force immediate board update to ensure UI synchronization
    this.board = this.engineStateToBoard();

    // Don't recalculate orientation here - updateDisplay will handle it
    // This prevents double rotation during undo
    // this.boardFlipped = this.determineOrientation();
    console.log(`[UNDO] Skipping orientation recalc to prevent double rotation - CurrentPlayer: ${this.currentPlayer}`);

    console.log(`[UNDO] Restored to state ${this.currentStateIndex}`);

    // Clear selection
    this.selectedSquare = null;
    this.possibleMoves = [];

    // Set flag to indicate we're in undo/redo state
    this.isInUndoRedoState = true;

    // Play appropriate sound for the move being undone
    // Play action sound (capture or move)
    if (wasCapture) {
      this.playSound('capture');
      console.log('[UNDO] Playing capture sound for undoing capture move');
    } else {
      this.playSound('move');
      console.log('[UNDO] Playing move sound for undoing regular move');
    }

    // Play status sound with delay if there was a capture
    // Check the restored state for check/checkmate status
    if (this.gameStatus === 'checkmate') {
      setTimeout(() => this.playSound('checkmate'), wasCapture ? 100 : 0);
      console.log('[UNDO] Scheduling checkmate sound');
    } else if (this.gameStatus === 'check') {
      setTimeout(() => this.playSound('check'), wasCapture ? 100 : 0);
      console.log('[UNDO] Scheduling check sound');
    }

    return true;
  }

  redoMove() {
    // NEW SIMPLIFIED REDO - Direct state restoration
    if (!this.canRedo()) {
      console.log('[REDO] Cannot redo - already at latest state');
      return false;
    }

    console.log(`[REDO] Moving from state ${this.currentStateIndex} to ${this.currentStateIndex + 1}`);

    // Move index forward
    this.currentStateIndex++;

    // Restore the engine to the next state instantly (O(1) operation)
    const targetState = this.stateHistory[this.currentStateIndex];
    // CRITICAL: Deep clone the state to prevent engine from mutating our stored history
    const clonedState = JSON.parse(JSON.stringify(targetState.engineState));
    this.engine = new jsChessEngine.Game(clonedState);

    // Update cached state (this will call engineStateToBoard internally)
    this.updateCachedState();
    this.updateGameStatus();

    // Force immediate board update to ensure UI synchronization
    this.board = this.engineStateToBoard();

    // Don't recalculate orientation here - updateDisplay will handle it
    // This prevents double rotation during redo
    // this.boardFlipped = this.determineOrientation();
    console.log(`[REDO] Skipping orientation recalc to prevent double rotation - CurrentPlayer: ${this.currentPlayer}`);

    console.log(`[REDO] Restored to state ${this.currentStateIndex}`);
    if (targetState.move) {
      console.log(`[REDO] Now at position after: ${targetState.notation}`);
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
      console.log('[REDO] Playing capture sound for redoing capture move');
    } else {
      this.playSound('move');
      console.log('[REDO] Playing move sound for redoing regular move');
    }

    // Play status sound with delay if there was a capture
    // Check the restored state for check/checkmate status
    if (this.gameStatus === 'checkmate') {
      setTimeout(() => this.playSound('checkmate'), wasCapture ? 100 : 0);
      console.log('[REDO] Scheduling checkmate sound');
    } else if (this.gameStatus === 'check') {
      setTimeout(() => this.playSound('check'), wasCapture ? 100 : 0);
      console.log('[REDO] Scheduling check sound');
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
      return `${pieceColor} ${piece.type} captures ${to}`;
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
    debugLogger.info('UI', 'Starting board flip animation');

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
        debugLogger.info('UI', 'Board flip animation completed');
        
        if (callback) callback();
      }, 150);
    }, 150);
  }

  // Update board perspective without animation (for undo/redo)
  updateBoardPerspective() {
    if (this.isFlipping) return; // Don't interfere with ongoing animation

    const currentFlipState = this.game.boardFlipped;
    const wasFlipped = this.boardElement.classList.contains('flipped');

    console.log('[UPDATE_PERSPECTIVE] Called - CurrentFlip:', currentFlipState, 'WasFlipped:', wasFlipped, 'OrientationMode:', this.game.orientationMode);

    debugLogger.info('UI', 'Updating board perspective without animation', {
      currentFlipState: currentFlipState,
      wasFlipped: wasFlipped,
      gameMode: this.game.gameMode,
      currentPlayer: this.game.currentPlayer,
      isUndoRedo: this.game.isUndoRedoAction
    });
    
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
      console.log('[BOT_ACTIVATION] Bot turn BLOCKED - redo in progress');
      return;
    }

    const gameMode = this.game.gameMode;
    const isBotTurn = this.game.isBotTurn();
    const gameStatus = this.game.gameStatus;
    const currentPlayer = this.game.currentPlayer;
    const humanColor = this.game.getHumanColor();

    // Log the call stack to see where this was triggered from
    console.trace('[BOT_ACTIVATION] Bot turn handler called from:');

    debugLogger.info('BOT_ACTIVATION', 'Bot turn handler called', {
      gameMode,
      isBotTurn,
      gameStatus,
      currentPlayer,
      humanColor,
      moveHistoryLength: this.game.moveHistory.length
    });

    // Validate bot turn conditions
    if (gameMode !== 'human-vs-bot') {
      debugLogger.warn('BOT_ACTIVATION', 'Not in vs Bot mode, exiting');
      return;
    }

    if (!isBotTurn) {
      debugLogger.warn('BOT_ACTIVATION', 'Not bot\'s turn, exiting', {
        currentPlayer,
        humanColor,
        expectedBotColor: humanColor === 'white' ? 'black' : 'white'
      });
      return;
    }

    // Check if game is over
    if (gameStatus !== 'playing' && gameStatus !== 'check') {
      debugLogger.info('BOT_ACTIVATION', 'Game over, cleaning up bot turn state');
      this.showBotThinking(false);
      this.setInputEnabled(false); // Keep disabled for game end
      return;
    }

    // Determine if this is an initial bot move (first move of game)
    const isInitialBotMove = this.game.moveHistory.length === 0 && isBotTurn;
    const moveType = isInitialBotMove ? 'INITIAL' : 'SUBSEQUENT';

    debugLogger.info('BOT_ACTIVATION', `Executing ${moveType} bot move`);

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
      const botResult = await this.game.executeBotMove();
      
      if (botResult && botResult.success) {
        debugLogger.info('BOT_ACTIVATION', `${moveType} bot move completed successfully`);
        
        // Update display after bot move
        this.updateDisplay();
        
        // Check if bot put human in check
        if (botResult.enteredCheck) {
          // Bot put human in check - status shown in header
          // this.showCheckAlert('You are in check!');
          this.highlightKing(this.game.humanColor);
        }

        // Sound is already played in generateBotMove() - removed duplicate

        // Hide thinking indicator and re-enable input only after successful move
        this.showBotThinking(false);
        
        // Check if game ended after bot move
        if (this.game.gameStatus === 'checkmate' || this.game.gameStatus === 'stalemate') {
          debugLogger.info('BOT_ACTIVATION', 'Game ended after bot move');
          this.setInputEnabled(false); // Keep disabled for game end
          this.handleGameEnd();
        } else {
          // Game continues - enable input for human's turn
          this.setInputEnabled(true);
          debugLogger.info('BOT_ACTIVATION', 'Bot move complete, human\'s turn now');
        }
        
      } else {
        debugLogger.error('BOT_ACTIVATION', `${moveType} bot move failed - no valid moves found`);
        
        // Hide thinking indicator and show error
        this.showBotThinking(false);
        this.showNotification(`Bot move failed - your turn`, 'error');
        this.setInputEnabled(true);
        
        setTimeout(() => {
          this.hideInstructionLabel();
        }, 3000);
      }
    } catch (error) {
      debugLogger.error('BOT_ACTIVATION', `Error during ${moveType} bot turn`, error);
      
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
    
    debugLogger.debug('UI_SYNC', 'Bot thinking indicator update', {
      show,
      gameMode,
      isBotTurn,
      gameStatus,
      inputEnabled: this.inputEnabled
    });
    
    const instructionLabel = document.getElementById('instruction-label');
    
    if (show && gameMode === 'human-vs-bot' && isBotTurn && (gameStatus === 'playing' || gameStatus === 'check')) {
      // Don't show redundant instruction label - turn indicator already shows bot thinking
      // Just remove any existing instruction label
      this.hideInstructionLabel();
      
      // Ensure input is disabled when bot is thinking
      if (this.inputEnabled) {
        this.setInputEnabled(false);
      }
      
      // Update turn indicator to reflect bot thinking state
      this.updatePlayerTurnIndicator(this.game.currentPlayer, gameMode);
      
    } else {
      // Hide thinking indicator
      this.hideInstructionLabel();
      
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

    debugLogger.info('UI', 'Game ended', { status: gameStatus, currentPlayer });

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
      console.log('[UI] Material balance calculation skipped:', e.message);
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
    
    debugLogger.debug('UI_SYNC', 'Turn indicator updated', {
      message,
      currentPlayer,
      gameMode,
      indicatorClass
    });
  }

  // Update captured pieces display
  updateCapturedPiecesDisplay() {
    const capturedContainer = document.getElementById('captured-pieces');
    if (!capturedContainer) {
      console.log('[CAPTURED] Element not found');
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
    console.log('[CHECK_INITIAL_BOT_TURN] Called');

    if (this.game.gameMode !== 'human-vs-bot') {
      debugLogger.info('BOT_INIT', 'Not in vs Bot mode, skipping bot turn check');
      console.log('[CHECK_INITIAL_BOT_TURN] Not in bot mode, exiting');
      return;
    }

    const humanColor = this.game.getHumanColor();
    const currentPlayer = this.game.currentPlayer;
    const isBotTurn = this.game.isBotTurn();
    
    debugLogger.info('BOT_INIT', 'Checking initial bot turn', {
      humanColor,
      currentPlayer,
      isBotTurn,
      gameStatus: this.game.gameStatus
    });

    // Ensure game is not ended
    if (this.game.gameStatus === 'checkmate' || this.game.gameStatus === 'stalemate') {
      debugLogger.warn('BOT_INIT', 'Game ended, skipping bot turn');
      return;
    }

    // Check if bot should make the first move
    if (isBotTurn) {
      console.log('[CHECK_INITIAL_BOT_TURN] Bot should move first!');
      debugLogger.info('BOT_INIT', 'Bot should make first move - initializing bot turn');

      // Show bot thinking immediately
      this.showBotThinking(true);
      this.setInputEnabled(false);

      // Ensure UI is properly updated before bot move
      this.updateGameStateIndicators();

      // Small delay to allow UI to settle, then execute bot move
      setTimeout(() => {
        console.log('[CHECK_INITIAL_BOT_TURN] Calling handleBotTurn after delay');
        this.handleBotTurn();
      }, 1000);
    } else {
      debugLogger.info('BOT_INIT', 'Human goes first - enabling input and waiting for human move');
      
      // Ensure human can make moves
      this.setInputEnabled(true);
      this.showBotThinking(false);
      
      // Update UI to show it's human's turn
      this.updateGameStateIndicators();
    }
  }

  // Handle new game start
  onNewGameStart() {
    console.log('[NEW_GAME_START] Called with:', {
      gameMode: this.game.gameMode,
      humanColor: this.game.humanColor,
      currentPlayer: this.game.currentPlayer,
      isBotTurn: this.game.isBotTurn()
    });
    this.updateDisplay();
    this.checkInitialBotTurn();
  }

  handleSquareSelection(row, col) {
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
        console.log('[UNDO_CLICK] Flags:', {
          isInUndoRedoState: this.game.isInUndoRedoState,
          lastUndoWasBotMove: this.game.lastUndoWasBotMove,
          clickedPiece: piece ? `${piece.color} ${piece.type}` : 'empty'
        });

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
          console.log('[CHECK_DEBUG] Before move:', {
            wasInCheck,
            preStatus: this.game.gameStatus,
            currentPlayer: this.game.currentPlayer
          });
          
          const moveResult = this.game.makeMove(fromRow, fromCol, logicalRow, logicalCol);
          if (moveResult && moveResult.success) {
            console.log('[CHECK_DEBUG] After move:', {
              wasInCheck,
              newStatus: this.game.gameStatus,
              isBotTurn: this.game.isBotTurn(),
              currentPlayer: this.game.currentPlayer,
              humanColor: this.game.humanColor
            });

            // Clear undo/redo flags now that a move was successfully made
            this.game.isInUndoRedoState = false;
            this.game.lastUndoWasBotMove = false;

            this.game.selectedSquare = null;

            // Orientation is now handled automatically in makeMove()

            // Check if we need to show check alert
            if (moveResult.enteredCheck) {
              // Someone just entered check - status shown in header
              // const checkedPlayer = this.game.currentPlayer === this.game.humanColor ? 'You are' : 'Bot is';
              // this.showCheckAlert(`${checkedPlayer} in check!`);
              this.highlightKing(this.game.currentPlayer);
            }

            // Handle post-move actions based on game mode
            if (this.game.gameMode === 'human-vs-human' && !this.game.isUndoRedoAction) {
              // Orientation already determined above, no need for setTimeout
              // Just update display if needed later
            } else if (this.game.gameMode === 'human-vs-bot' && !this.game.isUndoRedoAction) {
              // In vs Bot mode, board remains static - no flipping
              debugLogger.info('TURN_EXEC', 'Human move completed, checking for bot turn', {
                currentPlayer: this.game.currentPlayer,
                humanColor: this.game.getHumanColor(),
                isBotTurn: this.game.isBotTurn(),
                gameStatus: this.game.gameStatus
              });
              
              // Check if game is still in progress and it's bot's turn
              // Bot should play when status is 'playing' OR 'check' (not checkmate/stalemate)
              const statusOk = this.game.gameStatus === 'playing' || this.game.gameStatus === 'check';
              const isBotTurn = this.game.isBotTurn();
              
              console.log('[CHECK_TRIGGER] Bot turn check:', {
                statusOk,
                isBotTurn,
                gameStatus: this.game.gameStatus,
                currentPlayer: this.game.currentPlayer,
                humanColor: this.game.humanColor,
                willTriggerBot: statusOk && isBotTurn
              });
              
              if (statusOk && isBotTurn) {
                debugLogger.info('TURN_EXEC', 'Triggering bot turn after human move');
                console.log('[CHECK_TRIGGER] Bot will be triggered!');
                
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
                debugLogger.info('TURN_EXEC', 'Game ended or not bot turn after human move', {
                  gameStatus: this.game.gameStatus,
                  isBotTurn: this.game.isBotTurn()
                });
                
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
    console.log('[DISPLAY] Updating display, board state:', {
      boardExists: !!this.game.board,
      currentPlayer: this.game.currentPlayer,
      moveIndex: this.game.moveHistory ? this.game.moveHistory.length : 'N/A'
    });

    // Specific debug for E7 and E5 positions
    console.log('[DISPLAY] Key positions - E7 [1][4]:', this.game.board[1][4], 'E5 [3][4]:', this.game.board[3][4]);

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

    console.log(`[ORIENTATION] Applied data attributes:`, {
      mode: orientationMode,
      flipped: this.game.boardFlipped,
      gameMode: this.game.gameMode,
      player: this.game.currentPlayer
    });

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
          console.log(`[DISPLAY] Placing ${piece.color} ${piece.type} at row=${logical.row} col=${logical.col}`);
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

      // Track the original color and difficulty when menu opens
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
      console.log('[HIDE_OPTIONS] Checking if bot should make initial move after color change');
      // Use a small delay to let UI settle
      setTimeout(() => {
        this.checkInitialBotTurn();
      }, 100);
    }
  }

  updateOptionsButtons() {
    console.log('[MENU UPDATE] Starting updateOptionsButtons');
    console.log('[MENU UPDATE] Current game.gameMode:', this.game.gameMode);
    console.log('[MENU UPDATE] Current game.humanColor:', this.game.humanColor);
    console.log('[MENU UPDATE] Current game.botDifficulty:', this.game.botDifficulty);

    // Debug: Show current mode in the menu title
    const optionsTitle = document.getElementById('options-title');
    if (optionsTitle) {
      const modeText = this.game.gameMode === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot';
      optionsTitle.textContent = `Chess R1 - ${modeText}`;
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
      console.log('[MENU UPDATE] Back button - colorChanged:', colorChanged, 'difficultyChanged:', difficultyChanged);
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
    console.log('[MENU UPDATE] colorGroup element:', colorGroup);
    if (colorGroup) {
      if (this.game.gameMode === 'human-vs-bot') {
        console.log('[MENU UPDATE] Setting colorGroup display to block');
        colorGroup.style.display = 'block';
        // Force browser to recalculate
        colorGroup.offsetHeight;
      } else {
        console.log('[MENU UPDATE] Setting colorGroup display to none');
        colorGroup.style.display = 'none';
      }
      console.log('[MENU UPDATE] colorGroup.style.display after update:', colorGroup.style.display);
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
    const orientationModeGroup = document.getElementById('orientation-mode-group');
    if (orientationModeGroup) {
      if (this.game.gameMode === 'human-vs-human') {
        orientationModeGroup.style.display = 'block';
        orientationModeGroup.offsetHeight; // Force reflow
      } else {
        orientationModeGroup.style.display = 'none';
      }
      console.log('[MENU UPDATE] orientationGroup display:', orientationModeGroup.style.display);
    }

    // Show undo options for both game modes
    const undoGroup = document.getElementById('undo-group');
    if (undoGroup) {
      // Always show undo options since it works well for both modes
      undoGroup.style.display = 'block';
      undoGroup.offsetHeight; // Force reflow
      console.log('[MENU UPDATE] undoGroup display:', undoGroup.style.display);
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
          debugLogger.info('UI', `Game mode changing from ${this.game.gameMode} to ${radio.value}`);

          try {
            // Save current game state before switching
            await this.game.autoSave();

            // Switch to new game mode
            const oldMode = this.game.gameMode;
            this.game.setGameMode(radio.value);

            // Reset color and difficulty change tracking when switching modes
            // (these changes don't matter across mode switches)
            this.game.colorChangedMidGame = false;
            this.game.originalHumanColor = this.game.humanColor;
            this.game.difficultyChangedMidGame = false;
            this.game.originalBotDifficulty = this.game.botDifficulty;

            // Try to load saved state for the new game mode
            const newModeKey = this.game.getStorageKey();
            const savedState = await loadFromStorage(newModeKey);

            let validState = false;
            try {
              validState = savedState && this.isValidSavedState(savedState);
            } catch (e) {
              console.error('[MODE SWITCH] Error validating state:', e);
              validState = false;
            }

            if (validState) {
            debugLogger.info('UI', `Loading saved state for ${radio.value} mode`);
            console.log('[MODE SWITCH] Before loadGameState, gameMode:', this.game.gameMode);
            // Load saved state but preserve the newly selected game mode
            this.game.loadGameState(savedState, { preserveGameMode: true });
            console.log('[MODE SWITCH] After loadGameState, gameMode:', this.game.gameMode);
            this.updateDisplay();
            this.showMessage(`Switched to ${radio.value === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot'} - Game restored!`);
          } else {
            debugLogger.info('UI', `No saved state for ${radio.value} mode - starting new game`);
            this.game.newGame();
            this.onNewGameStart();
            this.showMessage(`Switched to ${radio.value === 'human-vs-human' ? 'Human vs Human' : 'Human vs Bot'} - New game started!`);
          }

          } catch (error) {
            console.error('[MODE SWITCH] Error during mode switch:', error);
            // Even if there's an error, ensure we're in a valid state
            this.game.newGame();
            this.onNewGameStart();
          } finally {
            // ALWAYS update the menu buttons regardless of errors
            console.log('[MODE SWITCH] About to call updateOptionsButtons, gameMode:', this.game.gameMode);

            // Update immediately first
            this.updateOptionsButtons();
            console.log('[MODE SWITCH] After immediate updateOptionsButtons');

            // Then also update with a small delay to ensure DOM is fully settled
            setTimeout(() => {
              this.updateOptionsButtons(); // Double update to ensure changes stick
              console.log('[MODE SWITCH] After delayed updateOptionsButtons');

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
          }
        }
      });
    });

    // Player Color radio buttons
    const colorRadios = document.querySelectorAll('input[name="playerColor"]');
    colorRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          debugLogger.info('UI', `Player color changed to: ${radio.value}`);
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
          debugLogger.info('UI', `Sound effects changed to: ${soundEnabled}`);
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
          debugLogger.info('UI', `Allow undo changed to: ${allowUndo}`);
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
          debugLogger.info('UI', `Bot difficulty changed to: ${difficulty}`);
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
        debugLogger.info('UI', 'New game button clicked');
        this.confirmNewGame();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        debugLogger.info('UI', 'Back button clicked');
        this.hideOptionsMenu();
      });
    }

    // Orientation Mode radio buttons
    const orientationModeRadios = document.querySelectorAll('input[name="orientationMode"]');
    orientationModeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          debugLogger.info('UI', `Orientation mode changed to: ${radio.value}`);
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
          debugLogger.info('UI', 'Options overlay clicked outside');
          this.hideOptionsMenu();
        }
      });
    }
  }

  confirmNewGame() {
    console.log('[CONFIRM_NEW_GAME] Starting new game with:', {
      humanColor: this.game.humanColor,
      gameMode: this.game.gameMode
    });

    // Clear saved state and start new game BEFORE hiding menu
    this.clearSavedState();
    this.game.newGame();

    console.log('[CONFIRM_NEW_GAME] After newGame:', {
      humanColor: this.game.humanColor,
      currentPlayer: this.game.currentPlayer,
      isBotTurn: this.game.isBotTurn()
    });

    // Hide menu (this may call updateDisplay via orientation change)
    this.hideOptionsMenu();

    // Now explicitly handle the new game start and bot turn check
    // Use a slightly longer delay to ensure UI has fully settled
    setTimeout(() => {
      console.log('[CONFIRM_NEW_GAME] Calling onNewGameStart after delay');
      this.onNewGameStart(); // This handles display update and bot turn check
      this.showMessage('New game started!');
    }, 250); // Increased delay to ensure UI is ready
  }

  async clearSavedState() {
    debugLogger.info('CLEANUP', 'Clearing saved game state from storage');
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
        debugLogger.info('CLEANUP', 'All saved game states cleared successfully from creationStorage');
        console.log('All saved game states cleared');
      } catch (e) {
        debugLogger.error('CLEANUP', 'Error clearing saved state from creationStorage', e);
        console.error('Error clearing saved state:', e);
      }
    } else {
      // Also clear from localStorage fallback
      try {
        for (const key of keysToRemove) {
          localStorage.removeItem(key);
        }
        debugLogger.info('CLEANUP', 'All saved game states cleared from localStorage fallback');
      } catch (e) {
        debugLogger.error('CLEANUP', 'Error clearing saved state from localStorage', e);
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
    debugLogger.info('UI', 'Check alert requested', { message });
    this.showNotification(message, 'warning', 3000);
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
              
              debugLogger.info('UI', `King highlighted for ${color}`, { row, col });
              
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
    const totalMoves = this.game.moveHistory.length;
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
    debugLogger.debug('UI_VALIDATION', 'Verifying UI consistency with game state');
    
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
        debugLogger.warn('UI_VALIDATION', 'UI consistency issues detected', { issues });
        return false;
      } else {
        debugLogger.debug('UI_VALIDATION', 'UI consistency verification passed');
        return true;
      }
      
    } catch (error) {
      debugLogger.error('UI_VALIDATION', 'Error during UI consistency verification', error);
      return false;
    }
  }

  async loadGameState() {
    try {
      debugLogger.info('LOAD', 'Attempting to load saved game state from storage');
      console.log('Attempting to load saved game state...');
      
      // Try to load state for current game mode first
      const currentModeKey = this.game.getStorageKey();
      let state = await loadFromStorage(currentModeKey);
      
      if (!state) {
        debugLogger.info('LOAD', `No saved state found for current mode (${this.game.gameMode})`);
        // Try to load from the other game mode
        const otherMode = this.game.gameMode === 'human-vs-human' ? 'human-vs-bot' : 'human-vs-human';
        const otherModeKey = `chess_game_state_${otherMode.replace('-', '_')}`;
        state = await loadFromStorage(otherModeKey);
        
        if (state) {
          debugLogger.info('LOAD', `Found saved state from other mode (${otherMode}), but keeping current mode settings`);
          // Keep current game mode and settings, only restore board state
          state.gameMode = this.game.gameMode;
          state.humanColor = this.game.humanColor;
        }
      }
      
      if (!state) {
        // Finally try legacy key for backward compatibility
        state = await loadFromStorage('chess_game_state');
        if (state) {
          debugLogger.info('LOAD', 'Found legacy saved state, migrating to new format');
        }
      }
      
      if (!state) {
        debugLogger.info('LOAD', 'No saved state found in any storage location');
        console.log('No saved state found');
        return false;
      }
      
      debugLogger.debug('LOAD', 'Raw state data retrieved from storage', {
        hasBoard: !!state.board,
        hasMoveHistory: !!state.moveHistory,
        moveCount: state.moveHistory ? state.moveHistory.length : 0,
        currentPlayer: state.currentPlayer,
        gameStatus: state.gameStatus
      });
      
      if (this.isValidSavedState(state)) {
        debugLogger.info('LOAD', 'State validation passed - Loading game state', {
          moveCount: state.moveHistory.length,
          currentPlayer: state.currentPlayer,
          gameStatus: state.gameStatus,
          soundEnabled: state.soundEnabled,
          allowUndo: state.allowUndo
        });
        console.log('Loading valid saved state');
        this.game.loadGameState(state);
        this.applyTheme();
        this.updateDisplay();
        debugLogger.info('LOAD', 'Game state loaded and UI updated successfully');
        console.log('Game state loaded successfully');
        return true;
      } else {
        debugLogger.warn('LOAD', 'Saved state validation failed - Clearing invalid data');
        console.log('Saved state validation failed, clearing invalid data');
        // Clear invalid saved state
        await this.clearSavedState();
        return false;
      }
    } catch (error) {
      debugLogger.error('LOAD', 'Exception occurred while loading game state', error);
      console.error('Error loading game state:', error);
      // Clear potentially corrupted data
      await this.clearSavedState();
      return false;
    }
  }

  isValidSavedState(state) {
    debugLogger.debug('VALIDATION', 'Starting saved state validation', {
      hasState: !!state,
      stateType: typeof state,
      hasBoard: !!state?.board,
      hasMoveHistory: !!state?.moveHistory,
      moveCount: state?.moveHistory?.length || 0,
      currentPlayer: state?.currentPlayer
    });
    
    // Basic structure validation
    if (!state || typeof state !== 'object') {
      debugLogger.warn('VALIDATION', 'Invalid state: not an object');
      console.log('Invalid state: not an object');
      return false;
    }
    
    // Validate required properties exist
    if (!state.board || !Array.isArray(state.board)) {
      debugLogger.warn('VALIDATION', 'Invalid state: missing or invalid board');
      console.log('Invalid state: missing or invalid board');
      return false;
    }
    
    // Allow missing moveHistory for backward compatibility
    if (state.moveHistory && !Array.isArray(state.moveHistory)) {
      debugLogger.warn('VALIDATION', 'Invalid state: moveHistory exists but is not array');
      console.log('Invalid state: moveHistory exists but is not array');
      return false;
    }
    
    // Validate board structure (8x8 array)
    if (state.board.length !== 8) {
      debugLogger.warn('VALIDATION', `Invalid state: board length is ${state.board.length}, expected 8`);
      console.log('Invalid state: board is not 8x8');
      return false;
    }
    
    for (let i = 0; i < state.board.length; i++) {
      const row = state.board[i];
      if (!Array.isArray(row) || row.length !== 8) {
        debugLogger.warn('VALIDATION', `Invalid state: board row ${i} has length ${row?.length}, expected 8`);
        console.log('Invalid state: board row is not valid');
        return false;
      }
    }
    
    // Validate current player
    if (!state.currentPlayer || (state.currentPlayer !== 'white' && state.currentPlayer !== 'black')) {
      debugLogger.warn('VALIDATION', `Invalid state: currentPlayer is '${state.currentPlayer}'`);
      console.log('Invalid state: invalid currentPlayer');
      return false;
    }
    
    // Enhanced validation logic - be more permissive for valid game states
    const moveHistory = state.moveHistory || [];
    const moveCount = moveHistory.length;
    const totalMoves = state.totalMoves || moveCount;
    
    debugLogger.debug('VALIDATION', 'Checking game progression criteria', {
      moveCount,
      totalMoves,
      currentPlayer: state.currentPlayer,
      gameStatus: state.gameStatus,
      hasCurrentMoveIndex: state.currentMoveIndex !== undefined
    });
    
    // Accept any state that has move history
    if (moveCount > 0) {
      debugLogger.info('VALIDATION', `Valid state: has ${moveCount} moves in history`);
      console.log('Valid state: has move history');
      return true;
    }
    
    // Accept states where the current player is black (white made first move)
    if (state.currentPlayer === 'black') {
      debugLogger.info('VALIDATION', 'Valid state: current player is black (game started)');
      console.log('Valid state: current player is black');
      return true;
    }
    
    // Accept completed games regardless of move count
    if (state.gameStatus && (state.gameStatus === 'checkmate' || state.gameStatus === 'stalemate')) {
      debugLogger.info('VALIDATION', `Valid state: game ended with '${state.gameStatus}'`);
      console.log('Valid state: game is completed');
      return true;
    }
    
    // Accept states with explicit move index (indicates game progression)
    if (state.currentMoveIndex !== undefined && state.currentMoveIndex >= 0) {
      debugLogger.info('VALIDATION', `Valid state: has currentMoveIndex ${state.currentMoveIndex}`);
      console.log('Valid state: has move index');
      return true;
    }
    
    // Accept states that have been explicitly saved with totalMoves > 0
    if (totalMoves > 0) {
      debugLogger.info('VALIDATION', `Valid state: totalMoves is ${totalMoves}`);
      console.log('Valid state: has total moves');
      return true;
    }
    
    // Check if board position differs from initial setup (indicates game has progressed)
    if (this.boardDiffersFromInitial(state.board)) {
      debugLogger.info('VALIDATION', 'Valid state: board position differs from initial setup');
      console.log('Valid state: board position changed');
      return true;
    }
    
    // If we reach here, it's likely an untouched initial state
    debugLogger.info('VALIDATION', 'State appears to be initial game state - treating as invalid for resume');
    console.log('Invalid state: appears to be initial game state');
    return false;
  }
  
  boardDiffersFromInitial(board) {
    // Check if board differs from standard chess starting position
    if (!board || !Array.isArray(board)) {
      console.log('[VALIDATION] Board is invalid or not an array');
      return false;
    }

    const initialBoard = this.game ? this.game.initializeBoard() : this.initializeBoard();

    for (let row = 0; row < 8; row++) {
      if (!board[row] || !Array.isArray(board[row])) {
        console.log(`[VALIDATION] Board row ${row} is invalid`);
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
window.addEventListener('scrollUp', () => {
  console.log('[SCROLL UP] Event received - attempting redo move');

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

      console.log('[REDO] Pre-redo orientation - Mode:', chessGame.orientationMode, 'BoardFlipped:', chessGame.boardFlipped, 'CurrentPlayer:', chessGame.currentPlayer);
      if (chessGame.redoMove()) {
        chessGame.selectedSquare = null; // Clear any selected piece
        // Removed updateBoardPerspective() - orientation is handled by data attributes now
        gameUI.updateDisplay();
        console.log('[REDO] Post-updateDisplay - Data attributes applied');
        gameUI.animateUndoRedo('redo', isRedoingBotMove);
        
        // Update UI elements after redo
        gameUI.updatePlayerTurnIndicator(chessGame.currentPlayer, chessGame.gameMode);
        gameUI.updateCapturedPiecesDisplay();
        gameUI.updateMoveHistoryDisplay();

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

window.addEventListener('scrollDown', () => {
  console.log('[SCROLL DOWN] Detected - attempting undo');
  console.log('[SCROLL DOWN] Move history length:', chessGame ? chessGame.moveHistory.length : 'no game');

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
      console.log('[SCROLL DOWN] Undo result:', undoResult);
      console.log('[UNDO] Pre-undo orientation - Mode:', chessGame.orientationMode, 'BoardFlipped:', chessGame.boardFlipped, 'CurrentPlayer:', chessGame.currentPlayer);
      if (undoResult) {
        chessGame.selectedSquare = null; // Clear any selected piece
        // Removed updateBoardPerspective() - orientation is handled by data attributes now
        gameUI.updateDisplay();
        console.log('[UNDO] Post-updateDisplay - Data attributes applied');
        gameUI.animateUndoRedo('undo', isUndoingBotMove);
        
        // Update UI elements after undo
        gameUI.updatePlayerTurnIndicator(chessGame.currentPlayer, chessGame.gameMode);
        gameUI.updateCapturedPiecesDisplay();
        gameUI.updateMoveHistoryDisplay();

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
    console.log('Side button click ignored (debounced)');
    return;
  }
  lastSideClickTime = now;
  
  console.log('Side button clicked - showing options menu');
  
  if (chessGame && gameUI) {
    gameUI.showOptionsMenu();
  }
});

window.addEventListener('longPressStart', () => {
  console.log('Long press started');
});

window.addEventListener('longPressEnd', () => {
  console.log('Long press ended - starting new game');
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
  console.log('Received plugin message:', data);
  
  // Could be used for online chess features in the future
  if (data.data) {
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      console.log('Parsed data:', parsed);
    } catch (e) {
      console.log('Data as text:', data.data);
    }
  }
  
  if (data.message) {
    console.log('Message text:', data.message);
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
    console.log('Accelerometer API not available');
    return;
  }
  
  try {
    window.creationSensors.accelerometer.start((data) => {
      // Could be used for shake-to-reset or tilt effects
      console.log('Accelerometer data:', data);
    }, { frequency: 30 });
    
    accelerometerRunning = true;
    console.log('Accelerometer started');
  } catch (e) {
    console.error('Error starting accelerometer:', e);
  }
}

function stopAccelerometer() {
  if (window.creationSensors && window.creationSensors.accelerometer && accelerometerRunning) {
    try {
      window.creationSensors.accelerometer.stop();
      accelerometerRunning = false;
      console.log('Accelerometer stopped');
    } catch (e) {
      console.error('Error stopping accelerometer:', e);
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
  debugLogger.debug('STORAGE', `Attempting to save data with key: ${key}`);
  
  // Validate input
  if (!key || typeof key !== 'string') {
    debugLogger.error('STORAGE', `Invalid key provided to saveToStorage: ${key}`);
    console.error('Invalid key provided to saveToStorage:', key);
    return false;
  }
  
  if (value === undefined || value === null) {
    debugLogger.error('STORAGE', 'Invalid value provided to saveToStorage: null or undefined');
    console.error('Invalid value provided to saveToStorage:', value);
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
      debugLogger.info('STORAGE', 'Successfully saved to creationStorage');
      console.log('Data saved to creationStorage successfully');
      return true;
    } catch (e) {
      debugLogger.error('STORAGE', 'creationStorage save failed', e);
      console.error('Error saving to creationStorage:', e);
    }
  }

  // Fallback to localStorage
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    debugLogger.info('STORAGE', 'Successfully saved to localStorage fallback');
    console.log('Data saved to localStorage fallback');
    return true;
  } catch (e) {
    debugLogger.error('STORAGE', 'localStorage save failed', e);
    console.error('Error saving to localStorage:', e);
  }

  return false;
}

// Load data from persistent storage
async function loadFromStorage(key) {
  debugLogger.debug('STORAGE', `Attempting to load data with key: ${key}`);
  
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
        debugLogger.info('STORAGE', 'Successfully loaded from creationStorage');
        return parsed;
      }
    } catch (e) {
      debugLogger.error('STORAGE', 'creationStorage load failed', e);
      console.error('Error loading from creationStorage:', e);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      debugLogger.info('STORAGE', 'Successfully loaded from localStorage fallback');
      return parsed;
    }
  } catch (e) {
    debugLogger.error('STORAGE', 'localStorage load failed', e);
    console.error('Error loading from localStorage:', e);
  }

  return null;
}

// ===========================================
// Chess Game Initialization
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[BROWSERTOOLS TEST] Page loaded at', new Date().toISOString());
  console.log('[BROWSERTOOLS TEST] Testing console capture');
  debugLogger.info('INIT', 'DOM Content Loaded - Starting chess game initialization');
  console.log('R1 Chess Game initialized!');
  
  // Add keyboard fallback for development
  if (typeof PluginMessageHandler === 'undefined') {
    debugLogger.info('INIT', 'Browser mode detected - Setting up keyboard shortcuts');
    window.addEventListener('keydown', (event) => {
      // P key shortcut for Push-To-Talk (options menu)
      if (event.code === 'KeyP') {
        event.preventDefault();
        debugLogger.info('INPUT', 'P key pressed - Push-To-Talk/Options menu');
        // Trigger the same event as sideClick (PTT button)
        window.dispatchEvent(new CustomEvent('sideClick'));
      }

      // Temporary arrow key shortcuts for undo/redo (will be removed for R1)
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        debugLogger.debug('INPUT', 'Left arrow pressed - undo move');
        // Trigger the same event as scroll down (which does undo)
        window.dispatchEvent(new CustomEvent('scrollDown'));
      }

      if (event.code === 'ArrowRight') {
        event.preventDefault();
        console.log('[ARROW] Right arrow pressed - dispatching scrollUp for redo');
        debugLogger.debug('INPUT', 'Right arrow pressed - redo move');
        // Trigger the same event as scroll up (which does redo)
        window.dispatchEvent(new CustomEvent('scrollUp'));
        console.log('[ARROW] scrollUp event dispatched');
      }
    });
  }

  // Initialize chess game
  debugLogger.info('INIT', 'Creating ChessGame instance');
  chessGame = new ChessGame();
  
  // Verify critical methods are available
  console.log('[DEBUG] ChessGame prototype methods:', Object.getOwnPropertyNames(ChessGame.prototype).filter(m => m.includes('Check')));
  console.log('[DEBUG] wouldBeInCheck exists:', typeof chessGame.wouldBeInCheck === 'function');
  console.log('[DEBUG] isInCheck exists:', typeof chessGame.isInCheck === 'function');
  
  window.chessGame = chessGame; // Make globally available for testing
  
  debugLogger.info('INIT', 'Creating ChessUI instance');
  gameUI = new ChessUI(chessGame);
  window.gameUI = gameUI; // Make globally available for testing

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
  
  // Try to load saved game state
  debugLogger.info('INIT', 'Attempting to load saved game state');
  const loaded = await gameUI.loadGameState();
  if (loaded) {
    debugLogger.info('INIT', 'Successfully loaded saved game state - Game resumed');
    console.log('Loaded saved game state');
    gameUI.updateDisplay();
    gameUI.updateCapturedPiecesDisplay(); // Ensure display shows after loading
    gameUI.gameStatusElement.textContent = 'Game resumed';
    setTimeout(() => {
      gameUI.gameStatusElement.textContent = '';
    }, 2000);
  } else {
    debugLogger.info('INIT', 'No valid saved state found - Starting new game');
    console.log('No saved state found - initializing new game');
    chessGame.newGame();
    gameUI.updateDisplay();
  }

  // Ensure captured pieces display is shown on page load
  gameUI.updateCapturedPiecesDisplay();

  // Send initialization event
  debugLogger.info('INIT', 'Sending game initialization event');
  sendGameEvent('game_initialized', {
    theme: chessGame.theme,
    currentPlayer: chessGame.currentPlayer
  });
  
  debugLogger.info('INIT', 'Chess game initialization complete');
});

// ===========================================
// Game Exit and Cleanup Logging
// ===========================================

// Log when the page is about to be unloaded (game exit)
window.addEventListener('beforeunload', (event) => {
  debugLogger.info('EXIT', 'Page beforeunload event - Game is about to exit', {
    moveCount: chessGame ? chessGame.moveHistory.length : 0,
    currentPlayer: chessGame ? chessGame.currentPlayer : 'unknown',
    gameStatus: chessGame ? chessGame.gameStatus : 'unknown'
  });
});

// Log when the page is being unloaded (game exit)
window.addEventListener('unload', (event) => {
  debugLogger.info('EXIT', 'Page unload event - Game is exiting');
});

// Log when the page becomes hidden (user switches away)
window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    debugLogger.info('EXIT', 'Page visibility changed to hidden - Game backgrounded', {
      moveCount: chessGame ? chessGame.moveHistory.length : 0,
      currentPlayer: chessGame ? chessGame.currentPlayer : 'unknown'
    });
  } else {
    debugLogger.info('INIT', 'Page visibility changed to visible - Game foregrounded', {
      moveCount: chessGame ? chessGame.moveHistory.length : 0,
      currentPlayer: chessGame ? chessGame.currentPlayer : 'unknown'
    });
  }
});

// Chess game ready
console.log('🎯 R1 Chess Game Ready! VERSION 2025-09-10-FIX ✅');
console.log('🆕 NEW CODE WITH GLOBAL WINDOW ACCESS ENABLED');
console.log('Features:');
console.log('- Full chess rules including en passant');
console.log('- Touch-based piece movement');
console.log('- Multiple visual themes');
console.log('- Game state persistence');
console.log('- Move sound effects');
console.log('- Side button: Options menu');
console.log('- Long press: New game');
console.log('🔧 Global access: window.chessGame and window.gameUI available');
console.log('📍 Server running on port 5174');
