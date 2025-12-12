import { Schema, model } from "mongoose";
import type { IBook } from "../types/modelTypes.js";

const bookSchema = new Schema<IBook>({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    issueYear: {
        type: Number,
        required: true
    },
    totalCopies: {
        type: Number,
        required: true
    },
    availableCopies: {
        type: Number,
        default: function (this:IBook) {
            return this.totalCopies;
        }
    }
}, { timestamps: true });

const Book = model<IBook>("books", bookSchema);

export default Book;