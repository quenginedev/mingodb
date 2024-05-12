import Adaptor from "../adaptor";
import { MemoryAdaptor } from "../adaptor/memory";
import Plugin from "../plugin";
import { SyncFn, Synchronizer } from "../sync";
import Collection from "./Collection";

const databases = new Map<string, Database>();

interface DatabaseOptions {
  adapter?: Adaptor;
  plugins?: Plugin<any>[];
  sync?: SyncFn | SyncOptions
}

interface SyncOptions {
  immediate?: boolean;
  callback: SyncFn;
}

export default class Database {
  private adaptor: Adaptor;
  private plugins: Plugin<any>[] = [];
  private collections = new Map<string, Collection<any>>();
  private synchronizer?: Synchronizer;

  constructor(public name: string, options?: DatabaseOptions) {
    this.adaptor = options?.adapter || new MemoryAdaptor();
    this.plugins = options?.plugins || [];
    
    if (databases.has(name)) return databases.get(name) as Database;
    if(options?.sync) { 
      if(typeof options.sync === "function") 
        this.synchronizer = new Synchronizer(this, options.sync);
      else { 
        this.synchronizer = new Synchronizer(this, options.sync.callback);
        if(options.sync.immediate) this.sync();
      }
    }
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

  async sync(){
    if(!this.synchronizer) throw new Error("No sync function provided");
    await this.synchronizer.run();
  }
}
