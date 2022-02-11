import fs from "fs/promises";

export const loadFile = async (folder, file) => {
  return {
    success: true,
    file: await fs.readFile(folder + file, "utf-8"),
  };
};

export const getTimespan = async (folder) => {
  let dates = await getFilesInOrder(folder);
  let start = dates[0];
  let load = await loadFile(folder, dates[dates.length - 1] + ".json");
  let times = getTimesInFileInOrder(load.file);
  let end = times[times.length - 1];
  return { success: true, start, end };
};

export const getDataInTimespan = async (folder, start, end) => {
  let files = await getFilesInOrder(folder);
  let lookingForEnd = false;
  let filesToLoad = [];
  for (let i of files) {
    if (!lookingForEnd) {
      if (i > start) {
        lookingForEnd = true;
      } else {
        filesToLoad = [];
        filesToLoad.push(i);
        continue;
      }
    }
    if (i > end) {
      break;
    }
    filesToLoad.push(i);
  }
  let resultObject = {};
  for (let i in filesToLoad) {
    let load = await loadFile(folder, filesToLoad[i] + ".json");
    filesToLoad[i] = JSON.parse(load.file);
  }
  let locationData = filesToLoad;
  let startData = locationData.shift();
  for (let i of getTimesInFileInOrder(startData)) {
    if (i > start) {
      resultObject[i] = startData[i];
    }
  }
  if (locationData.length > 0) {
    let endData = locationData.pop();
    for (let i of locationData) {
      resultObject = { ...resultObject, ...i };
    }
    if (endData) {
      for (let i of getTimesInFileInOrder(endData)) {
        if (i < end) {
          resultObject[i] = endData[i];
        }
      }
    }
  }

  return { success: true, result: resultObject, test: "yes" };
};

export const getFilesInOrder = async (folder) => {
  let dates = [];
  let files = await fs.readdir(folder);
  files.forEach((file) => {
    if (file.split(".txt").length > 1) return;
    dates.push(file.split(".json")[0]);
  });
  dates.sort((a, b) => {
    return a - b;
  });
  return dates;
};

export const getTimesInFileInOrder = (raw) => {
  let file = typeof raw == "string" ? JSON.parse(raw) : raw;
  let times = Object.keys(file);
  times.sort((a, b) => {
    return a - b;
  });
  return times;
};
