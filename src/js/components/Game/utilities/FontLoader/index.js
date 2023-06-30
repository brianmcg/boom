export default class FontLoader {
  static load(name) {
    const fontFile = new FontFace(name, `url(./fonts/${name}.ttf)`);

    document.fonts.add(fontFile);

    return fontFile.load();
  }
}