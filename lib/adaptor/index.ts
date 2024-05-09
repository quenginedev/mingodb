import ObjectID from "bson-objectid";
import type { FilterQuery, UpdateQuery, PipelineStage } from "mongoose";

export type Doc<T> = T & { _id: string };

export default abstract class Adaptor {
  private key: string = "_id";

  newId() {
    return new ObjectID().toHexString()
  }

  abstract insert<T>(collection: string, data: T): Promise<Doc<T>>;

  abstract update<T>(
    collection: string,
    query: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<Doc<T>>;

  abstract remove<T>(
    collection: string,
    query: FilterQuery<T>
  ): Promise<Doc<T>[]>;

  abstract find<T>(
    collection: string,
    query: FilterQuery<T>
  ): Promise<Doc<T>[]>;

  abstract findOne<T>(
    collection: string,
    query: FilterQuery<T>
  ): Promise<Doc<T> | null>;
  
  abstract aggregate<T>(
    collection: string, 
    pipeline: PipelineStage[]
  ): Promise<Doc<T>[]>;

}