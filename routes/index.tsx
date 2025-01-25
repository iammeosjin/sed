import { Handlers } from '$fresh/server.ts';
import { authorize } from '../middlewares/authorize.ts';

export const handler: Handlers = {
	GET(req) {
		const username = authorize(req);
		let location = '/login';
		if (username) {
			location = '/dashboard';
		}

		return new Response(null, {
			status: 302,
			headers: { Location: location }, // Redirect to home if already logged in
		});
	},
};
