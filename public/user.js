import { config } from "../config.js";
import { checkPassword } from "./login.js";
import {
  getFilesInOrder,
  loadFile,
  getTimesInFileInOrder,
} from "../private/file.js";
import { getDataInTimespan } from "./data.js";

export const getUser = async (pwd) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;

  let load = await getFilesInOrder(config.data);
  let file = load[load.length - 1];
  let user = JSON.parse((await loadFile(config.data, file + ".json")).file);
  user = user[Object.keys(user)[Object.keys(user).length - 1]];

  let userInfo = [];

  for (let i of Object.keys(user)) {
    userInfo.push({
      id: i,
      firstName: user[i].firstName,
      lastName: user[i].lastName,
      avatar: user[i].avatar,
    });
  }
  return userInfo;
};

export const getLatestUserData = async (pwd, id) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;

  let load = await getFilesInOrder(config.data);
  load = load[Object.keys(load)[Object.keys(load).length - 1]];

  let raw = await loadFile(config.data, load + ".json");
  let infos = JSON.parse(raw.file);
  let times = getTimesInFileInOrder(raw.file);
  return infos[times[times.length - 1]][id];
};

export const getUserData = async (pwd, id, end) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  let data = (await getDataInTimespan(pwd, end - 1000000000, end)).result;
  let timesInOrder = getTimesInFileInOrder(data);
  data = data[timesInOrder[timesInOrder.length - 1]][id];
  data.time = new Date(
    Number(timesInOrder[timesInOrder.length - 1])
  ).toISOString();
  return { success: true, data };
};
