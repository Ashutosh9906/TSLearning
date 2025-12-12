import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { handleResponse } from "../utilities/userUtility.js";

export function checkAuthentication(req: Request, res: Response, next: NextFunction): void{
    try {
        const token = req.cookies.token;
        if(!token){
            handleResponse(res, 401, "User is unAuthenticated");
            return;
        } 
        const secret = process.env.SECRET ?? "TEmp154"
        const decoded = jwt.verify(token, secret);
        res.locals.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
}

export function checkAuthorizationLibrarian(req: Request, res: Response, next: NextFunction): void{
    try {
        const userRole = res.locals.user.role;
        if(userRole !== "librarian"){
            handleResponse(res, 401, "User is unAuthorized");
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}

export function checkAuthorizationStudent(req: Request, res: Response, next: NextFunction): void{
    try {
        const userRole = res.locals.user.role;
        if(userRole !== "student"){
            handleResponse(res, 401, "User is unAuthorized");
            return;
        }
        next();
    } catch (error) {
        next(error);
    }
}