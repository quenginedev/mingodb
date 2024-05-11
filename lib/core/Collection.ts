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
    const afterPluginHooks = this.plugins.map((plugin) => plugin.inserted);

    let payload = { data: [data] };
    for (const hook of beforePluginHooks) payload = await hook(payload);
    payload.data[0] = await this.adaptor.insert<T>(this.name, payload.data[0]);
    for (const hook of afterPluginHooks) payload = await hook(payload);
    this.notifySubscribers([payload.data[0] as Doc<T>], "insert");
    return payload.data[0] as Doc<T>;
  }

  async insertMany(data: T[]) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeInsert,);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.inserted);

    let payload = { data };
    for (const hook of beforePluginHooks) payload = await hook(payload);
    let response = [];
    for (let item of payload.data) {
      item = await this.adaptor.insert<T>(this.name, item);
      response.push(item);
    }
    for (const hook of afterPluginHooks) payload = await hook({data: response });
    this.notifySubscribers(payload.data as Doc<T>[], "insert");
    return payload.data;
  }

  async update(query: any, update: any) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeUpdate);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.updated);

    let beforeUpdatePayload = { query, update };
    for (const hook of beforePluginHooks) beforeUpdatePayload = await hook(beforeUpdatePayload);
    const updatedDocs = await this.adaptor.update<T>(this.name, beforeUpdatePayload.query, beforeUpdatePayload.update);
    let updatedPayload = { query, update, data: updatedDocs };
    for (const hook of afterPluginHooks) updatedPayload = await hook(updatedPayload) as { query: any; update: any; data: Doc<T>[] };
    this.notifySubscribers(updatedDocs as Doc<T>[], "update");
    return updatedDocs as Doc<T>[];
  }

  async remove(query: any) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeRemove);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.removed);

    let payload = { query };
    for (const hook of beforePluginHooks) payload = await hook(payload);
    const data = await this.adaptor.remove<T>(this.name, payload.query);
    let removedPayload = { query, data };
    for (const hook of afterPluginHooks) removedPayload = await hook(removedPayload) as { query: any; data: Doc<T>[] };
    this.notifySubscribers(removedPayload.data as Doc<T>[], "remove");
    return removedPayload.data as Doc<T>[];
  }

  async find(query: any) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeFind);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.found);
    let payload = { query };
    for (const hook of beforePluginHooks) payload = await hook(payload);
    let data = await this.adaptor.find<T>(this.name, payload.query);
    let foundPayload = { query, data };
    for (const hook of afterPluginHooks) foundPayload = await hook(foundPayload) as { query: any; data: Doc<T>[] };
    return foundPayload.data as Doc<T>[];
  }

  async findOne(query: any) {
    const beforePluginHooks = this.plugins.map((plugin) => plugin.beforeFindOne);
    const afterPluginHooks = this.plugins.map((plugin) => plugin.foundOne);
    let payload = { query };
    for (const hook of beforePluginHooks) payload = await hook(payload);
    let data = await this.adaptor.findOne<T>(this.name, payload.query);
    let foundPayload = { query, data };
    for (const hook of afterPluginHooks) foundPayload = await hook(foundPayload) as { query: any; data: Doc<T> | null };
    return foundPayload.data as Doc<T> | null;
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
