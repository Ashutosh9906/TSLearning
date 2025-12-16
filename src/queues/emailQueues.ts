import { Queue } from "bullmq";
import { redisConnection } from "../config/redisConfig.js";

export interface EmailJob {
    to: string,
    subject: string,
    text?: string,
    html?: string
}

export const emailQueue = new Queue<EmailJob>("email-queue", {
    connection: redisConnection
})