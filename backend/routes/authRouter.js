import { Router } from "express";

import {
  login,
  signup,
} from "../controller/authController.js";

import {
  loginValidation,
  signupValidation,
} from "../middleware/AuthValidation.js";

const authRouter = Router();

// Public routes
authRouter.post(
  "/Login",
  loginValidation,
  login
);

authRouter.post(
  "/Signup",
  signupValidation,
  signup
);

export default authRouter;