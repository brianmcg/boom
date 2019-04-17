import { Container } from '~/core/graphics';
import EntitiesContainer from '../EntitiesContainer';

export default class WorldContainer extends Container {
  constructor({ level, sprites }) {
    super();

    const { entities } = sprites;

    this.level = level;
    this.addChild(new EntitiesContainer({ level, sprites: entities }));
  }

  update(...options) {
    this.level.update(...options);
  }

  animate() {
    this.children.forEach(child => child.animate());
  }
}
