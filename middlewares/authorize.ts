// deno-lint-ignore-file no-explicit-any

export const authorize = (req: Request) => {
	const cookieHeader = req.headers.get('Cookie');
	if (!cookieHeader) return null;
	const cookies = new Map(
		cookieHeader?.split(';').map((cookie) =>
			cookie.trim().split('=')
		) as any,
	);

	return cookies.get('session') as string;
};
