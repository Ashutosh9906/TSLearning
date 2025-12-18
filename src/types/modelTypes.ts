import { Document, Types } from "mongoose";

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

export interface IUserCookie {
  id: Types.ObjectId,
  role: "student" | "librarian"
}

export interface IBorrow extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt?: Date | null;
  status: "borrowed" | "returned" | "overdue";
  renewalCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
