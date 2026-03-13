import proxy from './logic/proxy.js';
import handleCorsRequest from './logic/cors.js';
import { thumbnailHandler } from './logic/thumbnails.js';
import { handleRequest } from './utils/helpers.js';

const handlePath = {
	'/proxy': proxy,
	'/cors': handleCorsRequest,
	'/image': handleCorsRequest,
	'/thumbnail': thumbnailHandler,
};
export default {
	async fetch(request, env, context) {
		const url = new URL(request.url);
		let path = url.pathname;

		path = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

		try {
			if (handlePath[path]) {
				if (path === '/proxy') {
					return handlePath[path](request, env, context);
				}
				return handlePath[path](...handleRequest(request));
			}

			if (path === '/favicon.ico') {
				return new Response(null, { status: 200 });
			}

			if (path === '/') {
				return new Response(
					JSON.stringify({
						message: 'Welcome to Roxy',
						endpoints: {
							'/proxy': 'For HLS',
							'/cors': 'For CORS',
							'/image': 'For Manga Images',
							'/thumbnail': 'For Thumbnails',
						},
					}),
					{
						status: 200,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			}

			return new Response('Not Found', { status: 404 }); // Changed from 403 to 404
		} catch (error) {
			console.error('Handler error:', error);
			return new Response('Internal Server Error', {
				status: 500,
				headers: { 'Access-Control-Allow-Origin': '*' },
			});
		}
	},
};
