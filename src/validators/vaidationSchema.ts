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

export const signUpSchema = z.discriminatedUnion("role", [
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

export const signInSchema = z.object({
  email: z.email("Invalid Email"),
  password: z.string().min(6, "Password must have more than 6 charachters")
}).strict()

export const bookSchema = z.object({
  author: z.string(),
  title: z.string(),
  category: z.string(),
  issueYear: z.number().min(1000, "Enter full Year in YYYY form"),
  totalCopies: z.number().max(40, "Maximum 40 books are allowed")
}).strict()

export const bookFilterSchema = z.object({
  author: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  issueYear: z.string().regex(/^\d{4}$/).optional(),
  minCopies: z.string().optional(),
  maxCopies: z.string().optional()
}).strict();

export type filterQuery = z.infer<typeof bookFilterSchema>
export type BookBody = z.infer<typeof bookSchema>;
export type SignUpBody = z.infer<typeof signUpSchema>;
export type SignInBody = z.infer<typeof signInSchema>;