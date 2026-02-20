
// Web Worker for Neural Synapse (Off-main-thread AI)

let extractor: any = null;
let workerStatus: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;

  try {
    switch (type) {
      case 'INIT':
        await init();
        self.postMessage({ id, type: 'INIT_RESULT', payload: workerStatus });
        break;
      
      case 'EMBED': {
        if (workerStatus !== 'ready') await init();
        const vector = await getEmbeddings(payload);
        self.postMessage({ id, type: 'EMBED_RESULT', payload: vector });
        break;
      }

      case 'CRITIQUE': {
        if (workerStatus !== 'ready') await init();
        const critique = await getCritique(payload);
        self.postMessage({ id, type: 'CRITIQUE_RESULT', payload: critique });
        break;
      }
    }
  } catch (err) {
    self.postMessage({ id, type: 'ERROR', payload: String(err) });
  }
};

async function init() {
  if (extractor) return;
  workerStatus = 'loading';
  
  try {
    const { env, pipeline } = await import('@xenova/transformers');

    env.allowLocalModels = false;
    env.useBrowserCache = true;
    // @ts-ignore
    env.backends.onnx.wasm.proxy = false; 
    // @ts-ignore
    env.backends.onnx.wasm.numThreads = 1;
    // @ts-ignore
    env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';

    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
    });
    workerStatus = 'ready';
  } catch (e) {
    workerStatus = 'error';
    throw e;
  }
}

async function getEmbeddings(text: string): Promise<number[] | null> {
  if (!extractor) return null;
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

async function getCritique(text: string): Promise<string> {
    if (!text || text.length < 20) return "Neural input too sparse.";
    const words = text.trim().split(/\s+/).length;
    return words > 50 ? "High cognitive density detected." : "Stable node structure.";
}
