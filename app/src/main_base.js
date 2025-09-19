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
  !function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("js-chess-engine",[],e):"object"==typeof exports?exports["js-chess-engine"]=e():t["js-chess-engine"]=e()}(lib,(function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)i.d(n,o,function(e){return t[e]}.bind(null,o));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";i.r(e),i.d(e,"Game",(function(){return $})),i.d(e,"moves",(function(){return J})),i.d(e,"status",(function(){return V})),i.d(e,"getFen",(function(){return Y})),i.d(e,"move",(function(){return z})),i.d(e,"aiMove",(function(){return X}));const n=["A","B","C","D","E","F","G","H"],o=["1","2","3","4","5","6","7","8"],s={KING_W:"K",QUEEN_W:"Q",ROOK_W:"R",BISHOP_W:"B",KNIGHT_W:"N",PAWN_W:"P",KING_B:"k",QUEEN_B:"q",ROOK_B:"r",BISHOP_B:"b",KNIGHT_B:"n",PAWN_B:"p"},r="black",c="white",l=[0,1,2,3,4],a={0:1,1:2,2:2,3:3,4:3,5:4},u={0:2,1:2,2:4,3:4,4:5,5:5},h={fullMove:1,halfMove:0,enPassant:null,isFinished:!1,checkMate:!1,check:!1,turn:c},g=Object.assign({pieces:{E1:"K",D1:"Q",A1:"R",H1:"R",C1:"B",F1:"B",B1:"N",G1:"N",A2:"P",B2:"P",C2:"P",D2:"P",E2:"P",F2:"P",G2:"P",H2:"P",E8:"k",D8:"q",A8:"r",H8:"r",C8:"b",F8:"b",B8:"n",G8:"n",A7:"p",B7:"p",C7:"p",D7:"p",E7:"p",F7:"p",G7:"p",H7:"p"},castling:{whiteShort:!0,blackShort:!0,whiteLong:!0,blackLong:!0}},h),f={UP:{A1:"A2",A2:"A3",A3:"A4",A4:"A5",A5:"A6",A6:"A7",A7:"A8",A8:null,B1:"B2",B2:"B3",B3:"B4",B4:"B5",B5:"B6",B6:"B7",B7:"B8",B8:null,C1:"C2",C2:"C3",C3:"C4",C4:"C5",C5:"C6",C6:"C7",C7:"C8",C8:null,D1:"D2",D2:"D3",D3:"D4",D4:"D5",D5:"D6",D6:"D7",D7:"D8",D8:null,E1:"E2",E2:"E3",E3:"E4",E4:"E5",E5:"E6",E6:"E7",E7:"E8",E8:null,F1:"F2",F2:"F3",F3:"F4",F4:"F5",F5:"F6",F6:"F7",F7:"F8",F8:null,G1:"G2",G2:"G3",G3:"G4",G4:"G5",G5:"G6",G6:"G7",G7:"G8",G8:null,H1:"H2",H2:"H3",H3:"H4",H4:"H5",H5:"H6",H6:"H7",H7:"H8",H8:null},DOWN:{A1:null,A2:"A1",A3:"A2",A4:"A3",A5:"A4",A6:"A5",A7:"A6",A8:"A7",B1:null,B2:"B1",B3:"B2",B4:"B3",B5:"B4",B6:"B5",B7:"B6",B8:"B7",C1:null,C2:"C1",C3:"C2",C4:"C3",C5:"C4",C6:"C5",C7:"C6",C8:"C7",D1:null,D2:"D1",D3:"D2",D4:"D3",D5:"D4",D6:"D5",D7:"D6",D8:"D7",E1:null,E2:"E1",E3:"E2",E4:"E3",E5:"E4",E6:"E5",E7:"E6",E8:"E7",F1:null,F2:"F1",F3:"F2",F4:"F3",F5:"F4",F6:"F5",F7:"F6",F8:"F7",G1:null,G2:"G1",G3:"G2",G4:"G3",G5:"G4",G6:"G5",G7:"G6",G8:"G7",H1:null,H2:"H1",H3:"H2",H4:"H3",H5:"H4",H6:"H5",H7:"H6",H8:"H7"},LEFT:{A1:null,A2:null,A3:null,A4:null,A5:null,A6:null,A7:null,A8:null,B1:"A1",B2:"A2",B3:"A3",B4:"A4",B5:"A5",B6:"A6",B7:"A7",B8:"A8",C1:"B1",C2:"B2",C3:"B3",C4:"B4",C5:"B5",C6:"B6",C7:"B7",C8:"B8",D1:"C1",D2:"C2",D3:"C3",D4:"C4",D5:"C5",D6:"C6",D7:"C7",D8:"C8",E1:"D1",E2:"D2",E3:"D3",E4:"D4",E5:"D5",E6:"D6",E7:"D7",E8:"D8",F1:"E1",F2:"E2",F3:"E3",F4:"E4",F5:"E5",F6:"E6",F7:"E7",F8:"E8",G1:"F1",G2:"F2",G3:"F3",G4:"F4",G5:"F5",G6:"F6",G7:"F7",G8:"F8",H1:"G1",H2:"G2",H3:"G3",H4:"G4",H5:"G5",H6:"G6",H7:"G7",H8:"G8"},RIGHT:{A1:"B1",A2:"B2",A3:"B3",A4:"B4",A5:"B5",A6:"B6",A7:"B7",A8:"B8",B1:"C1",B2:"C2",B3:"C3",B4:"C4",B5:"C5",B6:"C6",B7:"C7",B8:"C8",C1:"D1",C2:"D2",C3:"D3",C4:"D4",C5:"D5",C6:"D6",C7:"D7",C8:"D8",D1:"E1",D2:"E2",D3:"E3",D4:"E4",D5:"E5",D6:"E6",D7:"E7",D8:"E8",E1:"F1",E2:"F2",E3:"F3",E4:"F4",E5:"F5",E6:"F6",E7:"F7",E8:"F8",F1:"G1",F2:"G2",F3:"G3",F4:"G4",F5:"G5",F6:"G6",F7:"G7",F8:"G8",G1:"H1",G2:"H2",G3:"H3",G4:"H4",G5:"H5",G6:"H6",G7:"H7",G8:"H8",H1:null,H2:null,H3:null,H4:null,H5:null,H6:null,H7:null,H8:null},UP_LEFT:{A1:null,A2:null,A3:null,A4:null,A5:null,A6:null,A7:null,A8:null,B1:"A2",B2:"A3",B3:"A4",B4:"A5",B5:"A6",B6:"A7",B7:"A8",B8:null,C1:"B2",C2:"B3",C3:"B4",C4:"B5",C5:"B6",C6:"B7",C7:"B8",C8:null,D1:"C2",D2:"C3",D3:"C4",D4:"C5",D5:"C6",D6:"C7",D7:"C8",D8:null,E1:"D2",E2:"D3",E3:"D4",E4:"D5",E5:"D6",E6:"D7",E7:"D8",E8:null,F1:"E2",F2:"E3",F3:"E4",F4:"E5",F5:"E6",F6:"E7",F7:"E8",F8:null,G1:"F2",G2:"F3",G3:"F4",G4:"F5",G5:"F6",G6:"F7",G7:"F8",G8:null,H1:"G2",H2:"G3",H3:"G4",H4:"G5",H5:"G6",H6:"G7",H7:"G8",H8:null},DOWN_RIGHT:{A1:null,A2:"B1",A3:"B2",A4:"B3",A5:"B4",A6:"B5",A7:"B6",A8:"B7",B1:null,B2:"C1",B3:"C2",B4:"C3",B5:"C4",B6:"C5",B7:"C6",B8:"C7",C1:null,C2:"D1",C3:"D2",C4:"D3",C5:"D4",C6:"D5",C7:"D6",C8:"D7",D1:null,D2:"E1",D3:"E2",D4:"E3",D5:"E4",D6:"E5",D7:"E6",D8:"E7",E1:null,E2:"F1",E3:"F2",E4:"F3",E5:"F4",E6:"F5",E7:"F6",E8:"F7",F1:null,F2:"G1",F3:"G2",F4:"G3",F5:"G4",F6:"G5",F7:"G6",F8:"G7",G1:null,G2:"H1",G3:"H2",G4:"H3",G5:"H4",G6:"H5",G7:"H6",G8:"H7",H1:null,H2:null,H3:null,H4:null,H5:null,H6:null,H7:null,H8:null},UP_RIGHT:{A1:"B2",A2:"B3",A3:"B4",A4:"B5",A5:"B6",A6:"B7",A7:"B8",A8:null,B1:"C2",B2:"C3",B3:"C4",B4:"C5",B5:"C6",B6:"C7",B7:"C8",B8:null,C1:"D2",C2:"D3",C3:"D4",C4:"D5",C5:"D6",C6:"D7",C7:"D8",C8:null,D1:"E2",D2:"E3",D3:"E4",D4:"E5",D5:"E6",D6:"E7",D7:"E8",D8:null,E1:"F2",E2:"F3",E3:"F4",E4:"F5",E5:"F6",E6:"F7",E7:"F8",E8:null,F1:"G2",F2:"G3",F3:"G4",F4:"G5",F5:"G6",F6:"G7",F7:"G8",F8:null,G1:"H2",G2:"H3",G3:"H4",G4:"H5",G5:"H6",G6:"H7",G7:"H8",G8:null,H1:null,H2:null,H3:null,H4:null,H5:null,H6:null,H7:null,H8:null},DOWN_LEFT:{A1:null,A2:null,A3:null,A4:null,A5:null,A6:null,A7:null,A8:null,B1:null,B2:"A1",B3:"A2",B4:"A3",B5:"A4",B6:"A5",B7:"A6",B8:"A7",C1:null,C2:"B1",C3:"B2",C4:"B3",C5:"B4",C6:"B5",C7:"B6",C8:"B7",D1:null,D2:"C1",D3:"C2",D4:"C3",D5:"C4",D6:"C5",D7:"C6",D8:"C7",E1:null,E2:"D1",E3:"D2",E4:"D3",E5:"D4",E6:"D5",E7:"D6",E8:"D7",F1:null,F2:"E1",F3:"E2",F4:"E3",F5:"E4",F6:"E5",F7:"E6",F8:"E7",G1:null,G2:"F1",G3:"F2",G4:"F3",G5:"F4",G6:"F5",G7:"F6",G8:"F7",H1:null,H2:"G1",H3:"G2",H4:"G3",H5:"G4",H6:"G5",H7:"G6",H8:"G7"}},C=[[0,0,0,0,0,0,0,0],[5,5,5,5,5,5,5,5],[1,1,2,3,3,2,1,1],[.5,.5,1,2.5,2.5,1,.5,.5],[0,0,0,2,2,0,0,0],[.5,0,1,0,0,1,0,.5],[.5,0,0,-2,-2,0,0,.5],[0,0,0,0,0,0,0,0]],P=[[-4,-3,-2,-2,-2,-2,-3,-4],[-3,-2,0,0,0,0,-2,-3],[-2,0,1,1.5,1.5,1,0,-2],[-2,.5,1.5,2,2,1.5,.5,-2],[-2,0,1.5,2,2,1.5,0,-2],[-2,.5,1,1.5,1.5,1,.5,-2],[-3,-2,0,.5,.5,0,-2,-3],[-4,-3,-2,-2,-2,-2,-3,-4]],p=[[-2,-1,-1,-1,-1,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,.5,1,1,.5,0,-1],[-1,.5,.5,1,1,.5,.5,-1],[-1,0,1,1,1,1,0,-1],[-1,1,1,1,1,1,1,-1],[-1,.5,0,0,0,0,.5,-1],[-2,-1,-1,-1,-1,-1,-1,-2]],E=[[0,0,0,0,0,0,0,0],[.5,1,1,1,1,1,1,.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[-.5,0,0,0,0,0,0,-.5],[0,0,0,.5,.5,0,0,0]],B=[[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-3,-4,-4,-5,-5,-4,-4,-3],[-2,-3,-3,-4,-4,-3,-3,-2],[-1,-2,-2,-2,-2,-2,-2,-1],[2,2,0,0,0,0,2,2],[2,3,1,0,0,1,3,2]],F=[[-2,-1,-1,-.5,-.5,-1,-1,-2],[-1,0,0,0,0,0,0,-1],[-1,0,.5,.5,.5,.5,0,-1],[-.5,0,.5,.5,.5,.5,0,-.5],[0,0,.5,.5,.5,.5,0,-.5],[-1,.5,.5,.5,.5,.5,0,-1],[-1,0,.5,0,0,0,0,-1],[-2,-1,-1,-.5,-.5,-1,-1,-2]],G={P:C.slice().reverse(),p:C,N:P.slice().reverse(),n:P,B:p.slice().reverse(),b:p,R:E.slice().reverse(),r:E,K:B.slice().reverse(),k:B,Q:F.slice().reverse(),q:F};function D(t){return f.UP[t]}function A(t){return f.DOWN[t]}function H(t){return f.LEFT[t]}function b(t){return f.RIGHT[t]}function d(t){return f.UP_LEFT[t]}function v(t){return f.UP_RIGHT[t]}function k(t){return f.DOWN_LEFT[t]}function y(t){return f.DOWN_RIGHT[t]}function w(t){const e=d(t);return e?D(e):null}function O(t){const e=d(t);return e?H(e):null}function L(t){const e=v(t);return e?D(e):null}function m(t){const e=v(t);return e?b(e):null}function M(t){const e=k(t);return e?A(e):null}function K(t){const e=k(t);return e?H(e):null}function N(t){const e=y(t);return e?A(e):null}function S(t){const e=y(t);return e?b(e):null}function j(t,e){return e===c?f.UP[t]:f.DOWN[t]}function _(t,e){return e===c?f.UP_LEFT[t]:f.DOWN_RIGHT[t]}function W(t,e){return e===c?f.UP_RIGHT[t]:f.DOWN_LEFT[t]}function U(t,e){return e===c?f.DOWN_LEFT[t]:f.UP_RIGHT[t]}function R(t,e){return e===c?f.DOWN_RIGHT[t]:f.UP_LEFT[t]}function T(t){return{k:10,q:9,r:5,b:3,n:3,p:1}[t.toLowerCase()]||0}function I(t){return"string"==typeof t&&t.match("^[a-hA-H]{1}[1-8]{1}$")}const x=-1e3,Q=1e3;class q{constructor(t=JSON.parse(JSON.stringify(g))){if("object"==typeof t)this.configuration=Object.assign({},h,t);else{if("string"!=typeof t)throw new Error(`Unknown configuration type ${typeof config}.`);this.configuration=Object.assign({},h,function(t=""){const[e,i,s,l,a,u]=t.split(" "),h={pieces:Object.fromEntries(e.split("/").flatMap((t,e)=>{let i=0;return t.split("").reduce((t,s)=>{const r=s.match(/k|b|q|n|p|r/i);r&&(t.push([`${n[i]}${o[7-e]}`,r[0]]),i+=1);const c=s.match(/[1-8]/);return c&&(i+=Number(c)),t},[])}))};return h.turn="b"===i?r:c,h.castling={whiteLong:!1,whiteShort:!1,blackLong:!1,blackShort:!1},s.includes("K")&&(h.castling.whiteShort=!0),s.includes("k")&&(h.castling.blackShort=!0),s.includes("Q")&&(h.castling.whiteLong=!0),s.includes("q")&&(h.castling.blackLong=!0),I(l)&&(h.enPassant=l.toUpperCase()),h.halfMove=parseInt(a),h.fullMove=parseInt(u),h}(t))}this.configuration.castling||(this.configuration.castling={whiteShort:!0,blackShort:!0,whiteLong:!0,blackLong:!0}),this.history=[]}getAttackingFields(t=this.getPlayingColor()){let e=[];for(const i in this.configuration.pieces){const n=this.getPiece(i);this.getPieceColor(n)===t&&(e=[...e,...this.getPieceMoves(n,i)])}return e}isAttackingKing(t=this.getPlayingColor()){let e=null;for(const i in this.configuration.pieces){const n=this.getPiece(i);if(this.isKing(n)&&this.getPieceColor(n)!==t){e=i;break}}return this.isPieceUnderAttack(e)}isPieceUnderAttack(t){const e=this.getPieceOnLocationColor(t),i=this.getEnemyColor(e);let n=!1,o=t,s=0;for(;D(o)&&!n;){o=D(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;A(o)&&!n;){o=A(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;H(o)&&!n;){o=H(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;b(o)&&!n;){o=b(o),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isRook(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;W(o,e)&&!n;){o=W(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||1===s&&(this.isKing(t)||this.isPawn(t)))&&(n=!0),t)break}for(o=t,s=0;_(o,e)&&!n;){o=_(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||1===s&&(this.isKing(t)||this.isPawn(t)))&&(n=!0),t)break}for(o=t,s=0;R(o,e)&&!n;){o=R(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}for(o=t,s=0;U(o,e)&&!n;){o=U(o,e),s++;const t=this.getPiece(o);if(t&&this.getPieceColor(t)===i&&(this.isBishop(t)||this.isQueen(t)||this.isKing(t)&&1===s)&&(n=!0),t)break}o=L(t);let r=this.getPiece(o);return r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=m(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=O(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=w(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=M(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=K(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=N(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),o=S(t),r=this.getPiece(o),r&&this.getPieceColor(r)===i&&this.isKnight(r)&&(n=!0),n}hasPlayingPlayerCheck(){return this.isAttackingKing(this.getNonPlayingColor())}hasNonPlayingPlayerCheck(){return this.isAttackingKing(this.getPlayingColor())}getLowestValuePieceAttackingLocation(t,e=this.getPlayingColor()){let i=null;for(const n in this.configuration.pieces){const o=this.getPiece(n);this.getPieceColor(o)===e&&this.getPieceMoves(o,n).map(e=>{e===t&&(null===i||T(o)<i)&&(i=T(o))})}return i}getMoves(t=this.getPlayingColor(),e=null){const i={};let n=0;for(const e in this.configuration.pieces){const o=this.getPiece(e);if(this.getPieceColor(o)===t){const t=this.getPieceMoves(o,e);t.length&&n++,Object.assign(i,{[e]:t})}}const o=this.getAttackingFields(this.getNonPlayingColor());if(this.isLeftCastlingPossible(o)&&(this.isPlayingWhite()&&i.E1.push("C1"),this.isPlayingBlack()&&i.E8.push("C8")),this.isRightCastlingPossible(o)&&(this.isPlayingWhite()&&i.E1.push("G1"),this.isPlayingBlack()&&i.E8.push("G8")),e&&n>e)return i;const s={};for(const t in i)i[t].map(e=>{const i={pieces:Object.assign({},this.configuration.pieces),castling:Object.assign({},this.configuration.castling)},n=new q(i);n.move(t,e),(this.isPlayingWhite()&&!n.isAttackingKing(r)||this.isPlayingBlack()&&!n.isAttackingKing(c))&&(s[t]||(s[t]=[]),s[t].push(e))});return Object.keys(s).length||(this.configuration.isFinished=!0,this.hasPlayingPlayerCheck()&&(this.configuration.checkMate=!0)),s}isLeftCastlingPossible(t){if(this.isPlayingWhite()&&!this.configuration.castling.whiteLong)return!1;if(this.isPlayingBlack()&&!this.configuration.castling.blackLong)return!1;let e=null;if(this.isPlayingWhite()&&"K"===this.getPiece("E1")&&"R"===this.getPiece("A1")&&!t.includes("E1")?e="E1":this.isPlayingBlack()&&"k"===this.getPiece("E8")&&"r"===this.getPiece("A8")&&!t.includes("E8")&&(e="E8"),!e)return!1;let i=H(e);return!this.getPiece(i)&&!t.includes(i)&&(i=H(i),!this.getPiece(i)&&!t.includes(i)&&(i=H(i),!this.getPiece(i)))}isRightCastlingPossible(t){if(this.isPlayingWhite()&&!this.configuration.castling.whiteShort)return!1;if(this.isPlayingBlack()&&!this.configuration.castling.blackShort)return!1;let e=null;if(this.isPlayingWhite()&&"K"===this.getPiece("E1")&&"R"===this.getPiece("H1")&&!t.includes("E1")?e="E1":this.isPlayingBlack()&&"k"===this.getPiece("E8")&&"r"===this.getPiece("H8")&&!t.includes("E8")&&(e="E8"),!e)return!1;let i=b(e);return!this.getPiece(i)&&!t.includes(i)&&(i=b(i),!this.getPiece(i)&&!t.includes(i))}getPieceMoves(t,e){return this.isPawn(t)?this.getPawnMoves(t,e):this.isKnight(t)?this.getKnightMoves(t,e):this.isRook(t)?this.getRookMoves(t,e):this.isBishop(t)?this.getBishopMoves(t,e):this.isQueen(t)?this.getQueenMoves(t,e):this.isKing(t)?this.getKingMoves(t,e):[]}getPawnMoves(t,e){let i=[];const n=this.getPieceColor(t);let o=j(e,n);return o&&!this.getPiece(o)&&(i.push(o),"2"===e[1]&&"white"===n||"7"===e[1]&&"black"===n)&&(o=j(o,n),o&&!this.getPiece(o)&&i.push(o)),o=_(e,n),o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o),o=W(e,n),o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o),this.configuration.enPassant&&(e[1]===("white"===n?"5":"4")&&(e[0]===this.configuration.enPassant[0]||e[0]===String.fromCharCode(this.configuration.enPassant.charCodeAt(0)+1)||e[0]===String.fromCharCode(this.configuration.enPassant.charCodeAt(0)-1))&&(o=this.configuration.enPassant,i.push(o))),i}getRookMoves(t,e){let i=[];const n=this.getPieceColor(t);let o=e;for(;(o=D(o))&&!this.getPiece(o);)i.push(o);o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o);for(o=e;(o=A(o))&&!this.getPiece(o);)i.push(o);o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o);for(o=e;(o=H(o))&&!this.getPiece(o);)i.push(o);o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o);for(o=e;(o=b(o))&&!this.getPiece(o);)i.push(o);return o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o),i}getBishopMoves(t,e){let i=[];const n=this.getPieceColor(t);let o=e;for(;(o=d(o))&&!this.getPiece(o);)i.push(o);o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o);for(o=e;(o=v(o))&&!this.getPiece(o);)i.push(o);o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o);for(o=e;(o=k(o))&&!this.getPiece(o);)i.push(o);o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o);for(o=e;(o=y(o))&&!this.getPiece(o);)i.push(o);return o&&this.getPiece(o)&&this.getPieceColor(this.getPiece(o))!==n&&i.push(o),i}getQueenMoves(t,e){return[...this.getRookMoves(t,e),...this.getBishopMoves(t,e)]}getKnightMoves(t,e){const i=[];return[w(e),O(e),L(e),m(e),M(e),K(e),N(e),S(e)].forEach(e=>{if(e){const o=this.getPiece(e);o&&this.getPieceColor(o)===this.getPieceColor(t)||i.push(e)}}),i}getKingMoves(t,e){const i=[];return[D(e),A(e),H(e),b(e),d(e),v(e),k(e),y(e)].forEach(e=>{if(e){const o=this.getPiece(e);o&&this.getPieceColor(o)===this.getPieceColor(t)||i.push(e)}}),i}move(t,e,i=null){const n=this.getPiece(t),o=this.getPiece(e);if(!n)throw new Error(`There is no piece on ${t}.`);if(this.getPieceColor(n)!==this.getPlayingColor())throw new Error(`It's not ${this.getPieceColor(n)} turn.`);if(!this.getPieceMoves(n,t).includes(e))throw new Error(`Piece ${n} can not move from ${t} to ${e}.`);const s=t;if(this.move=t+"-"+e,this.configuration.fullMove+=this.isPlayingBlack()?1:0,this.configuration.halfMove+=1,!this.isPawn(n)&&!o||this.configuration.halfMove>50||this.configuration.halfMove<0)this.configuration.halfMove=0;if(this.configuration.enPassant=null,this.configuration.turn=this.isPlayingWhite()?"black":"white",this.removePiece(s),this.addPiece(e,n),o&&this.history.push(`${n}:${t}-${e}x${o}`),this.isKing(n)){const i=s[0],n=e[0];if("E"===i&&"C"===n){let i=this.isPlayingWhite()?"1":"8";this.removePiece("A"+i),this.addPiece("D"+i,this.isPlayingWhite()?"R":"r")}else if("E"===i&&"G"===n){let i=this.isPlayingWhite()?"1":"8";this.removePiece("H"+i),this.addPiece("F"+i,this.isPlayingWhite()?"R":"r")}this.isPlayingWhite()?(this.configuration.castling.whiteShort=!1,this.configuration.castling.whiteLong=!1):(this.configuration.castling.blackShort=!1,this.configuration.castling.blackLong=!1)}if(this.isRook(n))if("A1"===s)this.configuration.castling.whiteLong=!1;else if("H1"===s)this.configuration.castling.whiteShort=!1;else if("A8"===s)this.configuration.castling.blackLong=!1;else if("H8"===s)this.configuration.castling.blackShort=!1;if(this.isPawn(n)){if("2"===s[1]&&"4"===e[1]||"7"===s[1]&&"5"===e[1])this.configuration.enPassant=e;else if(e===this.configuration.enPassant){const t=e[0]+s[1];this.removePiece(t)}("8"===e[1]||"1"===e[1])&&(i=i||"q",this.removePiece(e),this.addPiece(e,this.isPlayingWhite()?"Q":"q"===i.toLowerCase()?"q":i.toUpperCase()))}return this.configuration.check=this.hasNonPlayingPlayerCheck(),this.configuration.checkMate=this.configuration.check&&0===Object.keys(this.getMoves(this.getNonPlayingColor())).length,this.configuration.isFinished=this.configuration.checkMate,this.configuration}exportJson(){return JSON.stringify(this.configuration)}loadJson(t){return this.configuration=JSON.parse(t),this.configuration}getPlayingColor(){return this.configuration.turn}getNonPlayingColor(){return this.isPlayingWhite()?"black":"white"}isPlayingWhite(){return"white"===this.getPlayingColor()}isPlayingBlack(){return"black"===this.getPlayingColor()}getPiece(t){return this.configuration.pieces[t]}addPiece(t,e){this.configuration.pieces[t]=e}removePiece(t){delete this.configuration.pieces[t]}isPiece(t,e){return!!this.getPiece(t)&&this.getPiece(t).toLowerCase()===e.toLowerCase()}isPawn(t){return"p"===t.toLowerCase()}isRook(t){return"r"===t.toLowerCase()}isKnight(t){return"n"===t.toLowerCase()}isBishop(t){return"b"===t.toLowerCase()}isQueen(t){return"q"===t.toLowerCase()}isKing(t){return"k"===t.toLowerCase()}getPieceColor(t){return t&&t===t.toUpperCase()?"white":"black"}getPieceOnLocationColor(t){return this.getPieceColor(this.getPiece(t))}aiMove(t=2){t=Math.max(0,Math.min(t,4));const e=this.getMoves(this.getPlayingColor());if(0===Object.keys(e).length)return null;const i=JSON.parse(JSON.stringify(this.configuration));if(0===t){const t=Object.keys(e),i=t[Math.floor(Math.random()*t.length)],n=e[i][Math.floor(Math.random()*e[i].length)];return this.move(i,n),{[i]:n}}return this.makeBestMove(e,t),{[this.move]:null}}makeBestMove(t,e){let i=this.isPlayingWhite()?x:Q,n=null;for(const o in t)for(const s of t[o]){const t={pieces:Object.assign({},this.configuration.pieces),castling:Object.assign({},this.configuration.castling),turn:this.configuration.turn},r=new q(t);r.move(o,s);const c=this.minimax(r,e-1,!this.isPlayingWhite(),x,Q);(this.isPlayingWhite()&&c>i||this.isPlayingBlack()&&c<i)&&(i=c,n={from:o,to:s})}n&&this.move(n.from,n.to)}minimax(t,e,i,n,o){if(0===e||t.configuration.isFinished)return this.evaluatePosition(t);const s=t.getMoves(i?"white":"black");if(0===Object.keys(s).length)return t.hasPlayingPlayerCheck()?i?x:Q:0;let r=i?x:Q;for(const c in s)for(const l of s[c]){const s={pieces:Object.assign({},t.configuration.pieces),castling:Object.assign({},t.configuration.castling),turn:t.configuration.turn},h=new q(s);h.move(c,l);const g=this.minimax(h,e-1,!i,n,o);if(i){if(r=Math.max(r,g),n=Math.max(n,g),o<=n)break}else{if(r=Math.min(r,g),o=Math.min(o,g),o<=n)break}}return r}evaluatePosition(t){if(t.configuration.checkMate)return t.isPlayingWhite()?x:Q;let e=0;for(const i in t.configuration.pieces){const n=t.getPiece(i),o=T(n),s=this.getPieceSquareValue(n,i);e+=t.getPieceColor(n)==="white"?o+s:-(o+s)}return e}getPieceSquareValue(t,e){const i=e.charCodeAt(0)-65,n=parseInt(e[1])-1;return G[t]?G[t][n][i]:0}}const $=q;function J(t){return new q(t).getMoves()}function V(t){const e=new q(t);return{turn:e.getPlayingColor(),check:e.configuration.check,checkMate:e.configuration.checkMate,isFinished:e.configuration.isFinished}}function Y(t){const e=new q(t),i=[];for(let t=7;t>=0;t--){let n="";for(let e=0;e<8;e++){const o=String.fromCharCode(65+e)+(t+1),s=Object.keys(g.pieces).find(t=>t===o);if(s){const t=g.pieces[s];n+=t}else{let t=0;for(;e+t<8;){const n=String.fromCharCode(65+e+t)+(t+1);if(Object.keys(g.pieces).find(t=>t===n))break;t++}t>0?(n+=t,e+=t-1):n+="1"}}i.push(n)}let o="";o+=i.join("/"),o+=" ",o+=e.getPlayingColor()[0],o+=" ";let s="";e.configuration.castling.whiteShort&&(s+="K"),e.configuration.castling.whiteLong&&(s+="Q"),e.configuration.castling.blackShort&&(s+="k"),e.configuration.castling.blackLong&&(s+="q"),s||(s="-"),o+=s,o+=" ",o+=e.configuration.enPassant||"-",o+=" ",o+=e.configuration.halfMove,o+=" ",o+=e.configuration.fullMove;return o}function z(t,e,i,n){return new q(t).move(e,i,n)}function X(t,e=2){return new q(t).aiMove(e)}return lib["js-chess-engine"]}()));

// Initialize the js-chess-engine
const { Game } = jsChessEngine;

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
    const engineConfig = this.engine.exportJson();
    const engineData = JSON.parse(engineConfig);

    // Create an 8x8 grid
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Map pieces from engine format (like "A1": "R") to our grid format
    Object.entries(engineData.pieces).forEach(([square, piece]) => {
      const file = square.charCodeAt(0) - 65; // A=0, B=1, etc.
      const rank = parseInt(square[1]) - 1;   // 1=0, 2=1, etc.
      board[7 - rank][file] = piece; // Flip rank for display (rank 8 = index 0)
    });

    return board;
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
      const status = this.engine.exportJson();
      const gameData = JSON.parse(status);
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
      const status = this.engine.exportJson();
      const gameData = JSON.parse(status);
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
      const status = this.engine.exportJson();
      const gameData = JSON.parse(status);

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
        const status = this.engine.exportJson();
        const gameData = JSON.parse(status);
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
      1: 'Eric',
      2: 'Emmy',
      3: 'Asa',
      4: 'Bayes'
    };
    return difficulties[this.botDifficulty] || 'Eric';
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
      { value: 1, label: 'Eric (Easy)' },
      { value: 2, label: 'Emmy (Medium)' },
      { value: 3, label: 'Asa (Hard)' },
      { value: 4, label: 'Bayes (Hardest)' }
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

    if (this.game.gameMode === 'human-vs-bot') {
      if (this.game.isBotTurn()) return false;
      // Human can only move their color
      const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
      return pieceColor === this.game.humanColor;
    } else {
      // Human vs Human - current player can move their pieces
      const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
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

    const symbols = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };

    return symbols[piece] || piece;
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