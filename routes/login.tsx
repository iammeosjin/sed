import { Head } from '$fresh/runtime.ts';
import { Handlers } from '$fresh/server.ts';
import { authorize } from '../middlewares/authorize.ts';
import LoginPage from '../islands/LoginPage.tsx';

export const handler: Handlers = {
	GET(req, ctx) {
		const session = authorize(req);
		if (session) {
			return new Response(null, {
				status: 302,
				headers: { Location: '/dashboard' }, // Redirect to home if already logged in
			});
		}

		return ctx.render();
	},
};

export default function Home() {
	return (
		<>
			<Head>
				<title>School Enrollee Prediction</title>
			</Head>
			<LoginPage />
		</>
	);
}
