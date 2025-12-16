import nodemailer, { type Transport } from "nodemailer";
import { google } from "googleapis";
import { configDotenv } from "dotenv";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
configDotenv();

const OAuth2 = google.auth.OAuth2;
const {
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
    EMAIL_USER,
} = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL_USER) {
    throw new Error("Missing required email OAuth environment variables");
}

const oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
})

export const sendEmail = async (to: string, subject: string, text?: string, html?: string): Promise<void> => {
    try {
        const accessTokenResponse = await oauth2Client.getAccessToken();
        if (!accessTokenResponse?.token) {
            throw new Error("Failed to generate access token");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessTokenResponse.token,
            },
        });


        const mailOptions: SMTPTransport.Options = {
            from: `Library <${EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        if(result.accepted.length > 0){
            // console.log('✅ Email Sent:', result.messageId);
        }
        if(result.rejected.length > 0){
            console.log("❌ Email Rejected:", result.messageId);
        }
        return;
    } catch (error) {
        console.error("Email error:", error);
        throw error;
    }
}