import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Borrow from "../models/borrowModel.js";
import { formatDate, handleResponse } from "../utilities/userUtility.js";
import Book from "../models/bookModel.js";
import { emailQueue } from "../queues/emailQueues.js";
import { bookReturnDetail, borrowDetails, renewBookDetail } from "../templates/borrowTemplates.js"

export const handleBorrowBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
                _id: data,
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
        const borrowBookDetails = await Borrow.create({
            userId,
            bookId: data,
        });
        const populatedBorrow = await Borrow.findById(borrowBookDetails._id)
            .populate("userId", "name email")
            .populate("bookId", "title")
            .lean<{
                userId: { name: string; email: string };
                bookId: { title: string };
            }>();
        if (!populatedBorrow) {
            handleResponse(res, 404, "Borrow Details not found");
            return;
        }
        const issueDate = formatDate(borrowBookDetails.borrowedAt);
        const returnDate = formatDate(borrowBookDetails.dueAt);
        await emailQueue.add(
            "send-email",
            {
                to: populatedBorrow.userId.email,
                subject: "Welcome!",
                html: borrowDetails(populatedBorrow.userId.name, populatedBorrow.bookId.title, issueDate, returnDate).html,
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                }
            });
        console.log("📨 Email job added to queue");

        handleResponse(res, 200, "Book Borrowes successfully", borrowBookDetails);
        return;
    } catch (error) {
        next(error);
    }
}

export const handleGetBorrowedBookDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}

export const handleRenewBorrowedBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        const populatedBorrow = await Borrow.findById(updatedBorrow._id)
            .populate("userId", "name email")
            .populate("bookId", "title")
            .lean<{
                userId: { name: string; email: string };
                bookId: { title: string };
            }>();
        if (!populatedBorrow) {
            handleResponse(res, 404, "Borrow Details not found");
            return;
        }

        const issueDate = formatDate(updatedBorrow.borrowedAt);
        const renewDate = formatDate(updatedBorrow.updatedAt ?? new Date());
        const returnDate = formatDate(updatedBorrow.dueAt);
        await emailQueue.add(
            "send-email",
            {
                to: populatedBorrow.userId.email,
                subject: "Welcome!",
                html: renewBookDetail(populatedBorrow.userId.name, populatedBorrow.bookId.title, issueDate, renewDate, returnDate).html,
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                }
            });
        console.log("📨 Email job added to queue"); ``

        handleResponse(res, 201, "Book renewd successfullt", updatedBorrow);
        return;
    } catch (error) {
        next(error);
    }
}

export const handleReturnBorrowedBook = async (req: Request, res: Response, next: NextFunction) => {
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
        const populatedBorrow = await Borrow.findById(returnDetails._id)
            .populate("userId", "name email")
            .populate("bookId", "title")
            .lean<{
                userId: { name: string; email: string };
                bookId: { title: string };
            }>();
        if (!populatedBorrow) {
            handleResponse(res, 404, "Borrow Details not found");
            return;
        }

        const issueDate = formatDate(returnDetails.borrowedAt);
        const returnDate = formatDate(returnDetails.returnedAt ?? new Date());
        await emailQueue.add(
            "send-email",
            {
                to: populatedBorrow.userId.email,
                subject: "Welcome!",
                html: bookReturnDetail(populatedBorrow.userId.name, populatedBorrow.bookId.title, issueDate, returnDate).html,
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                }
            });
        handleResponse(res, 200, "Book returned successfully", returnDetails);
    } catch (error) {
        next(error);
    }
}

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