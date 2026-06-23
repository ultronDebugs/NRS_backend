import { ConfigService } from "@nestjs/config";
import { EmailOptions, WelcomeEmailContext, PasswordResetContext, VerificationEmailContext } from "./interface/mail.interface";
export declare class EmailService {
    private configService;
    private transporter?;
    private readonly logger;
    constructor(configService: ConfigService);
    private createTransporter;
    private loadTemplate;
    private compileTemplate;
    sendMail(options: EmailOptions): Promise<void>;
    private sendViaResendApi;
    sendWelcomeEmail(to: string, context: WelcomeEmailContext): Promise<void>;
    sendPasswordResetEmail(to: string, context: PasswordResetContext): Promise<void>;
    sendVerificationEmail(to: string, context: VerificationEmailContext): Promise<void>;
    sendCustomEmail(to: string | string[], subject: string, html: string, text?: string): Promise<void>;
    testConnection(): Promise<boolean>;
}
