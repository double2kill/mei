import { BadRequestException, Injectable } from "@nestjs/common";
import { AppContentStore } from "../content/app-content.store";
import type { ScreenRow } from "../content/content.types";

type ScreenName = "home" | "eva";

function parseRows(rows: ScreenRow[]): ScreenRow[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new BadRequestException("rows is required");
  }
  return rows.map((row) => {
    const quizId = row.quizId?.trim();
    const coverRef = row.coverRef?.trim();
    if (!quizId || !coverRef) {
      throw new BadRequestException("invalid screen row");
    }
    return { quizId, coverRef };
  });
}

@Injectable()
export class AdminScreenService {
  constructor(private readonly store: AppContentStore) {}

  async get(screen: ScreenName) {
    const content = await this.store.get();
    const rows =
      screen === "home" ? content.homeScreen.rows : content.evaScreen.rows;
    return { version: content.version, screen, rows };
  }

  async replace(screen: ScreenName, rows: ScreenRow[]) {
    const parsed = parseRows(rows);
    const content = await this.store.update((current) => {
      const quizIds = new Set(current.quizzes.map((q) => q.id));
      for (const row of parsed) {
        if (!quizIds.has(row.quizId)) {
          throw new BadRequestException(`quiz not found: ${row.quizId}`);
        }
      }
      if (screen === "home") {
        return { ...current, homeScreen: { rows: parsed } };
      }
      return { ...current, evaScreen: { rows: parsed } };
    });
    const rowsOut =
      screen === "home" ? content.homeScreen.rows : content.evaScreen.rows;
    return { version: content.version, screen, rows: rowsOut };
  }
}
