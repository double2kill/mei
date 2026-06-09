import { Injectable, NotFoundException } from "@nestjs/common";
import { AppContentStore } from "./app-content.store";
import type {
  QuizEntry,
  QuizRow,
  ScreenEntries,
} from "./content.types";

@Injectable()
export class ContentService {
  constructor(private readonly store: AppContentStore) {}

  private async buildScreenEntries(
    screen: "home" | "eva",
  ): Promise<ScreenEntries> {
    const content = await this.store.get();
    const rows =
      screen === "home" ? content.homeScreen.rows : content.evaScreen.rows;
    const quizMap = new Map(content.quizzes.map((q) => [q.id, q]));
    const entries: QuizEntry[] = rows.map((row) => {
      const quiz = quizMap.get(row.quizId);
      if (!quiz) {
        throw new NotFoundException(`quiz not found: ${row.quizId}`);
      }
      return {
        id: quiz.id,
        path: quiz.path,
        title: quiz.title,
        type: quiz.type,
        coverRef: quiz.coverRef ?? row.coverRef,
      };
    });
    return { version: content.version, entries };
  }

  getHomeEntries(): Promise<ScreenEntries> {
    return this.buildScreenEntries("home");
  }

  getEvaEntries(): Promise<ScreenEntries> {
    return this.buildScreenEntries("eva");
  }

  async getQuiz(id: string): Promise<QuizRow> {
    const content = await this.store.get();
    const quiz = content.quizzes.find((q) => q.id === id);
    if (!quiz) {
      throw new NotFoundException(`quiz not found: ${id}`);
    }
    return quiz;
  }
}
