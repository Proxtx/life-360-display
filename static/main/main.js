while (!window.L) {
  await new Promise((r) => setTimeout(r, 1000));
}

let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
let useDate = document.getElementById("useDate");
let startDateWrap = document.getElementById("startDateWrap");
let endDateWrap = document.getElementById("endDateWrap");
let locationApi = await load("locations.js");
let userApi = await load("user.js");
let dataApi = await load("data.js");
let currentlySelectedObj;
let currentUserId;
let prevGeo = [];

const map = L.map("map").setView([0, 0]);
map.setZoom(5);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a> Proxtx',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: document.getElementById("accessToken").getAttribute("data"),
  }
).addTo(map);

const genPath = (locations, user, userAvatar) => {
  let points = [];
  let times = Object.keys(locations);
  let prevLat = 0;
  let prevLong = 0;
  let addresses = {};
  let addrCircles = [];
  for (let i of times) {
    try {
      c++;
      let latitude = locations[i][user].latitude;
      let longitude = locations[i][user].longitude;

      if (
        locations[i][user].address &&
        !addresses[locations[i][user].address]
      ) {
        addrCircles.push(
          L.circle([latitude, longitude], {
            color: "black",
            radius: 50,
          }).bindPopup(
            "<h2>" +
              locations[i][user].address +
              "</h2>" +
              '<button class="button" onclick="window.displayInfo(' +
              i +
              ')">More Info</button><div></div>'
          )
        );
        addresses[locations[i][user].address] = true;
      }

      points.push([latitude, longitude]);
      prevLat = latitude;
      prevLong = longitude;
    } catch (e) {}
  }
  map.flyTo([prevLat, prevLong], 15);
  addrCircles.push(
    L.circle([prevLat, prevLong], {
      color: "white",
      radius: 10,
    }).bindPopup("Current Position")
  );
  return [
    L.polyline(points, {
      color: "black",
    }),
  ].concat(addrCircles);
};

const showInfoPanel = (content) => {
  let infoPanel = document.getElementById("infoPanel");
  infoPanel.innerHTML = "";
  infoPanel.appendChild(content);
  infoPanel.style.pointerEvents = "all";
  infoPanel.style.filter = "blur(0px)";
  document.getElementById("mapWrap").style.filter = "blur(15px)";
};

const parseDate = (date) => {
  return date.toISOString().split(":").slice(0, 2).join(":");
};

const displayObject = (object) => {
  let obj = document.createElement("div");
  if (Array.isArray(object)) {
    for (let i in object) {
      obj.appendChild(createAttribute(i, displayObject(object[i])));
    }
    return obj;
  }
  for (let i of Object.keys(object)) {
    obj.appendChild(
      createAttribute(
        i,
        typeof object[i] == "object" && object[i]
          ? displayObject(object[i])
          : document.createTextNode(object[i])
      )
    );
  }

  return obj;
};

const createAttribute = (attribute, value) => {
  let wrap = document.createElement("div");
  wrap.appendChild(document.createTextNode(attribute + ": "));
  wrap.appendChild(value);
  wrap.setAttribute("class", "attribute");
  return wrap;
};

const hideInfoPanel = () => {
  document.getElementById("infoPanel").style.pointerEvents = "none";
  document.getElementById("infoPanel").style.filter = "blur(500px)";
  document.getElementById("mapWrap").style.filter = "unset";
};

let c = document.getElementById("userWrap").children;
for (let element of c) {
  element.addEventListener("click", () => {
    if (currentlySelectedObj) {
      currentlySelectedObj.style.transform = "unset";
      currentlySelectedObj.style.boxShadow = "unset";
    }
    currentUserId = JSON.parse(element.getAttribute("data")).id;
    element.style.boxShadow = "0px 0px 20px black";
    element.style.transform = "scale(1.2)";
    currentlySelectedObj = element;
    displayMapStats();
  });
}

const displayMapStats = async () => {
  prevGeo.forEach((g) => g.remove());
  let locs = await locationApi.getDataInTimespan(
    cookie.pwd,
    new Date(startDate.value).valueOf(),
    new Date(endDate.value).valueOf(),
    currentUserId
  );
  let geometry = genPath(locs.result, currentUserId);
  for (let i of geometry) i.addTo(map);
  prevGeo = geometry;
};

hideInfoPanel();

const panels = [
  {
    show: async () => {
      return displayObject(
        (
          await userApi.getUserData(
            cookie.pwd,
            currentUserId,
            new Date(endDate.value).valueOf()
          )
        ).data
      );
    },
    hide: () => {},
    trigger: document.getElementById("info"),
  },
  {
    show: () => {
      return document.getElementById("settings");
    },
    hide: (elem) => {
      document.getElementsByClassName("hidden")[0].appendChild(elem);
    },
    trigger: document.getElementById("settingsButton"),
  },
  {
    show: () => {
      return document.getElementById("time");
    },
    hide: async (elem) => {
      document.getElementsByClassName("hidden")[0].appendChild(elem);
      if (useDate.checked) {
        let date = new Date(endDate.value);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        startDate.value = parseDate(date);
        date.setHours(date.getHours() + 24);
        endDate.value = parseDate(date);
      }
      if (new Date(startDate.value) > new Date(endDate.value))
        startDate.value = parseDate(
          updateDateInfo(new Date(new Date(endDate.value) - 8.64e7))
        );

      document.getElementById("infoPanel").innerText = "Loading";
      await displayMapStats();
    },
    trigger: document.getElementById("timeButton"),
  },
];

const setupPanels = async () => {
  let currentlyActivePanel;

  let hide = async (panel) => {
    panel.trigger.style.border = "none";
    await panel.hide(document.getElementById("infoPanel").children[0]);
    hideInfoPanel();
  };

  let show = async (panel) => {
    panel.trigger.style.border = "1px solid black";
    showInfoPanel(await panel.show());
  };

  panels.forEach((v) => {
    v.trigger.addEventListener("click", async () => {
      currentlyActivePanel && hide(currentlyActivePanel);
      if (currentlyActivePanel != v) {
        await show(v);
        currentlyActivePanel = v;
      } else {
        currentlyActivePanel = undefined;
      }
    });
  });
};

window.displayInfo = async (time) => {
  await document.getElementById("info").click();
  showInfoPanel(
    displayObject(
      (await userApi.getUserData(cookie.pwd, currentUserId, time)).data
    )
  );
};

setupPanels();

document.getElementById("logout").addEventListener("click", () => {
  cookie.pwd = "undefined";
  location.href = "../";
});

let timespan = await locationApi.getTimespan(cookie.pwd);
let dateObjStart = new Date(Number(timespan.start));
let dateObjEnd = new Date(Number(timespan.end));

const updateDateInfo = (date) => {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date;
};

updateDateInfo(dateObjStart);
updateDateInfo(dateObjEnd);

startDate.setAttribute("min", parseDate(dateObjStart));
endDate.setAttribute("min", parseDate(dateObjStart));
startDate.setAttribute("max", parseDate(dateObjEnd));
endDate.setAttribute("max", parseDate(dateObjEnd));

endDate.value = parseDate(dateObjEnd);
startDate.value = new Date(dateObjEnd - 8.64e7)
  .toISOString()
  .split(":")
  .slice(0, 2)
  .join(":");

useDate.addEventListener("change", () => {
  if (useDate.checked) startDateWrap.style.display = "none";
  else startDateWrap.style.display = "unset";
});

document.getElementById("userWrap").children[0].click();
