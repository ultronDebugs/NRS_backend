import { Controller, Get, Header } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

@Controller()
export class AppController {
  @Public()
  @Get("api/v1")
  getApiRoot() {
    return {
      name: "Genius-Excel E-Invoice API",
      version: "1.0",
      status: "ok",
    };
  }

  @Public()
  @Get()
  @Header("Content-Type", "text/plain; charset=utf-8")
  getRoot(): string {
    return [
      "   ____           _               _____               _   ",
      "  / ___| ___ _ __(_)_   _ ___    | ____|_  _____  ___| |  ",
      " | |  _ / _ \\ '_ \\ | | | / __|   |  _| \\ \\/ / __|/ _ \\ |  ",
      " | |_| |  __/ | | | | |_| \\__ \\  | |___ >  < (__|  __/ |  ",
      "  \\____|\\___|_| |_|_|\\__,_|___/__|_____/_/\\_\\___|\\___|_|  ",
      "                             |_____|                      ",
      "",
      "  E-Invoice API  |  v1.0  |  /api for Swagger Docs",
      "",
    ].join("\n");
  }
}
