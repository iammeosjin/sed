import { Handlers } from '$fresh/server.ts';
import predictNextSemesters from '../../library/predict-next-semesters.ts';

export const handler: Handlers = {
	async POST(req) {
		try {
			const body = await req.json();
			const { semesters, maxYear, maxSemester } = body;

			if (!semesters || !Array.isArray(semesters)) {
				return new Response(
					JSON.stringify({ error: 'Invalid input data' }),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					},
				);
			}
			const predictions = await predictNextSemesters({
				inputFeatures: semesters,
				maxYear,
				maxSemester,
			});

			return new Response(
				JSON.stringify({ predictions }),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		} catch (error) {
			console.error('Prediction error:', error);
			return new Response(
				JSON.stringify({ error: 'Failed to make predictions' }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}
	},
};
