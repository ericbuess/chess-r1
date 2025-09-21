// Chess Worker - Handles AI calculations off the main thread
// This allows the UI to remain responsive and enables immediate cancellation

// Import the chess engine from the local node_modules
importScripts('/node_modules/js-chess-engine/dist/js-chess-engine.js');

// Listen for messages from the main thread
self.addEventListener('message', function(e) {
  const { type, engineState, difficulty } = e.data;

  if (type === 'calculate') {
    try {
      // Create engine with the current state
      const engine = new jsChessEngine.Game(engineState);

      // Calculate the AI move (this is the blocking operation)
      const aiMove = engine.aiMove(difficulty);

      // Send the result back to the main thread
      self.postMessage({
        type: 'result',
        success: true,
        move: aiMove,
        finalState: engine.exportJson()
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
});