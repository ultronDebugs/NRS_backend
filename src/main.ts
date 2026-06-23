import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

function parseAllowedOrigins(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return origin.replace(/\/+$/, "");
      }
    });
}

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app: INestApplication = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  const defaultOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://162.243.229.65:3001",
    "http://162.243.229.65",
  ];

  const allowedOrigins = Array.from(
    new Set([
      ...parseAllowedOrigins(process.env.FRONTEND_URL),
      ...parseAllowedOrigins(process.env.CORS_ORIGINS),
      ...defaultOrigins,
    ]),
  );

  if (
    process.env.NODE_ENV === "production" &&
    allowedOrigins.every((origin) => defaultOrigins.includes(origin))
  ) {
    logger.warn(
      "No production CORS origin is configured. Set FRONTEND_URL or CORS_ORIGINS to the deployed frontend origin.",
    );
  }

  logger.log(`Allowed CORS origins: ${JSON.stringify(allowedOrigins)}`);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (e.g., server-to-server, curl, mobile apps)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(
          `CORS BLOCKED — Origin: "${origin}" is not in allowed list: ${JSON.stringify(allowedOrigins)}`,
        );
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
      "Cache-Control",
      "Pragma",
      "Expires",
      "x-requested-with",
      "x-client-key",
      "x-client-secret",
      "x-api-key",
      "x-api-secret",
    ],
    exposedHeaders: ["Set-Cookie"],
  });



  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Genius-Excel E-Invoice API")
      .setDescription("Genius-Excel System Integrator — FIRS E-Invoicing Platform")
      .setVersion("1.0")
      .addTag("Genius-Excel")
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
