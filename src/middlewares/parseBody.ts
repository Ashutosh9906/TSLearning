import { z, type ZodType } from "zod";
import type { Request, Response, NextFunction, RequestHandler } from "express";

export function validateRequest<T extends ZodType>(schema: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      if (!result.success) {
        return res.status(400).json({
          message: "Validation Failed",
          errors: z.treeifyError(result.error),
        });
      }

      res.locals.validated = result.data as z.infer<T>;
      next();
    } catch (err) {
      next(err); // sends unexpected errors to global error handler
    }
  };
}