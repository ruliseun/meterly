import { ProfileTypeEnum } from "../enums/user-type.enum";

export interface IUser {
  id?: number;
  userId?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  state?: string;
  city?: string;
  address?: string;
  dob?: string;
  createdAt?: Date;
  updatedAt?: Date;
  profileType?: Partial<ProfileTypeEnum>;
  status?: ProfileStatus;
  uniqueCode?: string;
  password: string;
  roleId?: number;
  userAgent?: string;
  orgId?: number;
  name?: string;
  phone?: string;
  [x: string]: any;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
}

export enum ProfileStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MOVED = "MOVED",
  ARCHIVED = "ARCHIVED",
}

export interface ILogin {
  email: string;
  password: string;
  userAgent: string;
  deviceType: "WEB" | "APP";
}
