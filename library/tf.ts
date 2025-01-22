// deno-lint-ignore-file no-explicit-any
import * as tf from 'https://esm.sh/@tensorflow/tfjs@4.6.0';

export class DenoFileSaveHandler implements tf.io.IOHandler {
  constructor(private basePath: string) {}

  async save(modelArtifacts: tf.io.ModelArtifacts): Promise<tf.io.SaveResult> {
    // Save model.json
    const modelJsonPath = `${this.basePath}/model.json`;
    await Deno.writeTextFile(modelJsonPath, JSON.stringify(modelArtifacts));

    // Save weight files
    if (modelArtifacts.weightData) {
      const weightFilePath = `${this.basePath}/weights.bin`;
      await Deno.writeFile(
        weightFilePath,
        new Uint8Array(modelArtifacts.weightData as any),
      );
    }

    return {
      modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' },
    };
  }
}

export class DenoFileLoadHandler implements tf.io.IOHandler {
  constructor(private basePath: string) {}

  async load(): Promise<tf.io.ModelArtifacts> {
    // Load model.json
    const modelJsonPath = `${this.basePath}/model.json`;
    const modelJson = await Deno.readTextFile(modelJsonPath);
    const modelArtifacts: tf.io.ModelArtifacts = JSON.parse(modelJson);

    // Load weights
    const weightFilePath = `${this.basePath}/weights.bin`;
    const weightData = await Deno.readFile(weightFilePath);
    modelArtifacts.weightData = weightData.buffer;

    return modelArtifacts;
  }
}
