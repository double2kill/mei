import { Module } from "@nestjs/common";
import { ContentModule } from "../content/content.module";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthService } from "./admin-auth.service";
import { AdminGuard } from "./admin.guard";
import { AdminQuizController } from "./admin-quiz.controller";
import { AdminQuizService } from "./admin-quiz.service";
import { AdminScreenController } from "./admin-screen.controller";
import { AdminScreenService } from "./admin-screen.service";

@Module({
  imports: [ContentModule],
  controllers: [
    AdminAuthController,
    AdminQuizController,
    AdminScreenController,
  ],
  providers: [
    AdminAuthService,
    AdminGuard,
    AdminQuizService,
    AdminScreenService,
  ],
})
export class AdminModule {}
