import { Worker } from "bullmq";
import { redisConnection } from "../config/redisConfig.js";
import { sendEmail } from "../utilities/mailUtility.js";
import { type EmailJob } from "../queues/emailQueues.js";

export const emailWorker = new Worker<EmailJob>(
    "email-queue",
    async (job) => {
        const { to, subject, text, html } = job.data;
        await sendEmail(to, subject, text, html);
        console.log(`✅ Email sent to ${to} | Job ID: ${job.id}`);
    },
    {
        connection: redisConnection,
    }
)