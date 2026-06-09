import { Injectable, UnauthorizedException } from "@nestjs/common";

const DEFAULT_USER = "mei";
const DEFAULT_PASS = "mei2026";
const DEFAULT_TOKEN = "mei-admin-token";

@Injectable()
export class AdminAuthService {
  private readonly username =
    process.env.ADMIN_USERNAME?.trim() || DEFAULT_USER;
  private readonly password =
    process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASS;
  private readonly token = process.env.ADMIN_TOKEN?.trim() || DEFAULT_TOKEN;

  login(username: string, password: string) {
    if (username !== this.username || password !== this.password) {
      throw new UnauthorizedException("invalid credentials");
    }
    return { token: this.token };
  }

  validateToken(token: string | undefined) {
    return Boolean(token && token === this.token);
  }
}
