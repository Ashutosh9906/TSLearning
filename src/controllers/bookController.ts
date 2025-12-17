import type { Request, Response, NextFunction } from "express";
import type { BookBody, filterQuery, idParams, updateBody } from "../validators/vaidationSchema.js";
import { buildBookFilter, buildBookUpdateFields, handleResponse } from "../utilities/userUtility.js";
import Book from "../models/bookModel.js";

export const handleAddBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}

export const handleGetBookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}

export const handleGetBookByFilters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}

export const handleRemoveBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}

export const handleUpdateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}