import { config } from "../config.js";

export const checkPassword = (password) => {
  if (password == config.password) return { success: true };
  return { success: false, error: 1 };
};
