import { Scene } from 'game/components/Graphics';

class CreditsScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: Scene.TYPES.CREDITS,
      assets: [
        ['spritesheet', `${Scene.PATHS.SPRITE_SHEET}/${Scene.TYPES.CREDITS}.json`],
      ],
    });
  }
}

export default CreditsScene;
