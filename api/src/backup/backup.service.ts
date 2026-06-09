import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { promises as fs } from "fs";
import path from "path";
import { MongoService } from "../mongo/mongo.service";

type BackupMeta = {
  createdAt: string;
  database: string;
  collections: string[];
};

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private running = false;

  constructor(private readonly mongo: MongoService) {}

  private enabled(): boolean {
    return process.env.BACKUP_ENABLED !== "false";
  }

  private backupDir(): string {
    const dir = process.env.BACKUP_DIR?.trim() || "backups";
    return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  }

  private retentionDays(): number {
    const n = Number(process.env.BACKUP_RETENTION_DAYS ?? "30");
    return Number.isFinite(n) && n > 0 ? n : 30;
  }

  private dbName(): string {
    return (
      process.env.MONGODB_DATABASE?.trim() ||
      process.env.MONGODB_DB?.trim() ||
      "mei"
    );
  }

  private stamp(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }

  async createBackup(): Promise<string | null> {
    if (this.running) {
      this.logger.warn("backup skipped: previous run still in progress");
      return null;
    }
    this.running = true;
    const root = this.backupDir();
    const folder = path.join(root, this.stamp());
    try {
      await fs.mkdir(folder, { recursive: true });
      const db = await this.mongo.getDb();
      const database = this.dbName();
      const collections = await db.listCollections().toArray();
      const names: string[] = [];
      for (const item of collections) {
        const name = item.name;
        if (!name || name.startsWith("system.")) continue;
        const docs = await db.collection(name).find().toArray();
        await fs.writeFile(
          path.join(folder, `${name}.json`),
          JSON.stringify(docs, null, 2),
          "utf8",
        );
        names.push(name);
      }
      const meta: BackupMeta = {
        createdAt: new Date().toISOString(),
        database,
        collections: names,
      };
      await fs.writeFile(
        path.join(folder, "_meta.json"),
        JSON.stringify(meta, null, 2),
        "utf8",
      );
      await this.pruneOldBackups(root);
      this.logger.log(`backup saved: ${folder} (${names.length} collections)`);
      return folder;
    } catch (err) {
      this.logger.error("backup failed", err instanceof Error ? err.stack : err);
      return null;
    } finally {
      this.running = false;
    }
  }

  private async pruneOldBackups(root: string) {
    const keepMs = this.retentionDays() * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - keepMs;
    let entries: string[];
    try {
      entries = await fs.readdir(root);
    } catch {
      return;
    }
    for (const name of entries) {
      const full = path.join(root, name);
      try {
        const stat = await fs.stat(full);
        if (!stat.isDirectory() || stat.mtimeMs >= cutoff) continue;
        await fs.rm(full, { recursive: true, force: true });
        this.logger.log(`backup pruned: ${full}`);
      } catch {
        continue;
      }
    }
  }

  @Cron(process.env.BACKUP_CRON ?? "0 3 * * *")
  async scheduledBackup() {
    if (!this.enabled()) return;
    await this.createBackup();
  }
}
