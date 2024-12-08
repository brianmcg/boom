import AnimatedEntitySprite from './AnimatedEntitySprite';

const EVENTS = {
  ANIMATION_CHANGE: 'sprite:animation:change',
  ANIMATION_COMPLETE: 'sprite:animation:complete',
};

export default class ExplosiveEntitySprite extends AnimatedEntitySprite {
  constructor(textures, { entity, ...options }) {
    super(textures, { ...options, loop: false, autoPlay: false });

    entity.onExplode(() => {
      this.emit(EVENTS.ANIMATION_CHANGE);
      this.play();
    });

    this.onComplete = () => {
      this.isComplete = true;
      this.emit(EVENTS.ANIMATION_COMPLETE);
      entity.removeFromParent();
    };

    this.entity = entity;
  }

  play() {
    if (this.entity.isExploding) {
      super.play();
    }
  }

  onAnimationChange(callback) {
    this.on(EVENTS.ANIMATION_CHANGE, callback);
  }

  onAnimationComplete(callback) {
    this.on(EVENTS.ANIMATION_COMPLETE, callback);
  }

  destroy(options) {
    this.entity?.destroy();
    this.entity = null;
    super.destroy(options);
  }
}
