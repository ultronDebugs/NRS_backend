"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const cookieParser = require("cookie-parser");
const helmet_1 = require("helmet");
function parseAllowedOrigins(value) {
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
        }
        catch {
            return origin.replace(/\/+$/, "");
        }
    });
}
async function bootstrap() {
    const logger = new common_1.Logger("Bootstrap");
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
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
    const allowedOrigins = Array.from(new Set([
        ...parseAllowedOrigins(process.env.FRONTEND_URL),
        ...parseAllowedOrigins(process.env.CORS_ORIGINS),
        ...defaultOrigins,
    ]));
    if (process.env.NODE_ENV === "production" &&
        allowedOrigins.every((origin) => defaultOrigins.includes(origin))) {
        logger.warn("No production CORS origin is configured. Set FRONTEND_URL or CORS_ORIGINS to the deployed frontend origin.");
    }
    logger.log(`Allowed CORS origins: ${JSON.stringify(allowedOrigins)}`);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                logger.warn(`CORS BLOCKED — Origin: "${origin}" is not in allowed list: ${JSON.stringify(allowedOrigins)}`);
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
    app.use((0, helmet_1.default)());
    app.use(cookieParser());
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
    if (process.env.NODE_ENV !== "production") {
        const config = new swagger_1.DocumentBuilder()
            .setTitle("Genius-Excel E-Invoice API")
            .setDescription("Genius-Excel System Integrator — FIRS E-Invoicing Platform")
            .setVersion("1.0")
            .addTag("Genius-Excel")
            .addBearerAuth()
            .build();
        const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup("api", app, documentFactory);
    }
    await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
//# sourceMappingURL=main.js.map