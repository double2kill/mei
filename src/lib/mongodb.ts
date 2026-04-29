import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  client: MongoClient | undefined;
};

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!globalForMongo.client) {
    globalForMongo.client = new MongoClient(uri);
    await globalForMongo.client.connect();
  }
  return globalForMongo.client;
}

export async function getDb(name?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(name ?? process.env.MONGODB_DB ?? "mei");
}
