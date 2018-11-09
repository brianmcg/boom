import { Sprite, Texture, LoopSprite } from 'game/core/graphics';
import { Keyboard } from 'game/core/input';
import { SPRITESHEET_FILE_PATH, SOUND_FILE_PATH, ANIMATION_FILE_PATH } from '../../constants/paths';
import { RED } from '../../constants/colors';
import Scene from '../Scene';
import { SCREEN } from '../../constants/config';

const createTitleSprites = (tiles) => {
  const sparksTextures = [];
  const smokeTextures = [];

  Object.values(tiles.sparks).forEach((value) => {
    sparksTextures.push(Texture.fromFrame(value.image));
  });

  Object.values(tiles.smoke).forEach((value) => {
    smokeTextures.push(Texture.fromFrame(value.image));
  });

  return {
    smoke: new LoopSprite(smokeTextures, 0.2, RED),
    sparks: new LoopSprite(sparksTextures, 0.4),
    logo: Sprite.fromFrame('logo.png'),
  };
};

const parseTitleData = resources => ({
  sprites: createTitleSprites({
    sparks: resources.sparksAnimation.data.tilesets[0].tiles,
    smoke: resources.smokeAnimation.data.tilesets[0].tiles,
  }),
});

class TitleScene extends Scene {
  constructor(props) {
    super(props);

    this.type = Scene.TYPES.TITLE;

    this.assets = {
      data: [
        ['spritesheet', `${SPRITESHEET_FILE_PATH}/${this.type}.json`],
        ['smokeAnimation', `${ANIMATION_FILE_PATH}/smoke.json`],
        ['sparksAnimation', `${ANIMATION_FILE_PATH}/sparks.json`],
      ],
      music: `${SOUND_FILE_PATH}/${this.type}.mp3`,
    };
  }

  create(resources) {
    const { sprites } = parseTitleData(resources);

    this.sprites = sprites;

    this.sprites.smoke.width = SCREEN.WIDTH;
    this.sprites.smoke.height = SCREEN.HEIGHT;
    this.sprites.smoke.alpha = 0.5;
    this.sprites.sparks.width = SCREEN.WIDTH;
    this.sprites.sparks.height = SCREEN.HEIGHT;
    this.sprites.logo.scale = { x: 0.5, y: 0.5 };

    this.main.addChild(this.sprites.smoke);
    this.main.addChild(this.sprites.sparks);
    this.main.addChild(this.sprites.logo);

    super.create();
  }

  updateRunning() {
    super.updateRunning();

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.SCENE_COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }

  render() {
    super.render();
  }
}

export default TitleScene;
