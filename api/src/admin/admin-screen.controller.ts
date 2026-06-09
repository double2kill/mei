import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import { AdminScreenService } from "./admin-screen.service";
import type { ScreenRow } from "../content/content.types";

type ScreenBody = { rows?: ScreenRow[] };

@Controller("admin/screens")
@UseGuards(AdminGuard)
export class AdminScreenController {
  constructor(private readonly screens: AdminScreenService) {}

  @Get(":screen")
  get(@Param("screen") screen: "home" | "eva") {
    return this.screens.get(screen);
  }

  @Put(":screen")
  replace(@Param("screen") screen: "home" | "eva", @Body() body: ScreenBody) {
    return this.screens.replace(screen, body.rows ?? []);
  }
}
