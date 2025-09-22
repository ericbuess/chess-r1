function d(){const a=`
    // Try to load the chess engine from various paths
    const paths = ${JSON.stringify(["/node_modules/js-chess-engine/dist/js-chess-engine.js","./node_modules/js-chess-engine/dist/js-chess-engine.js","../node_modules/js-chess-engine/dist/js-chess-engine.js","/js-chess-engine.js","./js-chess-engine.js"])};
    let loaded = false;

    for (const path of paths) {
      if (!loaded) {
        try {
          const url = new URL(path, self.location.origin).href;
          importScripts(url);
          if (self["js-chess-engine"]) {
            loaded = true;
            console.log('Chess engine loaded from:', url);
            break;
          }
        } catch (e) {
          console.log('Failed to load from:', path);
        }
      }
    }

    if (!loaded) {
      throw new Error('Failed to load chess engine from any path');
    }

    // The library exports to self["js-chess-engine"] in worker context
    const jsChessEngine = self["js-chess-engine"];

    // Listen for messages
    self.addEventListener('message', function(e) {
      const { type, engineState, difficulty } = e.data;

      if (type === 'calculate') {
        try {
          // Create engine with the current state
          const engine = new jsChessEngine.Game(engineState);

          // Calculate the AI move
          const aiMove = engine.aiMove(difficulty);

          // Get the final state after the move
          const finalState = engine.exportJson();

          // Send the result back
          self.postMessage({
            type: 'result',
            success: true,
            move: aiMove,
            finalState: finalState
          });
        } catch (error) {
          self.postMessage({
            type: 'error',
            error: error.message
          });
        }
      }
    });
  `,t=new Blob([a],{type:"application/javascript"}),n=URL.createObjectURL(t),e=new Worker(n),o=e.terminate.bind(e);return e.terminate=function(){return URL.revokeObjectURL(n),o()},e}function f(i,a){const t=d();let n,e=!1,o;const l=new Promise((c,r)=>{o=r,n=setTimeout(()=>{e||(e=!0,t.terminate(),r(new Error("Bot calculation timed out")))},3e4),t.addEventListener("message",s=>{e||(e=!0,clearTimeout(n),t.terminate(),s.data.type==="result"&&s.data.success?c({move:s.data.move,finalState:s.data.finalState}):s.data.type==="error"&&r(new Error(s.data.error)))}),t.addEventListener("error",s=>{e||(e=!0,clearTimeout(n),t.terminate(),r(s))}),t.postMessage({type:"calculate",engineState:i,difficulty:a})});return l.cancel=()=>{e||(e=!0,clearTimeout(n),t.terminate(),o&&o(new Error("Bot calculation cancelled")))},l}export{f as createCancellableBotMove,d as createChessWorker};
