import { Injectable, NotFoundException } from "@nestjs/common";
import { Collection } from "mongodb";
import { MongoService } from "../mongo/mongo.service";
import type { AppContent, AppContentDoc } from "./content.types";

const DOC_ID = "main";
const COLLECTION = "app_content";

@Injectable()
export class AppContentStore {
  constructor(private readonly mongo: MongoService) {}

  private async collection(): Promise<Collection<AppContentDoc>> {
    const db = await this.mongo.getDb();
    return db.collection<AppContentDoc>(COLLECTION);
  }

  async getDoc(): Promise<AppContentDoc> {
    const col = await this.collection();
    const doc = await col.findOne({ _id: DOC_ID });
    if (!doc) {
      throw new NotFoundException("app content not found");
    }
    return doc;
  }

  async get(): Promise<AppContent> {
    const { _id: _, ...content } = await this.getDoc();
    return content;
  }

  async update(
    mutator: (content: AppContent) => AppContent,
  ): Promise<AppContent> {
    const col = await this.collection();
    const doc = await this.getDoc();
    const { _id: _, ...current } = doc;
    const next = mutator(current);
    const saved: AppContentDoc = {
      _id: DOC_ID,
      ...next,
      version: current.version + 1,
    };
    await col.replaceOne({ _id: DOC_ID }, saved);
    const { _id: __, ...content } = saved;
    return content;
  }
}
