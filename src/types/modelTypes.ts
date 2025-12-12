import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "student" | "librarian";
    department?: string;
    studentId?: string;
    employeeId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBook extends Document {
    title: string,
    author: string,
    category: string,
    issueYear: number,
    totalCopies: number,
    availableCopies: number,
    createdAt: Date;
    updatedAt: Date;
}

export interface IBookFilter {
  title?: string;
  author?: string;
  category?: string;
  issueYear?: string;
  minCopies?: string;
  maxCopies?: string;
}
