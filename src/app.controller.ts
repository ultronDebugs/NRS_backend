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
      "",
      "  _   _            _   _      ____       _        ",
      " | \\ | | ___  _ __| |_| |__  / ___| __ _| |_ ___  ",
      " |  \\| |/ _ \\| '__| __| '_ \\| |  _ / _` | __/ _ \\ ",
      " | |\\  | (_) | |  | |_| | | | |_| | (_| | ||  __/ ",
      " |_| \\_|\\___/|_|   \\__|_| |_|\\____|\\__,_|\\__\\___| ",
      "",
      "  E-Invoice API  |  v1.0  |  /api for Swagger Docs",
      "",
    ].join("\n");
  }
}
