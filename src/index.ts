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
import { validateRequest } from "./middlewares/parseBody.js";
import { bookFilterSchema, bookRemoveSchema, bookSchema, bookUpdateSchema, signInSchema, signUpSchema, type BookBody, type filterQuery, type removeParams, type SignInBody, type SignUpBody, type updateBody, type updateParams } from "./validators/vaidationSchema.js";
import User from "./models/userModel.js";
import { buildBookFilter, buildBookUpdateFields, comparePassword, createCookie, handleResponse, hashPassword } from "./utilities/userUtility.js";
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

app.post("/api/signUp", validateRequest(signUpSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated.body as SignUpBody;
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

app.post("/api/signIn", validateRequest(signInSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated.body as SignInBody;
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

app.post("/api/addBook", checkAuthentication, checkAuthorizationLibrarian, validateRequest(bookSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated.body as BookBody;
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

app.get("/books", validateRequest(bookFilterSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const queryData = res.locals.validated.query as filterQuery;
        if(Object.keys(queryData).length === 0) {
            const books = await Book.find();
            handleResponse(res, 200, "All Books", books);
            return;
        }
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

app.delete("/removeBook/:id", checkAuthentication, checkAuthorizationLibrarian, validateRequest(bookRemoveSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated.params as removeParams;
        if(Object.keys(data).length === 0) {
            handleResponse(res, 400, "Id not provided");
            return;
        }
        const book = await Book.findOne(data);
        if(!book){
            handleResponse(res, 404, "Book not found");
            return;
        }
        await Book.deleteOne(data);
        handleResponse(res, 200, "Book removed successfully");
        return;
    } catch (error) {
        next(error);
    }
})

app.patch("/updateBook/:id", validateRequest(bookUpdateSchema), async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const dataBody = res.locals.validated.body as updateBody;
        const dataParams = res.locals.validated.params as updateParams;
        if(Object.keys(dataBody).length === 0){
            handleResponse(res, 400, "No fields provided to update.");
            return;
        }
        const book = await Book.findOne(dataParams);
        if(!book){
            handleResponse(res, 404, "Book not found");
            return;
        }
        const updateFields = buildBookUpdateFields(dataBody);
        await Book.updateOne(dataParams, updateFields);
        handleResponse(res, 200, "Book Info Updated Successfully");
        return;
    } catch (error) {
        next(error);
    }
})

app.listen(PORT, () => {
    console.log(`Server started on PORT : ${PORT}`);
})