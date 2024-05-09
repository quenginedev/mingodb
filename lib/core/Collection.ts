import Adaptor, { Doc } from "../adaptor";
import Plugin from "../plugin/plugins";
import { FilterQuery } from "mongoose";
import { Query } from "mingo";

interface CollectionOptions {
  adapter: Adaptor;
  plugins: Plugin<any>[];
}

type ChangeType = "insert" | "update" | "remove" | ChangeType[];

export default class Collection<T> {
  private adaptor: Adaptor;
  private plugins: Plugin<Doc<T> | T>[];
  private subscribers = new Map<
    string,
    {
      query: FilterQuery<any>;
      callback: (docs: any[], changeType: ChangeType) => void;
      changeType: ChangeType;
    }
  >();

  constructor(private name: string, options: CollectionOptions) {
    this.adaptor = options.adapter;
    this.plugins = options.plugins;
  }

  notifySubscribers(docs: Doc<T>[], type: ChangeType) {
    for (const { query, changeType, callback } of this.subscribers.values()) {
      if (
        (Array.isArray(changeType) && changeType.includes(type)) ||
        changeType === type
      ) {
        const mingoQuery = new Query(query);
        const filteredDocs = docs.filter((doc) => {
          return mingoQuery.test(doc);
        });
        callback(filteredDocs, type);
      }
    }
  }

  async insert(data: T) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeInsert);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.onInsert);

    for (const hook of beforePluginHooks) [data] = await hook([data]);
    data = await this.adaptor.insert<T>(this.name, data);
    for (const hook of afterPluginHooks) [data] = await hook([data]);
    this.notifySubscribers([data as Doc<T>], "insert");
    return data as Doc<T>;
  }

  async insertMany(data: T[]) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeInsert,);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.onInsert);

    for (const hook of beforePluginHooks) data = await hook(data);

    let response = [];
    for (let item of data) {
      item = await this.adaptor.insert<T>(this.name, item);
      response.push(item);
    }

    for (const hook of afterPluginHooks) response = await hook(response);
    this.notifySubscribers(response as Doc<T>[], "insert");
    return response;
  }

  async update(query: any, data: any) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeUpdate);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.onUpdate);

    for (const hook of beforePluginHooks) data = await hook(data);
    data = await this.adaptor.update<T>(this.name, query, data);
    for (const hook of afterPluginHooks) data = await hook(data);
    this.notifySubscribers(data as Doc<T>[], "update");
    return data;
  }

  async remove(query: any) {
    const afterPluginHooks = this.plugins.map((plugin) => plugin.onRemove);
    let data = await this.adaptor.remove<T>(this.name, query);
    for (const hook of afterPluginHooks) data = (await hook(data)) as Doc<T>[];
    this.notifySubscribers(data as Doc<T>[], "remove");
    return data;
  }

  async find(query: any) {
    const afterPluginHooks = this.plugins.map((plugin) => plugin.onFind);
    let data = await this.adaptor.find<T>(this.name, query);
    for (const hook of afterPluginHooks) data = (await hook(data)) as Doc<T>[];
    return data;
  }

  async findOne(query: any) {
    const afterPluginHooks = this.plugins.map((plugin) => plugin.onFindOne);
    let data = await this.adaptor.findOne<T>(this.name, query);
    for (const hook of afterPluginHooks) data = (await hook(data)) as Doc<T>;
    return data;
  }

  async aggregate(pipeline: any[]) {
    let data = await this.adaptor.aggregate<T>(this.name, pipeline);
    return data;
  }

  $<T>(options: {
    query: FilterQuery<T>;
    callback: (docs: Doc<T>[], changeType: ChangeType) => void;
    changeType?: ChangeType;
    immediate?: boolean;
  }) {
    const {
      query,
      callback,
      changeType = ["insert", "update", "remove"],
      immediate = false,
    } = options;
    const subscriptionId = this.adaptor.newId();
    this.subscribers.set(subscriptionId, { query, callback, changeType });
    if (immediate)
      this.adaptor
        .find(this.name, query)
        .then((docs) => callback(docs, changeType));
    return () => this.subscribers.delete(subscriptionId);
  }
}
