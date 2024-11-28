import { GraphicsLoader } from '@game/core/graphics';
import { SoundLoader } from '@game/core/audio';
import DataLoader from '@game/util/DataLoader';

export default class Loader {
  static async load({ sound, graphics, data }) {
    const soundResources = SoundLoader.load(sound);
    const graphicsResources = GraphicsLoader.load(graphics);
    const dataResources = DataLoader.load(data);

    return {
      graphics: await graphicsResources,
      sound: await soundResources,
      data: await dataResources,
    };
  }

  static async unload({ graphics, sound } = {}) {
    const soundPromise = SoundLoader.unload(sound);
    const graphicsPromise = GraphicsLoader.unload(graphics);

    return {
      sound: await soundPromise,
      graphics: await graphicsPromise,
    };
  }
}
