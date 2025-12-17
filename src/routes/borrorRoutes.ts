import { Router } from "express";
import { checkAuthentication } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/parseBody.js";
import { bookBorrowSchema, bookIdSchema } from "../validators/vaidationSchema.js";
import { handleBorrowBook, handleGetBorrowedBookDetails, handleRenewBorrowedBook, handleReturnBorrowedBook } from "../controllers/borrowController.js";

const router = Router();

router.post("/", checkAuthentication, validateRequest(bookBorrowSchema), handleBorrowBook);
router.get("/", checkAuthentication, handleGetBorrowedBookDetails);
router.patch("/:id/renew", checkAuthentication, validateRequest(bookIdSchema), handleRenewBorrowedBook);
router.patch("/:id/return", checkAuthentication, validateRequest(bookIdSchema), handleReturnBorrowedBook);

export default router;