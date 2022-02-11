import { config } from "../config.js";
import { checkPassword } from "./login.js";
import * as file from "../private/file.js";

export const getTimespan = async (pwd) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  return await file.getTimespan(config.data);
};

export const getDataInTimespan = async (pwd, start, end) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  return await file.getDataInTimespan(config.data, start, end);
};
