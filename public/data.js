import { config } from "../config.js";
import { checkPassword } from "./login.js";
import fs from "fs/promises";

export const loadFile = async (pwd, file) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  return {
    success: true,
    file: await fs.readFile(config.data + file, "utf-8"),
  };
};

export const getTimespan = async (pwd) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  let dates = await getFilesInOrder();
  let start = dates[0];
  let load = await loadFile(pwd, dates[dates.length - 1] + ".json");
  let times = getTimesInFileInOrder(load.file);
  let end = times[times.length - 1];
  return { success: true, start, end };
};

export const getDataInTimespan = async (pwd, start, end) => {
  let check = checkPassword(pwd);
  if (!check.success) return check;
  let files = await getFilesInOrder();
  let startFile;
  let lookingForEnd = false;
  let filesToLoad = [];
  for (let i of files) {
    if (!lookingForEnd) {
      if (i > start) {
        filesToLoad.push(startFile);
        lookingForEnd = true;
        continue;
      }
      startFile = i;
    } else {
      if (i > end) {
        break;
      }
      filesToLoad.push(i);
    }
  }
  let resultObject = {};
  for (let i in filesToLoad) {
    let load = await loadFile(pwd, filesToLoad[i] + ".json");
    filesToLoad[i] = JSON.parse(load.file);
  }
  let locationData = filesToLoad;
  let startData = locationData.shift();
  for (let i of Object.keys(startData)) {
    if (i > start) {
      resultObject[i] = startData[i];
    }
  }
  if (locationData.length > 0) {
    let endData = locationData.pop();
    for (let i of locationData) {
      resultObject = { ...resultObject, ...i };
    }
    if (locationData.length > 0) {
      for (let i of Object.keys(endData)) {
        if (i < end) {
          resultObject[i] = startData[i];
        }
      }
    }
  }

  return { success: true, data: resultObject };
};

export const getFilesInOrder = async () => {
  let dates = [];
  let files = await fs.readdir(config.data);
  files.forEach((file) => {
    if (file == "data.txt") return;
    dates.push(file.split(".json")[0]);
  });
  dates.sort((a, b) => {
    return a - b;
  });
  return dates;
};

export const getTimesInFileInOrder = (raw) => {
  let file = JSON.parse(raw);
  let times = Object.keys(file);
  times.sort((a, b) => {
    return a - b;
  });
  return times;
};
