import ObjectID from "bson-objectid";
import { Query } from "mingo";
import { Hook, HookFn } from '../plugins'
import { compose } from "ramda";

type Type = 'string' | 'number' | 'date' | 'id' | 'object' | 'array' | 'boolean';

type FieldDefinition = {
  type: Type,
  require?: boolean,
  unique?: boolean,
  many?: boolean,
  of?: ModelDefinition
};

type ModelDefinition = Record<string, FieldDefinition>;

type SchemaMap = Record<string, ModelDefinition>;

export type FieldsMap<Fields> = {
  [Key in keyof Fields]:
  Fields[Key] extends { type: 'array', of: infer Of } ? Array<FieldsMap<Of>> :
  Fields[Key] extends { type: 'object', of: infer Of } ? FieldsMap<Of> :
  Fields[Key] extends { type: 'string' } ? string :
  Fields[Key] extends { type: 'number' } ? number :
  Fields[Key] extends { type: 'date' } ? Date :
  Fields[Key] extends { type: 'boolean' } ? boolean :
  Fields[Key] extends { type: 'id' } ? string :
  never
}

type Config<Schema extends SchemaMap> = {
  version: number
  name: string
  schema: Schema,
  plugins?: Array<HookFn>
}

export type Document<T> = T & { _id: string }

export const MingoDb = async <
  Schema extends SchemaMap
>(config: Config<Schema>) => {
  let db: IDBDatabase
  let hook: Hook = {}

  const initialize = async () => {
    return new Promise(async (resolve, reject) => {
      const plugins = config.plugins ?? []
      for (const plugin of plugins) {
        hook = await plugin(hook)
      }

      const request = indexedDB.open(config.name, config.version);

      request.onerror = (event: any) => {
        console.error("Database error: ", event.target.error.message);
        reject(event.target.error.message);
      };

      request.onsuccess = (event: any) => {
        db = event.target.result;
        console.log("Database initialized successfully");
        resolve(db);
      };

      request.onupgradeneeded = (event: any) => {
        db = event.target.result;
        Object.entries(config.schema).forEach(([collectionName]) => {
          if (!db.objectStoreNames.contains(collectionName)) db.createObjectStore(collectionName, { keyPath: '_id' })
        })
        console.log(db.objectStoreNames)
        // Create object stores and indexes here
      };
    });
  }

  await initialize()

  type ModelName = keyof Schema
  type Fields = Schema[ModelName]
  type Data = FieldsMap<Fields>


  const insertOne = async (name: ModelName, data: Data) => {
    const preHookPlugins = hook.insertOne?.pre ?? []
    for (const plugin of preHookPlugins) { data = plugin(data) }

    let payload: Document<Data> = {
      ...data,
      _id: new ObjectID().toHexString(),
    }
    db
      .transaction(name as string, 'readwrite')
      .objectStore(name as string)
      .add(payload)
    return payload
  }

  const queryOne = (collection: ModelName, query: any = {}): Promise<Document<Data> | null> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection as string], "readonly");
      const store = transaction.objectStore(collection as string);
      const request = store.openCursor();

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const document = new Query(query)
          const record = cursor.value
          const isMatch = document.test(record)
          isMatch ? resolve(record) : cursor.continue()
        } else {
          // No more entries, document not found
          resolve(null);
        }
      };

      request.onerror = (event: any) => {
        console.error("Error in findOne request: " + event.target.errorCode);
        reject(event);
      };
    });
  }


  const findMany = (collection: ModelName, query: any = {}): Promise<Array<Document<Data>>> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection as string], "readonly");
      const store = transaction.objectStore(collection as string);
      const request = store.openCursor();
      const results: any[] = [];

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const document = new Query(query)
          const record = cursor.value
          const isMatch = document.test(record)

          if (isMatch) {
            results.push(record);
          }
          cursor.continue();
        } else {
          // No more entries
          resolve(results);
        }
      };

      request.onerror = (event: any) => {
        console.error("Error in findMany request: " + event.target.errorCode);
        reject(event);
      };
    });
  }

  const updateOne = (collection: ModelName, data: FieldsMap<Fields>) => {
    return new Promise((resolve) => {
      let payload = { ...data }
      const preHookPlugins = hook.updateOne?.pre ?? []
      for (const plugin of preHookPlugins) { payload = plugin(payload) }
      const transaction = db.transaction([collection as string], "readwrite");
      const store = transaction.objectStore(collection as string);
      store.put(payload);
      resolve({ ...payload })
    })
  }

  const deleteOne = (collection: ModelName, query: Partial<FieldsMap<Fields>>) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([collection as string], 'readwrite');
      const store = transaction.objectStore(collection as string);
      const request = store.openCursor();

      request.onsuccess = (event: any) => {
        const cursor = event.target.result;

        if (cursor) {
          const document = new Query(query)
          const record = cursor.value
          const isMatch = document.test(record)

          if (isMatch) {
            // Delete the matching record
            const deleteRequest = cursor.delete();
            deleteRequest.onsuccess = () => {
              console.log(`Document with key ${cursor.key} deleted successfully`);
              resolve(cursor.key);
            };
            deleteRequest.onerror = (error: any) => {
              console.error('Error deleting document:', error);
              reject(error);
            };
          } else {
            cursor.continue();
          }
        } else {
          // No more entries or no matching entry found
          resolve(null);
        }
      };

      request.onerror = (event: any) => {
        console.error('Error in deleteOne request:', event.target.errorCode);
        reject(event);
      };
    });
  }

  return {
    insertOne,
    queryOne,
    findMany,
    updateOne,
    deleteOne
  }
}
