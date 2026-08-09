import { GraphicsLoader } from '@game/core/graphics';
import { SoundLoader, type SoundAsset } from '@game/core/audio';
import DataLoader from '@game/utils/DataLoader';

/** What a scene declares in `constants/assets`. Only world scenes have data. */
export interface AssetSources {
  sound: SoundAsset;
  graphics: string;
  data?: string;
}

export default class Loader {
  static async load({ sound, graphics, data }: AssetSources) {
    const soundResources = SoundLoader.load(sound);
    const graphicsResources = GraphicsLoader.load(graphics);
    const dataResources = DataLoader.load(data);

    return {
      graphics: await graphicsResources,
      sound: await soundResources,
      data: await dataResources,
    };
  }

  /**
   * Takes what {@link Loader.load} took, so a scene can hand back the same
   * descriptor it was loaded from. Naming none of it releases everything of
   * that kind, which is how the game tears down on exit; `data` has no handle
   * to release and is ignored.
   */
  static async unload({ graphics, sound }: Partial<AssetSources> = {}) {
    const soundPromise = SoundLoader.unload(sound?.src);
    const graphicsPromise = GraphicsLoader.unload(graphics);

    return {
      sound: await soundPromise,
      graphics: await graphicsPromise,
    };
  }
}
