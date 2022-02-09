import { config } from "../config.js";
import { getUser } from "../public/user.js";

export const server = async (document, req, res) => {
  if (req.cookies.pwd != config.password) {
    let elem = document.createElement("a");
    elem.setAttribute("href", "/");
    elem.innerText = "You are not authorized. Go back.";
    document.body.innerHTML = "";
    document.body.appendChild(elem);
  }
  let user = await getUser(req.cookies.pwd);
  for (let i of user) {
    createUser(document, i);
  }
  document
    .getElementById("accessToken")
    .setAttribute("data", config.mapBoxAccessToken);
};

const createUser = (document, user) => {
  let newCircle = document.getElementById("template").cloneNode(true);
  newCircle.setAttribute("id", undefined);
  newCircle.setAttribute("data", JSON.stringify(user));
  newCircle.setAttribute("src", user.avatar);
  document.getElementById("userWrap").appendChild(newCircle);
};
