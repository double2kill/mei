import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AppContentStore } from "../content/app-content.store";
import { COVER_REF_SET } from "../content/cover-refs";
import type { QuizRow, QuizType } from "../content/content.types";

const ID_RE = /^[a-z0-9-]+$/;
const TYPES = new Set<QuizType>([
  "fixed",
  "random",
  "segment",
  "sentence",
  "baike",
  "baike-en",
]);

function normalizeQuiz(input: Partial<QuizRow> & { id: string }): QuizRow {
  const id = input.id.trim();
  if (!ID_RE.test(id)) {
    throw new BadRequestException("invalid quiz id");
  }
  const type = input.type;
  if (!type || !TYPES.has(type)) {
    throw new BadRequestException("invalid quiz type");
  }
  const title = input.title?.trim();
  if (!title) {
    throw new BadRequestException("title is required");
  }
  const quiz: QuizRow = { id, path: `/test/${id}`, title, type };
  if (input.coverRef) {
    if (!COVER_REF_SET.has(input.coverRef)) {
      throw new BadRequestException("invalid coverRef");
    }
    quiz.coverRef = input.coverRef;
  }
  if (type === "fixed" && input.settings) quiz.settings = true;
  if (input.answerText !== undefined) quiz.answerText = input.answerText;
  if (input.text !== undefined) quiz.text = input.text;
  if (input.usageRequired !== undefined) {
    quiz.usageRequired = Number(input.usageRequired);
  }
  if (input.wikiTitle !== undefined) quiz.wikiTitle = input.wikiTitle;
  if (input.wikiDetail !== undefined) quiz.wikiDetail = input.wikiDetail;
  if (type === "segment" && !quiz.answerText?.trim()) {
    throw new BadRequestException("answerText is required for segment");
  }
  if (type === "sentence" && !quiz.text?.trim()) {
    throw new BadRequestException("text is required for sentence");
  }
  if ((type === "baike" || type === "baike-en") && !quiz.wikiTitle?.trim()) {
    throw new BadRequestException("wikiTitle is required for baike");
  }
  if ((type === "baike" || type === "baike-en") && !quiz.wikiDetail?.trim()) {
    throw new BadRequestException("wikiDetail is required for baike");
  }
  return quiz;
}

@Injectable()
export class AdminQuizService {
  constructor(private readonly store: AppContentStore) {}

  async list() {
    const content = await this.store.get();
    return { version: content.version, quizzes: content.quizzes };
  }

  async get(id: string) {
    const content = await this.store.get();
    const quiz = content.quizzes.find((q) => q.id === id);
    if (!quiz) {
      throw new NotFoundException(`quiz not found: ${id}`);
    }
    return quiz;
  }

  async create(body: Partial<QuizRow> & { id: string }) {
    const quiz = normalizeQuiz(body);
    await this.store.update((content) => {
      if (content.quizzes.some((q) => q.id === quiz.id)) {
        throw new ConflictException(`quiz exists: ${quiz.id}`);
      }
      return { ...content, quizzes: [...content.quizzes, quiz] };
    });
    return quiz;
  }

  async update(id: string, body: Partial<QuizRow>) {
    const quiz = normalizeQuiz({ ...body, id });
    await this.store.update((content) => {
      const index = content.quizzes.findIndex((q) => q.id === id);
      if (index < 0) {
        throw new NotFoundException(`quiz not found: ${id}`);
      }
      const quizzes = [...content.quizzes];
      quizzes[index] = quiz;
      return { ...content, quizzes };
    });
    return quiz;
  }

  async remove(id: string) {
    await this.store.update((content) => {
      const inHome = content.homeScreen.rows.some((r) => r.quizId === id);
      const inEva = content.evaScreen.rows.some((r) => r.quizId === id);
      if (inHome || inEva) {
        throw new ConflictException("quiz is used in screen");
      }
      const quizzes = content.quizzes.filter((q) => q.id !== id);
      if (quizzes.length === content.quizzes.length) {
        throw new NotFoundException(`quiz not found: ${id}`);
      }
      return { ...content, quizzes };
    });
    return { ok: true };
  }
}
