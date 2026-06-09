import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { BackupModule } from "./backup/backup.module";
import { ContentModule } from "./content/content.module";
import { MongoModule } from "./mongo/mongo.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongoModule,
    ContentModule,
    AdminModule,
    BackupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
