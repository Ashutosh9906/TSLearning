import { Schema, model } from "mongoose"
import type { IUser } from "../types/modelTypes.js";

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "librarian"],
        required: true
    },
    department: {
        type: String,
    },
    studentId: {
        type: String,
        unique: true
    },
    employeeId: {
        type: String,
        unique: true
    }
}, { timestamps: true });

const User = model<IUser>("users", userSchema);

export default User;