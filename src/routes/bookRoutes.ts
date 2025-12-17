import { Router } from "express";
import { checkAuthentication, checkAuthorizationLibrarian } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/parseBody.js";
import { bookFilterSchema, bookIdSchema, bookRemoveSchema, bookSchema, bookUpdateSchema } from "../validators/vaidationSchema.js";
import { handleAddBook, handleGetBookByFilters, handleGetBookById, handleRemoveBook, handleUpdateBook } from "../controllers/bookController.js";

const router = Router();

router.post("/", checkAuthentication, checkAuthorizationLibrarian, validateRequest(bookSchema), handleAddBook);
router.get("/", validateRequest(bookIdSchema), handleGetBookByFilters);
router.get("/:id", validateRequest(bookFilterSchema), handleGetBookById);
router.patch("/:id", checkAuthentication, checkAuthorizationLibrarian, validateRequest(bookRemoveSchema), handleRemoveBook);
router.patch("/:id", checkAuthentication, checkAuthorizationLibrarian, validateRequest(bookUpdateSchema), handleUpdateBook);

export default router;