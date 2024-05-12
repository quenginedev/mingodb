import Database from "../core/Database";
import type { MaybePromise } from "../types";

export type SyncFn = (timestamp: string | null, db: Database) => MaybePromise<void>;

export class Synchronizer {
  private db: Database;
  private syncFn: SyncFn | null;
  syncing = false;

  constructor(db: Database, syncFn: SyncFn | null) {
    this.db = db;
    this.syncFn = syncFn
  }

  async run() {
    try {
      if (this.syncing || !this.syncFn) return;
      this.syncing = true;
      const collection = this.db.collection<{ lastSync: string }>("__mingo_trakers")
      const mingoTrackerRecord = await collection.findOne({})
      
      const lastTimeSynced = mingoTrackerRecord?.lastSync || null;
      await this.syncFn(lastTimeSynced, this.db);

      if(!mingoTrackerRecord) await collection.insert({ lastSync: new Date().toISOString() });
      else await collection.update({ _id: mingoTrackerRecord._id }, { lastSync: new Date().toISOString() });
    } catch (error) {
      console.error(error);
    } finally {
      this.syncing = false;
    }
  }
}