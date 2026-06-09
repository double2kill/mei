import { Controller, Get, Param } from "@nestjs/common";
import { ContentService } from "./content.service";

@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("home")
  getHome() {
    return this.contentService.getHomeEntries();
  }

  @Get("eva")
  getEva() {
    return this.contentService.getEvaEntries();
  }

  @Get("quizzes/:id")
  getQuiz(@Param("id") id: string) {
    return this.contentService.getQuiz(id);
  }
}
