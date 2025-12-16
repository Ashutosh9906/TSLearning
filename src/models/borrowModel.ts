import { Schema, model } from "mongoose";
import type { IBorrow } from "../types/modelTypes.js";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const borrowSchema = new Schema<IBorrow>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: "books",
        required: true
    },
    borrowedAt: {
        type: Date,
        default: Date.now
    },
    dueAt: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date;
        }
    },
    returnedAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["borrowed", "returned", "overdue"],
        default: "borrowed",
    },
    renewalCount: {
        type: Number,
        default: 0,
    }
}, { timestamps: true })

const Borrow = model<IBorrow>("borrows", borrowSchema);

export default Borrow;