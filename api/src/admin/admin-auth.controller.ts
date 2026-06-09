import { Body, Controller, Post } from "@nestjs/common";
import { AdminAuthService } from "./admin-auth.service";

type LoginBody = {
  username?: string;
  password?: string;
};

@Controller("admin")
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}

  @Post("login")
  login(@Body() body: LoginBody) {
    return this.auth.login(body.username?.trim() ?? "", body.password ?? "");
  }
}
