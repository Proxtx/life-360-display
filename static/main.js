let login = await load("login.js");
let input = document.getElementById("pwd");

if ((await login.checkPassword(cookie.pwd)).success) window.location = "/main/";

input.addEventListener("change", async (evt) => {
  if ((await login.checkPassword(input.value)).success) {
    cookie.pwd = input.value;
    window.location = "/main/";
  } else alert("Wrong Password");
});
