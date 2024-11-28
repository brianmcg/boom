import AnimatedEntitySprite from './AnimatedEntitySprite';

export default class EffectSprite extends AnimatedEntitySprite {
  constructor(textures, { rotate = true, ...other }) {
    super(textures, {
      ...other,
      loop: false,
      autoPlay: false,
      anchor: 0.5,
    });

    if (rotate) {
      this.rotation = Math.random() * Math.PI * 2;
    }

    this.on('added', () => this.gotoAndPlay(0));
  }
}
