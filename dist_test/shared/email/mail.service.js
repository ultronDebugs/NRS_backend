"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const axios_1 = require("axios");
let EmailService = EmailService_1 = class EmailService {
    configService;
    transporter;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.createTransporter();
    }
    createTransporter() {
        if (this.configService.get("RESEND_API_KEY") &&
            this.configService.get("EMAIL_TRANSPORT") !== "smtp") {
            this.logger.log("Email transporter configured for Resend HTTP API");
            return;
        }
        const config = {
            host: this.configService.get("RESEND_API_KEY")
                ? "smtp.resend.com"
                : this.configService.get("MAIL_HOST"),
            port: this.configService.get("RESEND_API_KEY")
                ? 465
                : this.configService.get("MAIL_PORT"),
            secure: this.configService.get("RESEND_API_KEY")
                ? true
                : this.configService.get("MAIL_SECURE", false),
            auth: {
                user: this.configService.get("RESEND_API_KEY")
                    ? "resend"
                    : this.configService.get("MAIL_USER"),
                pass: this.configService.get("RESEND_API_KEY")
                    ? this.configService.get("RESEND_API_KEY")
                    : this.configService.get("MAIL_PASS"),
            },
        };
        if (config.host === "smtp.ethereal.email") {
            config.secure = false;
            config.port = 587;
        }
        this.transporter = nodemailer.createTransport(config);
        this.logger.log(`Email transporter created for ${config.host}:${config.port}`);
    }
    async loadTemplate(templateName) {
        const templatePath = path.join(__dirname, "template", `${templateName}.hbs`);
        return fs.readFileSync(templatePath, "utf8");
    }
    compileTemplate(template, context) {
        const compiledTemplate = handlebars.compile(template);
        return compiledTemplate(context);
    }
    async sendMail(options) {
        try {
            let html = options.html;
            if (options.template && options.context) {
                const template = await this.loadTemplate(options.template);
                html = this.compileTemplate(template, options.context);
            }
            let from = this.configService.get("MAIL_FROM") ||
                this.configService.get("MAIL_USER") ||
                "noreply@genius-excel.com";
            if (!from.includes("<")) {
                from = `"Genius-Excel" <${from}>`;
            }
            const mailOptions = {
                from,
                to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
                subject: options.subject,
                html,
                text: options.text,
                attachments: options.attachments,
            };
            if (this.configService.get("RESEND_API_KEY") &&
                this.configService.get("EMAIL_TRANSPORT") !== "smtp") {
                await this.sendViaResendApi(mailOptions);
                return;
            }
            if (!this.transporter) {
                throw new common_1.InternalServerErrorException("Email transporter is not configured");
            }
            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully to ${options.to}. Message ID: ${result.messageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error.stack);
            throw new common_1.InternalServerErrorException("Failed to send email");
        }
    }
    async sendViaResendApi(mailOptions) {
        const apiKey = this.configService.get("RESEND_API_KEY");
        if (!apiKey) {
            throw new common_1.InternalServerErrorException("RESEND_API_KEY is not configured");
        }
        try {
            const response = await axios_1.default.post("https://api.resend.com/emails", {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject,
                html: mailOptions.html,
                text: mailOptions.text,
                attachments: mailOptions.attachments,
            }, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 15000,
            });
            this.logger.log(`Email sent successfully to ${mailOptions.to}. Message ID: ${response.data?.id ?? "unknown"}`);
        }
        catch (error) {
            const details = axios_1.default.isAxiosError(error)
                ? JSON.stringify(error.response?.data ?? error.message)
                : error instanceof Error
                    ? error.message
                    : String(error);
            this.logger.error(`Resend API email send failed: ${details}`);
            throw new common_1.InternalServerErrorException("Failed to send email");
        }
    }
    async sendWelcomeEmail(to, context) {
        await this.sendMail({
            to,
            subject: "Welcome to Our App!",
            template: "welcome",
            context,
        });
    }
    async sendPasswordResetEmail(to, context) {
        await this.sendMail({
            to,
            subject: "Password Reset Request",
            template: "password-reset",
            context,
        });
    }
    async sendVerificationEmail(to, context) {
        await this.sendMail({
            to,
            subject: "Verify Your Email Address",
            template: "verification",
            context,
        });
    }
    async sendCustomEmail(to, subject, html, text) {
        await this.sendMail({
            to,
            subject,
            html,
            text,
        });
    }
    async testConnection() {
        if (this.configService.get("RESEND_API_KEY") &&
            this.configService.get("EMAIL_TRANSPORT") !== "smtp") {
            return true;
        }
        try {
            if (!this.transporter) {
                return false;
            }
            await this.transporter.verify();
            this.logger.log("Email connection verified successfully");
            return true;
        }
        catch (error) {
            this.logger.error("Email connection failed", error.stack);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=mail.service.js.map