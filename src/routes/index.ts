import { appVersion } from "../config/constants";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import managementRoutes from "./meter-management.route";

export default function initializeRoutes(app: { use: (arg0: string, arg1: any) => void }) {
  app.use(`/meterly/api/${appVersion}/auth`, authRoutes);
  app.use(`/meterly/api/${appVersion}/app_users`, userRoutes);
  app.use(`/meterly/api/${appVersion}/meter_management`, managementRoutes);
}
