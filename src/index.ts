import express from "express";
import type { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();
const PORT = process.env.PORT || 5001;
const URI = process.env.MONGO_URI || "";

import errorHandling from "./middlewares/errorHandler.js";
import { parseRequestBody, parseRequestQuery } from "./middlewares/parseBody.js";
import { bookFilterSchema, bookSchema, signInSchema, signUpSchema, type BookBody, type filterQuery, type SignInBody, type SignUpBody } from "./validators/vaidationSchema.js";
import User from "./models/userModel.js";
import { buildBookFilter, comparePassword, createCookie, handleResponse, hashPassword } from "./utilities/userUtility.js";
import Book from "./models/bookModel.js";
import { checkAuthentication, checkAuthorizationLibrarian } from "./middlewares/auth.js";

mongoose.connect(URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(() => {
        console.log("Unable to Connect MongoDB");
        process.exit(1);
    });

app.use(cookieParser());
app.use(express.json());
app.use(errorHandling);

app.post("/api/signUp", parseRequestBody(signUpSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated as SignUpBody;
        data.password = await hashPassword(data.password);
        if (data.role === "student") {
            const isUser = await User.findOne({ email: data.email });
            if (isUser) {
                handleResponse(res, 409, `User with email: ${data.email} already exist`);
                return;
            }
            const user = await User.create({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                department: data.department,
                studentId: data.studentId,
            })
            createCookie(res, user._id, user.role)
        } else if (data.role === "librarian") {
            const isUser = await User.findOne({ email: data.email });
            if (isUser) {
                handleResponse(res, 409, `User with email: ${data.email} already exist`);
                return;
            }
            const user = await User.create({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                employeeId: data.employeeId,
            })
            createCookie(res, user._id, user.role)
        }
        handleResponse(res, 201, "User SignUp Successfully");
        return
    } catch (error) {
        next(error);
    }
});

app.post("/api/signIn", parseRequestBody(signInSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated as SignInBody;
        const user = await User.findOne({ email: data.email });
        if (!user) {
            handleResponse(res, 409, "Invalid Credentials")
            return;
        }
        const isValid = await comparePassword(data.password, user.password);
        if (!isValid) {
            handleResponse(res, 401, "Invalid Credentials")
            return;
        }
        createCookie(res, user._id, user.role);
        handleResponse(res, 200, "User signIn successfully")
        return;
    } catch (error) {
        next(error);
    }
});

app.post("/api/addBook", parseRequestBody(bookSchema), checkAuthentication, checkAuthorizationLibrarian, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated as BookBody;
        const isBook = await Book.findOne({ author: data.author, title: data.title });
        if (isBook) {
            handleResponse(res, 409, "Book already exist");
            return;
        }
        const book = await Book.create({
            title: data.title,
            author: data.author,
            category: data.category,
            issueYear: data.issueYear,
            totalCopies: data.totalCopies,
            availableCopies: data.totalCopies,
        })
        handleResponse(res, 200, "Book added to library successfully");
        return;
    } catch (error) {
        next(error);
    }
})

app.get("/books", parseRequestQuery(bookFilterSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const queryData = res.locals.validated as filterQuery;
        const filters = buildBookFilter(queryData);
        const books = await Book.find(filters);
        if(books.length === 0){
            handleResponse(res, 404, "Books with such filters not found");
            return;
        }
        handleResponse(res, 200, "Books fetched successfully", books); 
        return;
    } catch (error) {
        next(error);
    }
})



app.listen(PORT, () => {
    console.log(`Server started on PORT : ${PORT}`);
})