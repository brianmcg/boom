import translate from '@util/translate';
import { TITLE_SCENE_ASSETS } from '@constants/assets';
import Scene from '../Scene';
import TitleGraphics from './utils/TitleGraphics';

export default class TitleScene extends Scene {
  constructor({ data, ...other }) {
    super(other);

    this.assets = TITLE_SCENE_ASSETS;

    this.menu.add({
      label: translate('title.menu.new'),
      action: () => this.onSelectNewGame(),
    });

    this.menu.add({
      label: translate('title.menu.load'),
      disabled: Object.keys(data).length < 1,
      menu: Object.values(data).map(data => ({
        label: `${data.index}. ${translate(`world.title.${data.id}`)}`,
        action: () => this.onSelectLoadGame(data),
      })),
    });

    this.stopMusicOnPause = false;

    this.promptOption = translate('title.prompt.start');
  }

  onPromptInput() {
    this.onShowMenu();
  }

  onSelectNewGame() {
    this.onStop = () => this.game.showWorldScene();
    this.setFadingOut();
  }

  onSelectLoadGame(data) {
    this.onStop = () => this.game.showWorldScene(data);
    this.setFadingOut();
  }

  onMenuSelect() {
    const action = this.menu.select();
    this.soundController.emitSound(this.sounds.pause);

    if (action) {
      this.promptContainer.removeFromParent();
      this.foregroundContainer.removeFromParent();
      this.menuContainer.once('removed', action);
      this.setUnpausing();
    }
  }

  create(options) {
    super.create(options);

    this.sprites = TitleGraphics.createTitleSprites({
      ...options,
      renderer: this.game.app.renderer,
    });

    this.backgroundContainer = TitleGraphics.createBackgroundContainer(
      this.sprites.background
    );

    this.foregroundContainer = TitleGraphics.createForegroundContainer(
      this.sprites.foreground
    );

    this.mainContainer.addChild(this.backgroundContainer);
    this.mainContainer.addChild(this.foregroundContainer);
  }

  setPausing() {
    const isStateChanged = super.setPausing();

    if (isStateChanged) {
      this.mainContainer.pixelateFilter.enabled = false;
      this.backgroundContainer.play();
    }

    return isStateChanged;
  }

  setFadingOut() {
    const isStateChanged = super.setFadingOut();

    if (isStateChanged) {
      this.mainContainer.pixelateFilter.enabled = true;
    }

    return isStateChanged;
  }

  updatePausing(ticker) {
    super.updatePausing(ticker);
    this.backgroundContainer.update(ticker);
  }

  updatePaused(ticker) {
    super.updatePaused();
    this.sprites.background.sparks.update(ticker);
  }

  updateUnpausing(ticker) {
    super.updateUnpausing(ticker);
    this.backgroundContainer.update(ticker);
  }

  destroy(options) {
    super.destroy(options);
    this.foregroundContainer = null;
    this.backgroundContainer = null;
    this.sprites = null;
  }
}
