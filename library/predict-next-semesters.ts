import * as tf from 'https://esm.sh/@tensorflow/tfjs@4.6.0';
import { DenoFileLoadHandler } from './tf.ts';

export default async function predictNextSemesters(
	{ inputFeatures: semesters, maxSemester, maxYear }: {
		inputFeatures: number[][];
		maxYear: number;
		maxSemester: number;
	},
) {
	const normalizedSemesters = semesters.map((
		[year, semester, college],
	) => [
		year / maxYear,
		semester / maxSemester,
		college,
	]);

	const loadHandler = new DenoFileLoadHandler('./prediction-models');
	const model = await tf.loadLayersModel(loadHandler);

	const features = tf.tensor2d(normalizedSemesters, [
		normalizedSemesters.length,
		3,
	]);

	const predictions = model.predict(features) as tf.Tensor;

	return (await predictions.array() as number[][])
		.map(
			(pred: number[]) => pred[0] * maxYear, // Scale back to original range
		);
}
