// @ts-nocheck
import workerURL from './worker.js?url';
import esbuildURL from 'esbuild-wasm/lib/browser.min.js?url';
import esbuildWASMUrl from 'esbuild-wasm/esbuild.wasm?url';
import browserfsUrl from 'browserfs/dist/browserfs.min.js?url';
import rand from '@/system/rand';
import fsConstants from './fs_constants.json';

/** @return {Promise & { resolve(v: any): void, reject(e: Error): void, start: number }} */
function resolveablePromise(){
    let resolve, reject, start = Date.now();
    const p = new Promise(($, _) => { resolve = $; reject = _; });
    return Object.assign(p, { resolve, reject, start });
}

/** @type {{ [id: string]: ReturnType<typeof resolveablePromise> }} */
const requests = Object.create(null);
const init = Symbol();
requests[init] = resolveablePromise();
requests[init].then(() => console.log(`Module system init done in ${Date.now() - requests[init].start}ms`));

const worker = new Worker(workerURL);

worker.onmessage = ({ data }) => {
    if(data === 'INIT_DONE'){
        requests[init].resolve();
        worker.onmessage = ({ data: { error, data, requestId } }) => {
            const request = requests[requestId];
            delete requests[requestId];
            if(error) return request?.reject?.(new Error(`Can't load module ${error.name}`));
            request?.resolve?.(data);
        };
    }
};

worker.postMessage({
    esbuildURL,
    esbuildWASMUrl,
    browserfsUrl,
    fsConstants,
});

export default async moduleUrl => {
    await requests[init];
    const start = Date.now();
    const requestId = rand();
    const promise = resolveablePromise();
    requests[requestId] = promise;
    worker.postMessage({ requestId, moduleUrl });
    const res = await promise;
    console.log(`Module ${moduleUrl} imported in ${Date.now() - start}ms`);
    return res;
}
