import { Router } from "express";
import { validate } from "../middlewares/validate-request";
import { validateKey } from "../config/api-key.config";
import {
  refeshTokenValidator,
  requestOTPValidator,
  validateCompleteOnboarding,
  validateCreateUser,
  validateEmail,
  validateLogin,
  validateLogout,
  validateOTPValidator,
  validateResetPassword,
} from "../middlewares/validators/auth.validator";
import AuthController from "../controllers/auth/auth.controller";
import { validateRequiredParams } from "../middlewares/validators/validator";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();

router.post("/login",  validateKey, validateLogin, validate, AuthController.login);
router.post("/logout",  validateKey, validateLogout, validate, AuthController.logout);
router.post("/token", validateKey, refeshTokenValidator, validate, AuthController.refreshToken);
router.post("/register",  validateKey, validateCreateUser, validate, AuthController.signup);
router.post(
  "/forgot_password",
  validateKey,
  validateEmail,
  validate,
  AuthController.forgotPasswordRequest,
);
router.post(
  "/reset_password",
  validateKey,
  validateEmail,
  validateResetPassword,
  validate,
  AuthController.resetPassword,
);

router.post("/request/otp", validateKey, requestOTPValidator, validate, AuthController.requestOTP);
router.post("/validate/otp", validateKey, validateOTPValidator, validate, AuthController.validateOTP);
router.post(
  "/complete_onboarding/:token",
  validateKey,
  validateRequiredParams(["token"]),
  validateCompleteOnboarding,
  validate,
  AuthController.completeOnboarding,
);
router.get("/profile", validateKey, authGuard(), AuthController.getProfile)

export default router;
