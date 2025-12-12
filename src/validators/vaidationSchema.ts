import mongoose from "mongoose";
import { z } from "zod";

const baseUserSchema = {
  name: z.string().min(4, "Name must have more than 4 characters"),
  email: z.email("Invalid email"),
  password:z.string()
            .min(6, "Password must have more than 6 characters")
            .max(72, "Password is Too long max limit 72")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Password must contain at least one Upper letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[@$!%*?&#]/, "Password must contain at least one special character (@$!%*?&#)"),
};

export const signUpBodySchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("student"),
    ...baseUserSchema,
    department: z.string(),
    studentId: z.string(),
  }).strict(),

  z.object({
    role: z.literal("librarian"),
    ...baseUserSchema,
    employeeId: z.string(),
    accessLevel: z.string(),
  }).strict(),
]);

export const signUpSchema = z.object({
  body: signUpBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
}).strict();


export const signInBodySchema = z.object({
  email: z.email("Invalid Email"),
  password: z.string().min(6, "Password must have more than 6 charachters")
}).strict()

export const signInSchema = z.object({
  body: signInBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
}).strict();

export const bookBodySchema = z.object({
  author: z.string(),
  title: z.string(),
  category: z.string(),
  issueYear: z.number().min(1000, "Enter full Year in YYYY form"),
  totalCopies: z.number().max(40, "Maximum 40 books are allowed")
}).strict()

export const bookSchema = z.object({
  body: bookBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
}).strict();

export const bookFilterQuerySchema = z.object({
  author: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  issueYear: z.string().regex(/^\d{4}$/).optional(),
  minCopies: z.string().optional(),
  maxCopies: z.string().optional()
}).strict();

export const bookFilterSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: bookFilterQuerySchema,
}).strict();

export const bookIdParamsSchema = z.object({
  id:z.string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: "Invalid mongoose id"
      })
}).strict();

export const bookRemoveSchema = z.object({
  body: z.object({}).optional(),
  params: bookIdParamsSchema,
  query: z.object({}).optional(),
}).strict();

export const bookUpdateBodySchema = z.object({
  author: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  issueYear: z.number().min(1000, "Invalid IssueYear").optional(),
  availableCopies: z.number().optional()
}).strict();

export const bookUpdateSchema = z.object({
  body: bookUpdateBodySchema,
  params: bookIdParamsSchema,
  query: z.object({}).optional(),
})

export type updateBody = z.infer<typeof bookUpdateBodySchema>
export type updateParams = z.infer<typeof bookIdParamsSchema>
export type removeParams = z.infer<typeof bookIdParamsSchema>
export type filterQuery = z.infer<typeof bookFilterQuerySchema>
export type BookBody = z.infer<typeof bookBodySchema>;
export type SignUpBody = z.infer<typeof signUpBodySchema>;
export type SignInBody = z.infer<typeof signInBodySchema>;