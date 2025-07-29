import proposeEvent from "./proposeEvent.js";
import proposeIntegration from "./proposeIntegration.js";
import persistStorm from "./persistStorm.js";
import log from "./log.js";
import summarizeStorm from "./summarizeStorm.js";
import readFile from "./readFile.js";
import writeFile from "./writeFile.js";

export default [
  proposeEvent,
  proposeIntegration,
  persistStorm,
  summarizeStorm,
  log,
  readFile,
  writeFile,
] as const;
