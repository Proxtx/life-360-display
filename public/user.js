import { config } from "../config.js";
import { checkPassword } from "./login.js";
import { getFilesInOrder, loadFile, getTimesInFileInOrder } from "./data.js";

export const getUser = async (pwd) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;

  let load = await getFilesInOrder(pwd);
  let file = load[load.length - 1];
  let user = JSON.parse((await loadFile(pwd, file + ".json")).file);
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

  let load = await getFilesInOrder(pwd);
  load = load[Object.keys(load)[Object.keys(load).length - 1]];

  let raw = await loadFile(pwd, load + ".json");
  let infos = JSON.parse(raw.file);
  let times = getTimesInFileInOrder(raw.file);
  return infos[times[times.length - 1]][id];
};
