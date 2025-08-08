import { PAGINATION } from "../../config/constants";
import { User } from "../../entity/User";
import { IUser } from "../../interface/user.interface";
import ABSTRACT_SERVICE from "../abstractService/abstractService";

async function getUser(page: number, _userProfile?: IUser) {
  const filteredData: IUser[] = [];
  const totalItems = filteredData.length;

  const totalPages = Math.ceil(totalItems / PAGINATION);
  const nextPage = page < totalPages;
  const prevPage = page > 1;

  return {
    users: filteredData,
    total: totalItems,
    last_page: totalPages,
    current_page: page,
    has_next_page: nextPage,
    has_prev_page: prevPage,
    next_page: nextPage ? page + 1 : null,
    previous_page: prevPage ? page - 1 : null,
  };
}

async function updateRecord(userId: number, data: { [key: string]: string | number }) {
  const updatedRecord = await ABSTRACT_SERVICE.updateById(User, userId, data);
  if (updatedRecord.affected) {
    const newRecord = await ABSTRACT_SERVICE.getUniqueData(User, { id: userId });
    const { id, password, password_reset, ...rest } = newRecord as IUser;
    return rest;
  }

  const error = new Error("Error updating user");
  (error as any).httpStatusCode = 500;
  throw error;
}

async function getUserProfile(user: number, token: string) {
  let query = null;
  if (token) {
    const decodeToken = atob(token);
    query = { email: decodeToken };
  } else {
    query = { id: user };
  }

  const getUser = await ABSTRACT_SERVICE.findAndPopulate(User, { ...query }, [
    "role"]);

  if (!getUser) {
    const error = new Error("Error getting user profile");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const { id, password, password_reset, updatedAt, ...rest } = getUser;

  return {
    ...rest
  };
}

const UserService = {
  getUser,
  updateRecord,
  getUserProfile,
};

export default UserService;
