import { hash, compare } from "bcryptjs";
import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { Types, QueryFilter } from "mongoose";
import type { IBook, IBookFilter } from "../types/modelTypes.js";
import type { filterQuery, updateBody } from "../validators/vaidationSchema.js";

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashPassword = await hash(password, saltRounds);
    return hashPassword;
}

export async function comparePassword(userPass: string, hashPass: string): Promise<boolean> {
    const isMatch = await compare(userPass, hashPass);
    return isMatch;
}

export function createCookie(res: Response, id: string | Types.ObjectId, role: string): void{
    const payload = { id: id.toString(), role };
    const secret = process.env.SECRET ?? "#@TEmp154";
    const token = jwt.sign(payload, secret, { expiresIn: "30m" })
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 60 * 1000
    });
}

export const handleResponse = (res: Response, status: number, message: string, data: any = null): void => {
    res.status(status).json({
        message,
        data,
    });
};

export function buildBookFilter(query: filterQuery): QueryFilter<IBook>{
    const filters: any = {};
    if(query.title) filters.title = new RegExp(query.title, "i");
    if(query.author) filters.author = new RegExp(query.author, "i");
    if(query.category) filters.category = query.category;
    if(query.issueYear) filters.issueYear = Number(query.issueYear);
    if(query.minCopies || query.maxCopies){
        filters.availableCopies = {};
        if(query.minCopies) filters.availableCopies.$gte = Number(query.minCopies);
        if(query.maxCopies) filters.availableCopies.$lte = Number(query.maxCopies);
    }
    return filters;
}

export function buildBookUpdateFields(body: updateBody): QueryFilter<updateBody>{
    const UpdateFields: any = {};
    if(body.title) UpdateFields.title = new RegExp(body.title, "i");
    if(body.author) UpdateFields.author = new RegExp(body.author, "i");
    if(body.category) UpdateFields.category = body.category;
    if(body.issueYear) UpdateFields.issueYear = Number(body.issueYear);
    if(body.totalCopies) UpdateFields.totalCopies = Number(body.totalCopies);
    return UpdateFields;
}