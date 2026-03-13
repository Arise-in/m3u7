import { USER_AGENTS, CORS_HEADERS, HTTP_STATUS } from '../utils/constants';
import { cleanResponseHeaders } from '../utils/helpers';

/**
 * Handles CORS requests by proxying them with appropriate headers
 * @param {string} targetUrl - The target URL to fetch
 * @param {Object} customHeaders - Custom headers from the request
 * @returns {Promise<Response>} - The proxied response
 */
async function handleCorsRequest(targetUrl, customHeaders = {}) {
	try {
		// Merge default headers with custom headers
		const fetchHeaders = {
			'User-Agent': USER_AGENTS.FIREFOX,
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8;application/json, text/plain, */*',
			'Accept-Language': 'en-US,en;q=0.5',
			Connection: 'keep-alive',
			Pragma: 'no-cache',
			'Cache-Control': 'no-cache',
			...customHeaders,
		};

		const response = await fetch(targetUrl, {
			redirect: 'follow',
			headers: fetchHeaders,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Clean and prepare response headers
		const cleanHeaders = cleanResponseHeaders(response.headers);
		const responseHeaders = {
			...cleanHeaders,
			...CORS_HEADERS,
			'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
			'Access-Control-Expose-Headers': Object.keys(cleanHeaders).join(', '),
		};

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error('Error in CORS request:', error);
		return new Response(
			JSON.stringify({
				error: 'Failed to fetch the resource',
				message: error.message,
			}),
			{
				status: HTTP_STATUS.SERVER_ERROR,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			}
		);
	}
}

export default handleCorsRequest;
