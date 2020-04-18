class Button {
  onDown(callback) {
    this.downCallback = callback;
  }

  onUp(callback) {
    this.upCallback = callback;
  }
}

export default Button;
