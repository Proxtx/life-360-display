import { listen } from "@proxtx/framework";
import { config } from "./config.js";

listen(config.port);
console.log("Server started:", config.port);
