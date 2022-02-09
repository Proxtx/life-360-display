import { promises as fs } from "fs";

export const config = JSON.parse(await fs.readFile("config.json", "utf-8"));
