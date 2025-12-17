import { Router } from "express";
import { validateRequest } from "../middlewares/parseBody.js";
import { signInSchema, signUpSchema } from "../validators/vaidationSchema.js";
import { handleUserSignIn, handleUserSignUp } from "../controllers/userController.js";

const router = Router();

router.post("/signUp", validateRequest(signUpSchema), handleUserSignUp);
router.post("/signIn", validateRequest(signInSchema), handleUserSignIn);

export default router;