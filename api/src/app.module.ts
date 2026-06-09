import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { ContentModule } from "./content/content.module";
import { MongoModule } from "./mongo/mongo.module";

@Module({
  imports: [MongoModule, ContentModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
