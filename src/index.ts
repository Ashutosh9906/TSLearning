// Required module imports 
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
configDotenv();

// constant declaration
const app = express();
const PORT = process.env.PORT || 5001;
const URI = process.env.MONGO_URI || "";

// custom module imports
import errorHandling from "./middlewares/errorHandler.js";
import { emailQueue } from "./queues/emailQueues.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import borrowRoutes from "./routes/borrorRoutes.js"

// Database connection
mongoose.connect(URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(() => {
        console.log("Unable to Connect MongoDB");
        process.exit(1);
    });

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(errorHandling);

// App Routes
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrows", borrowRoutes);

const router = express.Router();

app.post("/send-mail", async (req, res) => {
    const { email } = req.body;

    try {
        // await sendEmail(
        //     email,
        //     "Welcome to Our App",
        //     "Welcome! Your account is ready.",
        //     "<h1>Welcome!</h1><p>Your account is ready.</p>"
        // );

        await emailQueue.add(
            "send-email",
            {
                to: email,
                subject: "Welcome!",
                html: "<h1>Welcome to our app</h1>",
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                }
            });
        console.log("📨 Email job added to queue"); ``

        res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send email" });
    }
});

// Starting on the server
app.listen(PORT, () => {
    console.log(`Server started on PORT : ${PORT}`);
})