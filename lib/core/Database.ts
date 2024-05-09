import Adaptor from "../adaptor";
import { MemoryAdaptor } from "../adaptor/memory";
import Plugin from "../plugin/plugins";
import Collection from "./Collection";

const databases = new Map<string, Database>();

interface DatabaseOptions {
  adapter?: Adaptor;
  plugins?: Plugin<any>[];
}

export default class Database {
  private adaptor: Adaptor;
  private plugins: Plugin<any>[] = [];

  private collections = new Map<string, Collection<any>>();
  constructor(public name: string, options?: DatabaseOptions) {
    this.adaptor = options?.adapter || new MemoryAdaptor();
    this.plugins = options?.plugins || [];

    if (databases.has(name)) return databases.get(name) as Database;
  }

  collection<T>(name: string) {
    if (this.collections.has(name)) {
      return this.collections.get(name) as Collection<T>;
    } else {
      const collection = new Collection<T>(name, {
        adapter: this.adaptor,
        plugins: this.plugins,
      });
      this.collections.set(name, collection);
      return collection;
    }
  }
}
