import translate from '@util/translate';

let menuId = 1;
let optionId = 1;

const generateMenuId = () => `menu_${menuId++}`;
const generateOptionId = () => `option_${optionId++}`;

const ROOT_MENU_ID = generateMenuId();

export default class Menu {
  constructor(options) {
    this.options = [];
    this.currentMenuId = ROOT_MENU_ID;
    this.currentIndex = 0;
    this.selectedAction = null;

    options.forEach(option => this.add(option));
  }

  add(option) {
    const parentMenuId = option.menuId ?? ROOT_MENU_ID;

    const { menu, ...other } = option;

    if (menu) {
      const childMenuId = generateMenuId();

      this.options.push({
        ...other,
        id: generateOptionId(),
        menuId: parentMenuId,
        nexMenuId: childMenuId,
      });

      menu.forEach(childOption => {
        this.add({
          ...childOption,
          menuId: childMenuId,
        });
      });

      this.options.push({
        id: generateOptionId(),
        menuId: childMenuId,
        disabled: true,
        label: translate('.'),
        nexMenuId: parentMenuId,
      });

      this.options.push({
        id: generateOptionId(),
        menuId: childMenuId,
        label: translate('back'),
        nexMenuId: parentMenuId,
      });
    } else {
      this.options.push({
        ...option,
        id: generateOptionId(),
        menuId: parentMenuId,
      });
    }

    this.updateOptions();
  }

  highlightNext() {
    const currentOptions = this.getCurrentOptions();

    if (currentOptions.length) {
      if (this.currentIndex < currentOptions.length - 1) {
        this.currentIndex = this.currentIndex + 1;
      } else {
        this.currentIndex = 0;
      }

      if (currentOptions[this.currentIndex].disabled) {
        this.highlightNext();
        return;
      }

      this.updateOptions();
    }
  }

  highlightPrevious() {
    const currentOptions = this.getCurrentOptions();

    if (currentOptions.length) {
      if (this.currentIndex > 0) {
        this.currentIndex = this.currentIndex - 1;
      } else {
        this.currentIndex = currentOptions.length - 1;
      }

      if (currentOptions[this.currentIndex].disabled) {
        this.highlightPrevious();
        return;
      }

      this.updateOptions();
    }
  }

  select() {
    const currentOptions = this.getCurrentOptions();
    const selectedOption = currentOptions[this.currentIndex];

    if (selectedOption.nexMenuId) {
      this.currentMenuId = selectedOption.nexMenuId;
      this.currentIndex = 0;
      this.updateOptions();
      return null;
    } else {
      return selectedOption.action;
    }
  }

  reset() {
    this.currentMenuId = ROOT_MENU_ID;
    this.currentIndex = 0;
    this.updateOptions();
  }

  getCurrentOptions() {
    return this.options.filter(option => option.menuId === this.currentMenuId);
  }

  updateOptions() {
    this.selectedAction = null;
    this.options.sort((a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0));

    this.getCurrentOptions().forEach((option, i) => {
      option.highlighted = this.currentIndex === i;
    });
  }

  destroy() {
    this.options.forEach(option => {
      delete option.action;
    });

    this.options = null;
    this.currentMenuId = null;
    this.currentIndex = null;
    this.selectedAction = null;
  }
}
