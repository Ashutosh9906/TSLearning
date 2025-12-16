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
import { bookBorrowSchema, bookFilterSchema, bookIdParamsSchema, bookIdSchema, bookRemoveSchema, bookSchema, bookUpdateSchema, signInSchema, signUpSchema, type BookBody, type borrowBook, type filterQuery, type idParams, type SignInBody, type SignUpBody, type updateBody } from "./validators/vaidationSchema.js";
import User from "./models/userModel.js";
import { buildBookFilter, buildBookUpdateFields, comparePassword, createCookie, handleResponse, hashPassword } from "./utilities/userUtility.js";
import Book from "./models/bookModel.js";
import { checkAuthentication, checkAuthorizationLibrarian, checkAuthorizationStudent } from "./middlewares/auth.js";
import type { IUserCookie } from "./types/modelTypes.js";
import Borrow from "./models/borrowModel.js";
import { sendEmail } from "./utilities/mailUtility.js";
import { emailQueue } from "./queues/emailQueues.js";

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
        const book = await Book.create(data);
        const accessLink = `http://localhost:4000/book/${book._id}`
        handleResponse(res, 201, "Book added to library successfully, you can access it at " + accessLink, book);
        return;
    } catch (error) {
        next(error);
    }
})

app.get("/book/:id", validateRequest(bookIdSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated.params as idParams;
        const book = await Book.findById(data.id).select("-__v -createdAt -updatedAt -totalCopies");
        if (!book) {
            handleResponse(res, 404, "Book Not Found");
            return;
        }
        handleResponse(res, 200, "Book Found successfully", book);
        return;
    } catch (error) {
        next(error);
    }
})

app.get("/books", validateRequest(bookFilterSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const queryData = res.locals.validated.query as filterQuery;
        if (Object.keys(queryData).length === 0) {
            const books = await Book.find();
            handleResponse(res, 200, "All Books", books);
            return;
        }
        const filters = buildBookFilter(queryData);
        const books = await Book.find(filters);
        if (books.length === 0) {
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
        const data = res.locals.validated.params as idParams;
        if (Object.keys(data).length === 0) {
            handleResponse(res, 400, "Id not provided");
            return;
        }
        const book = await Book.findByIdAndDelete(data.id);
        if (!book) {
            handleResponse(res, 404, "Book not found");
            return;
        }
        handleResponse(res, 200, "Book removed successfully");
        return;
    } catch (error) {
        next(error);
    }
})

app.patch("/updateBook/:id", checkAuthentication, checkAuthorizationLibrarian, validateRequest(bookUpdateSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const dataBody = res.locals.validated.body as updateBody;
        const dataParams = res.locals.validated.params as idParams;
        if (Object.keys(dataBody).length === 0) {
            handleResponse(res, 400, "No fields provided to update.");
            return;
        }
        const updateFields = buildBookUpdateFields(dataBody);
        const book = await Book.findByIdAndUpdate(dataParams.id, updateFields);
        console.log(book);
        if (!book) {
            handleResponse(res, 404, "Book not found");
            return;
        }
        handleResponse(res, 200, "Book Info Updated Successfully");
        return;
    } catch (error) {
        next(error);
    }
})

app.post("/borrowBook", checkAuthentication, validateRequest(bookBorrowSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = new mongoose.Types.ObjectId(res.locals.validated.body.id);
        const userId = new mongoose.Types.ObjectId(res.locals.user.id);
        const userBorrowDetail = await Borrow.find({ userId, status: "borrowed" });
        if (Object.keys(userBorrowDetail).length >= 5) {
            handleResponse(res, 409, "Hit the limit to borrow Book, Return previous books first");
            return;
        }
        const book = await Book.findOneAndUpdate(
            {
                _id: data.id,
                availableCopies: { $gte: 0 }
            },
            {
                $inc: { availableCopies: -1 }
            },
            {
                new: true
            }
        );
        for (let book of userBorrowDetail) {
            if (book.userId == userId && book.bookId == data) {
                handleResponse(res, 409, "Book already borrowed");
                return;
            }
        }
        if (!book) {
            handleResponse(res, 404, "Book Not found");
            return;
        }
        const borrowDetails = await Borrow.create({
            userId,
            bookId: data,
        })
        handleResponse(res, 200, "Book Borrowes successfully", borrowDetails);
        return;
    } catch (error) {
        next(error);
    }
})

