import build from './build';
import createRPCServer from '@/system/rpc/server';
import encodeServerTransport from '@/system/rpc/encodings/null/server';
import createServerTransport from '@/system/rpc/transports/worker/server';

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

const methods = {
    /** @arg {string} moduleUrl */
    async exec(moduleUrl){
        const src = await build(moduleUrl);
        const f = new AsyncFunction(src);
        f();
    },
};

createRPCServer(encodeServerTransport(createServerTransport(self, async (method, args, callback) => {
	try{
		callback(null, await methods[method](args));
	} catch(e){
		callback(e);
	}
})));
