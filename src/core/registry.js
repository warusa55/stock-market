export class PluginRegistry {
  #plugins = new Map();

  register(plugin) {
    if (!plugin || typeof plugin.id !== "string") {
      throw new TypeError("plugin.id is required");
    }

    if (this.#plugins.has(plugin.id)) {
      throw new Error(`plugin already registered: ${plugin.id}`);
    }

    this.#plugins.set(plugin.id, plugin);
    return this;
  }

  get(id) {
    return this.#plugins.get(id);
  }

  require(id) {
    const plugin = this.get(id);
    if (!plugin) {
      throw new Error(`plugin not found: ${id}`);
    }
    return plugin;
  }

  list() {
    return [...this.#plugins.values()];
  }

  clear() {
    this.#plugins.clear();
  }
}
