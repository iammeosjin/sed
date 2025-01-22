import { Handlers } from '$fresh/server.ts';
import * as tf from 'https://esm.sh/@tensorflow/tfjs@4.6.0';
import { DenoFileLoadHandler, DenoFileSaveHandler } from '../../library/tf.ts';

export const handler: Handlers = {
  async POST() {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({ units: 64, activation: 'relu', inputShape: [2] }),
    );
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
    });

    const trainingFeatures = tf.tensor2d(
      [
        [2020, 1],
        [2020, 2],
        [2021, 1],
        [2021, 2],
        [2022, 1],
      ],
      [5, 2],
    );

    const trainingLabels = tf.tensor2d(
      [3500, 3700, 3900, 4000, 4100],
      [5, 1],
    );

    await model.fit(trainingFeatures, trainingLabels, {
      epochs: 100,
      verbose: 0,
    });

    const saveHandler = new DenoFileSaveHandler('./models');
    await model.save(saveHandler);

    return new Response(
      JSON.stringify(
        'Successfully saved model',
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  },
  async GET() {
    const loadHandler = new DenoFileLoadHandler('./models');
    const model = await tf.loadLayersModel(loadHandler);

    const input = tf.tensor2d([[2023, 1]], [1, 2]);
    const prediction = model.predict(input) as tf.Tensor;
    const predictedValue = (await prediction.data())[0];

    return new Response(
      JSON.stringify(
        predictedValue,
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  },
};
