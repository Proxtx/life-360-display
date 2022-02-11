import { config } from "../config.js";
import { checkPassword } from "./login.js";
import fs from "fs/promises";
import * as file from "../private/file.js";

export const getTimespan = async (pwd) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  return await file.getTimespan(config.locations);
};

export const getDataInTimespan = async (pwd, start, end) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;

  return file.getDataInTimespan(config.locations, start, end);
};
