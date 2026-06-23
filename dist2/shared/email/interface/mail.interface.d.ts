export interface EmailOptions {
    to: string | string[];
    subject: string;
    template?: string;
    context?: Record<string, any>;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer;
        contentType?: string;
    }>;
}
export interface WelcomeEmailContext {
    businessName: string;
    email: string;
    loginUrl: string;
}
export interface PasswordResetContext {
    businessName: string;
    resetToken: string;
    resetUrl: string;
    expiresIn: string;
}
export interface VerificationEmailContext {
    businessName: string;
    verificationToken: string;
    verificationUrl: string;
}
