export interface IUser {
  id?: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: ProfileStatus;
  password: string;
  userAgent?: string;
  phone?: string;
  [x: string]: any;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  phoneNumberVerified?: boolean;
  isVerified?: boolean;
  nin?: string;
  userId?: number;
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