app.get("/borrowedBook", checkAuthentication, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = new mongoose.Types.ObjectId(res.locals.user.id);
        const borrowedData = await Borrow.find({ userId });
        if (Object.keys(borrowedData).length == 0) {
            handleResponse(res, 404, "No books borrowed");
            return;
        }
        handleResponse(res, 200, "Borrowed books details", borrowedData);
        return;
    } catch (error) {
        next(error);
    }
})

app.patch("/renewBook/:id", checkAuthentication, validateRequest(bookIdSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = new mongoose.Types.ObjectId(res.locals.validated.params.id);
        const userId = new mongoose.Types.ObjectId(res.locals.user.id);
        const updatedBorrow = await Borrow.findOneAndUpdate(
            {
                userId,
                bookId: data,
                status: "borrowed",
                renewalCount: { $lt: 1 }
            },
            {
                $inc: { renewalCount: 1 },
                $set: {
                    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            },
            { new: true }
        );
        if (!updatedBorrow) {
            handleResponse(res, 404, "Book cannot be renewed");
            return
        }
        handleResponse(res, 201, "Book renewd successfullt", updatedBorrow);
        return;
    } catch (error) {
        next(error);
    }
})

app.patch("/returnBook/:id", checkAuthentication, validateRequest(bookIdSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookId = new mongoose.Types.ObjectId(res.locals.validated.params.id);
        const userId = new mongoose.Types.ObjectId(res.locals.user.id);
        const returnDetails = await Borrow.findOneAndUpdate(
            {
                userId,
                bookId,
                status: "borrowed",
            },
            {
                $set: {
                    returnedAt: new Date(Date.now()),
                    status: "returned"
                }
            },
            { new: true }
        );
        if (!returnDetails) {
            handleResponse(res, 404, "Borrow details not found");
            return;
        }
        await Book.findByIdAndUpdate({ _id: bookId }, {
            $inc: {
                availableCopies: 1
            }
        })
        handleResponse(res, 200, "Book returned successfully", returnDetails);
    } catch (error) {
        next(error);
    }
})

// TRANSCATION ROUTE
// app.post("/boorowBook", checkAuthentication, checkAuthorizationStudent, validateRequest(bookBorrowSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const session = await mongoose.startSession()
//     session.startTransaction();
//     try {
//         const data = res.locals.validated.body as borrowBook;
//         const userId = new mongoose.Types.ObjectId(res.locals.user.id);
//         const userDetail = await Borrow.find({ userId, status: "borrowed" });
//         if (Object.keys(userDetail).length >= 5) {
//             handleResponse(res, 409, "Hit the limit to borrow Book, Return previous books first");
//             return;
//         }
//         const book = await Book.findOneAndUpdate(
//             {
//                 _id: data.id,
//                 availableCopies: { $gte: 0 }
//             },
//             {
//                 $inc: { availableCopies: -1 }
//             },
//             {
//                 new: true,
//                 session
//             }
//         );
//         if (!book) {
//             throw new Error("INSUFFICIENT_BOOK")
//         }
//         const borrowDetails = await Borrow.create(
//             [
//                 {
//                     userId,
//                     bookId: data.id,
//                 }
//             ],
//             { session }
//         );
//         await session.commitTransaction();
//         session.endSession();
//         handleResponse(res, 200, "Book Borrowes successfully", borrowDetails);
//         return;
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         if (error instanceof Error && error.message === "INSUFFICIENT_BOOK") {
//             handleResponse(res, 404, "Book Not found");
//             return;
//         }
//         next(error);
//     }
// })


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

export default router;


app.listen(PORT, () => {
    console.log(`Server started on PORT : ${PORT}`);
})