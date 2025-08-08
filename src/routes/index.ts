import { appVersion } from "../config/constants";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";

export default function initializeRoutes(app: { use: (arg0: string, arg1: any) => void }) {
  app.use(`/bethel/api/${appVersion}/auth`, authRoutes);
  app.use(`/bethel/api/${appVersion}/app_users`, userRoutes);
}
