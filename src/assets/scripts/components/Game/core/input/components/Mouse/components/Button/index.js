class Button {
  onDown(callback) {
    this.downCallback = callback;
  }

  onUp(callback) {
    this.downCallback = callback;
  }
}

export default Button;
