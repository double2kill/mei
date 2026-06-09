import { Module } from "@nestjs/common";
import { AppContentStore } from "./app-content.store";
import { ContentController } from "./content.controller";
import { ContentService } from "./content.service";

@Module({
  controllers: [ContentController],
  providers: [AppContentStore, ContentService],
  exports: [AppContentStore, ContentService],
})
export class ContentModule {}
