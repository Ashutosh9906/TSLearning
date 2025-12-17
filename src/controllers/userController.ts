import type { Request, Response, NextFunction } from "express";
import type { SignInBody, SignUpBody } from "../validators/vaidationSchema.js";
import { comparePassword, createCookie, handleResponse, hashPassword } from "../utilities/userUtility.js";
import User from "../models/userModel.js";

export const handleUserSignUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated.body as SignUpBody;
        data.password = await hashPassword(data.password);
        if (data.role === "student") {
            const isUser = await User.findOne({ email: data.email });
            if (isUser) {
                handleResponse(res, 409, `User with email: ${data.email} already exist`);
                return;
            }
            const user = await User.create({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                department: data.department,
                studentId: data.studentId,
            })
            createCookie(res, user._id, user.role)
        } else if (data.role === "librarian") {
            const isUser = await User.findOne({ email: data.email });
            if (isUser) {
                handleResponse(res, 409, `User with email: ${data.email} already exist`);
                return;
            }
            const user = await User.create({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                employeeId: data.employeeId,
            })
            createCookie(res, user._id, user.role)
        }
        handleResponse(res, 201, "User SignUp Successfully");
        return
    } catch (error) {
        next(error);
    }
}

export const handleUserSignIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = res.locals.validated.body as SignInBody;
        const user = await User.findOne({ email: data.email });
        if (!user) {
            handleResponse(res, 409, "Invalid Credentials")
            return;
        }
        const isValid = await comparePassword(data.password, user.password);
        if (!isValid) {
            handleResponse(res, 401, "Invalid Credentials")
            return;
        }
        createCookie(res, user._id, user.role);
        handleResponse(res, 200, "User signIn successfully")
        return;
    } catch (error) {
        next(error);
    }
}