import Adaptor, { Doc } from ".";
import { Query, aggregate } from "mingo";
import { UpdateExpression, updateObject } from "mingo/updater";
import type { FilterQuery, PipelineStage, UpdateQuery } from "mongoose";

export class MemoryAdaptor extends Adaptor {
  private records = new Map<string, Map<string, any>>();

  createNewCollection(collection: string) {
    this.records.set(collection, new Map<string, any>());
  }

  insert<T>(collection: string, data: T): Promise<Doc<T>> {
    if (!this.records.has(collection)) this.createNewCollection(collection);
    const insertData = { ...data, _id: this.newId() };
    this.records.get(collection)?.set(insertData._id, insertData);
    return Promise.resolve(insertData);
  }

  update<T>(
    collection: string,
    query: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<Doc<T>> {
    if (!this.records.has(collection)) this.createNewCollection(collection);
    const collectionRecords = this.records.get(collection);
    const docs = Array.from(collectionRecords?.values() || []);
    const mingoQuery = new Query(query);
    const updatedDocs = docs.filter((doc) => mingoQuery.test(doc));
    

    updatedDocs.forEach((doc) => {
      console.log(doc, data);
      updateObject(doc, data as UpdateExpression);
      collectionRecords?.set(doc._id, doc);
    });

    return Promise.resolve(updatedDocs as any);
  }

  remove<T>(collection: string, query: FilterQuery<T>): Promise<Doc<T>[]> {
    const records = this.records.get(collection);
    if (!records) return Promise.reject(new Error("Collection not found"));
    const docs = Array.from(records.values()) as Doc<T>[];
    const mingoQuery = new Query(query);
    const removedDocs = docs.filter((doc) => mingoQuery.test(doc));
    removedDocs.forEach((doc) => records.delete(doc._id));
    return Promise.resolve(removedDocs as Doc<T>[]);
  }

  find<T>(collection: string, query: FilterQuery<T>): Promise<Doc<T>[]> {
    const records = this.records.get(collection);
    if (!records) return Promise.reject(new Error("Collection not found"));
    const docs = Array.from(records.values()) as Doc<T>[];
    const mingoQuery = new Query(query);
    return Promise.resolve(docs.filter((doc) => mingoQuery.test(doc)));
  }

  findOne<T>(
    collection: string,
    query: FilterQuery<T>
  ): Promise<Doc<T> | null> {
    const records = this.records.get(collection);
    if (!records) return Promise.reject(new Error("Collection not found"));
    const docs = Array.from(records.values()) as Doc<T>[];
    const mingoQuery = new Query(query);
    return Promise.resolve(docs.find((doc) => mingoQuery.test(doc)) || null);
  }

  aggregate<T>(
    collection: string,
    pipeline: PipelineStage[]
  ): Promise<Doc<T>[]> {
    const records = this.records.get(collection);
    if (!records) return Promise.reject(new Error("Collection not found"));
    const docs = Array.from(records.values()) as Doc<T>[];
    const aggregation = aggregate(docs, pipeline as unknown as any) as Doc<T>[];
    return Promise.resolve(aggregation);
  }
}
