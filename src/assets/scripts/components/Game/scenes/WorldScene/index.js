import { Keyboard } from '~/core/input';
import { parse } from './helpers';
import Scene from '../Scene';
import { RectangleSprite } from '~/core/graphics';
import { DEG } from '~/core/physics';

export default class WorldScene extends Scene {
  constructor(options) {
    super({ type: Scene.TYPES.WORLD, ...options });

    this.menuItems = [{
      label: Scene.TEXT.CONTINUE,
      onSelect: () => {
        this.setState(Scene.STATES.RUNNING);
      },
    }, {
      label: Scene.TEXT.RESTART,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.RESTART);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }, {
      label: Scene.TEXT.QUIT,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }];
  }

  create(resources) {
    super.create(resources);
    const { level } = parse(resources);
    this.level = level;

    this.level.grid.forEach((row) => {
      row.forEach((sector) => {
        if (sector.height) {
          const { shape } = sector;

          const sprite = new RectangleSprite({
            width: shape.width,
            height: shape.length,
          });

          sprite.x = shape.x;
          sprite.y = shape.y;

          this.main.addChild(sprite);
        }
      });
    });


    const { player } = this.level;

    this.playerSprite = new RectangleSprite({
      width: player.shape.width,
      height: player.shape.length,
      color: 0xFF0000,
    });

    this.playerSprite.x = player.shape.x;
    this.playerSprite.y = player.shape.y;


    this.addChild(this.playerSprite);
  }

  updateRunning(delta) {
    super.updateRunning(delta);

    this.level.player.velocity = 2;
    // this.level.player.angle = DEG[45];

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }

    this.level.update(delta);
  }

  resize(scale) {
    if (this.state !== Scene.STATES.STOPPED) {
      this.scale.x = scale / 4;
      this.scale.y = scale / 4;
    }
  }

  _render() {
    if (this.level) {
      const { shape } = this.level.player;

      this.playerSprite.x = shape.x;
      this.playerSprite.y = shape.y;
    }
  }
}
