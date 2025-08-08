import { Router } from "express";
import { validateKey } from "../config/api-key.config";
import { authGuard } from "../middlewares/auth.guard";
import {
  updateUserValidator,
  validateGetUsers,
} from "../middlewares/validators/user.validator";
import { validate } from "../middlewares/validate-request";
import UserController from "../controllers/users/user.controller";
import { validateCustomRequest } from "../middlewares/validators/validator";

const router = Router();

router.get(
  "/",
  validateKey,
  authGuard(),
  validateGetUsers,
  validate,
  UserController.getUser,
);

router.patch(
  "/",
  validateKey,
  authGuard(),
  updateUserValidator,
  validate,
  UserController.updateUserRecord,
);

router.get("/info", validateKey, authGuard(), UserController.getUserProfile);

router.get(
  "/info/:token",
  validateKey,
  authGuard(),
  validateCustomRequest(["token"]),
  validate,
  UserController.getUserProfile,
);

export default router;
