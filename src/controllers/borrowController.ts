import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Borrow from "../models/borrowModel.js";
import { handleResponse } from "../utilities/userUtility.js";
import Book from "../models/bookModel.js";

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