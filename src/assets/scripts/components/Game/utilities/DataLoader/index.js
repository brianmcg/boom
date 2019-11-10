class DataLoader {
  constructor() {
    this.cache = {};
  }

  async load(options) {
    if (options) {
      const { name, src } = options;
      const response = await fetch(src);
      const data = await response.json();

      this.cache[name] = data;

      return data;
    }

    return null;
  }

  unload(keys = []) {
    if (keys.length) {
      keys.forEach((key) => {
        delete this.cache[key];
      });
    } else {
      this.cache = {};
    }
  }
}

export default DataLoader;
