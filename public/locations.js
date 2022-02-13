import { config } from "../config.js";
import { checkPassword } from "./login.js";
import * as file from "../private/file.js";

export const getTimespan = async (pwd) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  return await file.getTimespan(config.locations);
};

export const getDataInTimespan = async (pwd, start, end, id) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;

  let result = await file.getDataInTimespan(config.locations, start, end);
  if (!result.success) return result;
  Object.keys(result.result).forEach((v) => {
    result.result[v] = { [id]: result.result[v][id] };
  });
  return result;
};
