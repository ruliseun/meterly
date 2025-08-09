import { Router } from "express";
import { authGuard } from "../middlewares/auth.guard";
import { validateKey } from "../config/api-key.config";
import { validate } from "../middlewares/validate-request";
import MeterManagementController from "../controllers/meter-management/meter-management.controller";
import { registerNewMeter } from "../middlewares/validators/meter-managemnt.validator";
import { validateRequiredParams } from "../middlewares/validators/validator";

const router = Router();

router.post(
  "/add_meter",
  validateKey,
  authGuard(),
  registerNewMeter,
  validate,
  MeterManagementController.addNewMeter,
);

router.delete(
   "/remove_meter/:id",
   validateKey,
   authGuard(),
   validateRequiredParams(["id"]),
   validate,
   MeterManagementController.removeMeter,
)

export default router;