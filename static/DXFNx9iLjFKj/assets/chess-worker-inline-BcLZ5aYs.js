function f(){const i=`
    // Load the chess engine library
    importScripts('${new URL("/node_modules/js-chess-engine/dist/js-chess-engine.js",window.location.origin).href}');

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
  `,t=new Blob([i],{type:"application/javascript"}),n=URL.createObjectURL(t),e=new Worker(n),s=e.terminate.bind(e);return e.terminate=function(){return URL.revokeObjectURL(n),s()},e}function u(o,i){const t=f();let n,e=!1,s;const c=new Promise((l,a)=>{s=a,n=setTimeout(()=>{e||(e=!0,t.terminate(),a(new Error("Bot calculation timed out")))},3e4),t.addEventListener("message",r=>{e||(e=!0,clearTimeout(n),t.terminate(),r.data.type==="result"&&r.data.success?l({move:r.data.move,finalState:r.data.finalState}):r.data.type==="error"&&a(new Error(r.data.error)))}),t.addEventListener("error",r=>{e||(e=!0,clearTimeout(n),t.terminate(),a(r))}),t.postMessage({type:"calculate",engineState:o,difficulty:i})});return c.cancel=()=>{e||(e=!0,clearTimeout(n),t.terminate(),s&&s(new Error("Bot calculation cancelled")))},c}export{u as createCancellableBotMove,f as createChessWorker};
