import { Handlers } from '$fresh/server.ts';
export const handler: Handlers = {
	GET(_) {
		const headers = new Headers();
		headers.set('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
		headers.set('Location', '/login');
		return new Response(null, {
			status: 302,
			headers, // Redirect to login after logout
		});
	},
};
