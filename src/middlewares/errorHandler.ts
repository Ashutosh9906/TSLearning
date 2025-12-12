import type { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from "express"

interface AppError extends Error {
  status?: number;
}

const errorHandling: ErrorRequestHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
    console.log(err.stack);
    res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: err.message
    });
};

export default errorHandling