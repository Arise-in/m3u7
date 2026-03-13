export const thumbnailHandler = async (url, headers, origin) => {
	const resp = await fetch(url, {
		...headers,
		redirect: 'follow',
		'User-Agent':
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36',
	});

	if (resp.status !== 200) {
		return new Response(resp.status, resp);
	}
	const timestampRegex = /(?<=\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\s)(.*)/gm;
	const responseBody = await resp.text();
	const baseUrl = url.substring(0, url.lastIndexOf('/'));
	const modifiedBody = responseBody.replace(timestampRegex, (match) => {
		const fullUrl = match.startsWith('http') ? match : match.startsWith('/') ? `${baseUrl}/${match}` : `${baseUrl}/${match}`;
		return `${origin}/cors?url=${encodeURIComponent(btoa(fullUrl))}`;
	});
	return new Response(modifiedBody, {
		headers: {
			...resp.headers,
			'Access-Control-Allow-Origin': '*',
		},
	});
};
