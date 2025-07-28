import fs from "fs";
import path from "path";
import { FileSystemPort } from "../core/ports";

/**
 * NodeFileSystem – concrete adapter implementing FileSystemPort using Node.js
 * built-in `fs` module.  Responsible for creating parent directories on write
 * so that core logic can assume target paths are valid.
 */
export const NodeFileSystem: FileSystemPort = {
  exists: (p: string): boolean => fs.existsSync(p),

  list: (dirPath: string): string[] => {
    try {
      return fs.readdirSync(dirPath);
    } catch {
      return [];
    }
  },

  readUtf8: (filePath: string): string => fs.readFileSync(filePath, "utf8"),

  writeUtf8: (filePath: string, contents: string): void => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents, "utf8");
  },
};
