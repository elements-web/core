// @ts-nocheck
(() => {
    /** @type {import('esbuild')} */
    let esbuild, bfsContainer = Object.create(null);

    async function init({ data: { esbuildURL, esbuildWASMUrl, browserfsUrl, fsConstants } }){
        importScripts(browserfsUrl);
        importScripts(esbuildURL);
        const { BrowserFS, esbuild: _esbuild } = globalThis;
        delete globalThis.BrowserFS;
        delete globalThis.esbuild;
        esbuild = _esbuild;
        const esinit = esbuild.initialize({
            wasmURL: esbuildWASMUrl,
            worker: false,
        });
        const BFS = new BrowserFS.EmscriptenFS;
        BrowserFS.install(bfsContainer);
        await new Promise((resolve, reject) => BrowserFS.configure({
            fs: 'MountableFileSystem',
            options: {
                '/tmp': {
                    fs: 'InMemory',
                },
            },
        }, e => (e ? reject(e) : resolve())));
        const fs = bfsContainer.require('fs');
        fs.constants = fsConstants;
        globalThis.fs = new Proxy(fs, {
            get(_, method){
                const v = _[method];
                if(typeof v === 'function') return (...args) => {
                    const r = _[method](...args);
                    console.warn('Called fs method', method, 'with args', args, 'and result', r);
                    return r;
                }; else {
                    console.warn('Got', method, ':', v);
                    return v;
                }
            }
        });
        globalThis.fs = fs;
        globalThis.Buffer = bfsContainer.require('buffer');
        globalThis.process = bfsContainer.require('process');
        await esinit;
        onmessage = loader;
        postMessage('INIT_DONE');
    }

    async function loader({ data: { requestId, moduleUrl } }){
        console.log({requestId, moduleUrl});
        fs.writeFileSync('/tmp/test.js', 'console.warn("Hello from esbuild!");');
        console.warn('ESBuild result:', await esbuild.build({
            platform: 'browser',
            bundle: true,
            entryPoints: [ '/tmp/test.js' ],
        }));
    }

    onmessage = init;
})();
