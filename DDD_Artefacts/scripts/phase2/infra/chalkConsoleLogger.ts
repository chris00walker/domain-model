import chalk from "chalk";
import { LoggerPort, LogLevel } from "../core/ports";

/**
 * ChalkConsoleLogger – console-based logger with coloured output via chalk.
 * Keeps formatting simple while providing visual cues during CLI runs.
 */

function colour(level: LogLevel, msg: string): string {
  switch (level) {
    case "debug":
      return chalk.gray(msg);
    case "info":
      return msg;
    case "warn":
      return chalk.yellow(msg);
    case "error":
      return chalk.red(msg);
    default:
      return msg;
  }
}

export const ChalkConsoleLogger: LoggerPort = {
  log: (level, message) => {
    const prefix = level.toUpperCase().padEnd(5);
    console.log(colour(level, `${prefix} ${message}`));
  },
  debug: (m) => ChalkConsoleLogger.log("debug", m),
  info: (m) => ChalkConsoleLogger.log("info", m),
  warn: (m) => ChalkConsoleLogger.log("warn", m),
  error: (m) => ChalkConsoleLogger.log("error", typeof m === "string" ? m : m.message),
};
