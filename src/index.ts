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
    
// Starting the server
app.listen(PORT, () => {
    console.log(`Server started on PORT : ${PORT}`);
})