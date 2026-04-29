import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Db, MongoClient } from "mongodb";

@Injectable()
export class MongoService implements OnModuleDestroy {
  private client: MongoClient | undefined;

  async getClient(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }
    if (!this.client) {
      this.client = new MongoClient(uri);
      await this.client.connect();
    }
    return this.client;
  }

  async getDb(name?: string): Promise<Db> {
    const client = await this.getClient();
    return client.db(name ?? process.env.MONGODB_DB ?? "mei");
  }

  async onModuleDestroy() {
    await this.client?.close();
    this.client = undefined;
  }
}
