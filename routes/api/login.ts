import { Handlers } from '$fresh/server.ts';

export const handler: Handlers = {
	async POST(req) {
		const body = await req.json();
		const { username, password } = body;
		if (username !== 'admin' || password !== 'password') {
			return new Response(
				JSON.stringify({ error: 'Invalid credentials' }),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		const headers = new Headers();
		headers.set(
			'Set-Cookie',
			`session=${username}; HttpOnly; Path=/`,
		);
		return new Response(JSON.stringify({ username, password }), {
			status: 200,
			headers,
		});
	},
};
