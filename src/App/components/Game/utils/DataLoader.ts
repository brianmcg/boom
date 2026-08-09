export default class DataLoader {
  /**
   * The parsed JSON, or null when there is nothing to fetch — a scene with no
   * data file at all. `unknown` because the shape differs per caller and none
   * of it is described anywhere yet.
   */
  static async load(src?: string): Promise<unknown> {
    if (src) {
      const response = await fetch(src);

      return response.json();
    }

    return null;
  }
}
