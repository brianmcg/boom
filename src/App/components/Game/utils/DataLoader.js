export default class DataLoader {
  static async load(src) {
    if (src) {
      const response = await fetch(src);

      return response.json();
    }

    return null;
  }
}
