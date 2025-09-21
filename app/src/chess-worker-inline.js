// Chess Worker - Inline version that creates a worker from a blob
// This avoids module loading issues

export function createChessWorker() {
  // The worker code as a string
  const workerCode = `
    // Load the chess engine library
    importScripts('/node_modules/js-chess-engine/dist/js-chess-engine.js');

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
  `;

  // Create a blob from the worker code
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);

  // Create and return the worker
  const worker = new Worker(workerUrl);

  // Clean up the blob URL when the worker is terminated
  const originalTerminate = worker.terminate.bind(worker);
  worker.terminate = function() {
    URL.revokeObjectURL(workerUrl);
    return originalTerminate();
  };

  return worker;
}

export function calculateBotMoveAsync(engineState, difficulty) {
  return new Promise((resolve, reject) => {
    const worker = createChessWorker();
    let timeoutId;
    let resolved = false;

    // Create an abort mechanism
    const cancel = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        worker.terminate();
        reject(new Error('Bot calculation cancelled'));
      }
    };

    // Attach the cancel function to the promise for external cancellation
    const promise = { cancel };

    // Set a timeout for the calculation (30 seconds max)
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        worker.terminate();
        reject(new Error('Bot calculation timed out'));
      }
    }, 30000);

    // Listen for the result
    worker.addEventListener('message', (e) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        worker.terminate();

        if (e.data.type === 'result' && e.data.success) {
          resolve({
            move: e.data.move,
            finalState: e.data.finalState
          });
        } else if (e.data.type === 'error') {
          reject(new Error(e.data.error));
        }
      }
    });

    // Listen for errors
    worker.addEventListener('error', (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        worker.terminate();
        reject(error);
      }
    });

    // Start the calculation
    worker.postMessage({
      type: 'calculate',
      engineState: engineState,
      difficulty: difficulty
    });

    // Return the promise with the cancel method attached
    promise.promise = new Promise((res, rej) => {
      const originalResolve = resolve;
      const originalReject = reject;
      resolve = res;
      reject = rej;
    });

    return promise;
  });
}

// Create a cancellable bot move calculation
export function createCancellableBotMove(engineState, difficulty) {
  const worker = createChessWorker();
  let timeoutId;
  let resolved = false;
  let rejectFn;

  const promise = new Promise((resolve, reject) => {
    rejectFn = reject;

    // Set a timeout for the calculation (30 seconds max)
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        worker.terminate();
        reject(new Error('Bot calculation timed out'));
      }
    }, 30000);

    // Listen for the result
    worker.addEventListener('message', (e) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        worker.terminate();

        if (e.data.type === 'result' && e.data.success) {
          resolve({
            move: e.data.move,
            finalState: e.data.finalState
          });
        } else if (e.data.type === 'error') {
          reject(new Error(e.data.error));
        }
      }
    });

    // Listen for errors
    worker.addEventListener('error', (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        worker.terminate();
        reject(error);
      }
    });

    // Start the calculation
    worker.postMessage({
      type: 'calculate',
      engineState: engineState,
      difficulty: difficulty
    });
  });

  // Add a cancel method to the promise
  promise.cancel = () => {
    if (!resolved) {
      resolved = true;
      clearTimeout(timeoutId);
      worker.terminate();
      if (rejectFn) {
        rejectFn(new Error('Bot calculation cancelled'));
      }
    }
  };

  return promise;
}