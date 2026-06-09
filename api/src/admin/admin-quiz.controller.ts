import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import { AdminQuizService } from "./admin-quiz.service";
import type { QuizRow } from "../content/content.types";

@Controller("admin/quizzes")
@UseGuards(AdminGuard)
export class AdminQuizController {
  constructor(private readonly quizzes: AdminQuizService) {}

  @Get()
  list() {
    return this.quizzes.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.quizzes.get(id);
  }

  @Post()
  create(@Body() body: Partial<QuizRow> & { id: string }) {
    return this.quizzes.create(body);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: Partial<QuizRow>) {
    return this.quizzes.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.quizzes.remove(id);
  }
}
