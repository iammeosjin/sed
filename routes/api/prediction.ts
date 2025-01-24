import { Handlers } from '$fresh/server.ts';
import * as tf from 'https://esm.sh/@tensorflow/tfjs@4.6.0';
import { DenoFileLoadHandler } from '../../library/tf.ts';

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { semesters } = body;

      const maxYear = 2026; // Adjust based on your data range
      const maxSemester = 2;

      if (!semesters || !Array.isArray(semesters)) {
        return new Response(JSON.stringify({ error: 'Invalid input data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const normalizedSemesters = semesters.map(([year, semester, college]) => [
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
      const predictedCounts = (await predictions.array() as number[][]).map(
        (pred: number[]) => pred[0] * maxYear, // Scale back to original range
      );

      return new Response(JSON.stringify({ predictions: predictedCounts }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Prediction error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to make predictions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  },
};
