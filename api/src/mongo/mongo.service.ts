import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Db, MongoClient } from "mongodb";

@Injectable()
export class MongoService implements OnModuleDestroy {
  private client: MongoClient | undefined;

  private getUri(): string {
    if (process.env.MONGODB_URI) {
      return process.env.MONGODB_URI;
    }
    const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_PORT } =
      process.env;
    if (!MONGODB_HOST) {
      throw new Error("MONGODB_URI or MONGODB_HOST is not set");
    }
    const port = MONGODB_PORT ?? "27017";
    if (MONGODB_USERNAME && MONGODB_PASSWORD) {
      const user = encodeURIComponent(MONGODB_USERNAME);
      const pass = encodeURIComponent(MONGODB_PASSWORD);
      return `mongodb://${user}:${pass}@${MONGODB_HOST}:${port}`;
    }
    return `mongodb://${MONGODB_HOST}:${port}`;
  }

  async getClient(): Promise<MongoClient> {
    const uri = this.getUri();
    if (!this.client) {
      this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
      await this.client.connect();
    }
    return this.client;
  }

  async getDb(name?: string): Promise<Db> {
    const client = await this.getClient();
    return client.db(
      name ?? process.env.MONGODB_DATABASE ?? process.env.MONGODB_DB ?? "mei",
    );
  }

  async onModuleDestroy() {
    await this.client?.close();
    this.client = undefined;
  }
}
