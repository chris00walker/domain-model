import path from "path";

/*
 * core/ports.ts
 * --------------
 * Domain-agnostic ports (interfaces) required by the core application logic.
 *
 * These interfaces live in the "core" layer of our Hexagonal (Ports &
 * Adapters) architecture.  They represent *capabilities* the domain logic
 * needs without dictating *how* they are fulfilled.  Concrete adapters
 * (Node fs, pretty-console logger, etc.) must implement these contracts in
 * `DDD_Artefacts/scripts/infra` and be wired up by the application entry
 * points or the thin CLI wrappers.
 *
 * The motivation is to decouple business rules from the environment, making
 * the core logic highly testable (in-memory mocks) and compliant with Uncle
 * Bob's Clean Code principles of dependency inversion.
 */

// ---------------------------------------------------------------------------
// File System Port
// ---------------------------------------------------------------------------
/**
 * Minimal synchronous file-system contract required by current core modules.
 *
 * Sync APIs keep the core implementation straightforward; the CLI runs in a
 * short-lived process so event-loop blocking is a non-issue.  If we later
 * decide to support long-running services we can add async variants behind a
 * different port without breaking existing call-sites.
 */
export interface FileSystemPort {
  /** Returns true if the given path exists on the underlying storage. */
  exists(path: string): boolean;

  /** Lists files and directories directly under the given directory. */
  list(dirPath: string): string[];

  /** Reads an entire UTF-8 file and returns its contents. */
  readUtf8(filePath: string): string;

  /** Writes a UTF-8 file, creating parent directories if necessary. */
  writeUtf8(filePath: string, contents: string): void;
}

// ---------------------------------------------------------------------------
// Logger Port
// ---------------------------------------------------------------------------
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Simple structured logger abstraction.  Keeping the signature minimal lets
 * tests swap in no-op or in-memory loggers while production code may map to
 * console.log, pino, Winston, or any other backend.
 */
export interface LoggerPort {
  log(level: LogLevel, message: string): void;

  /** Convenience helpers that delegate to `log` with fixed levels. */
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string | Error): void;
}

// ---------------------------------------------------------------------------
// Null Implementations (for tests / default wiring)
// ---------------------------------------------------------------------------

/** A no-op logger useful in unit tests when we do not care about output. */
export const NullLogger: LoggerPort = {
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

/**
 * In-memory file system backed by plain JavaScript objects.  Handy for unit
 * tests that need predictable behaviour without touching the disk.  Not a
 * complete fs mock — just enough for current requirements.
 */
// ---------------------------------------------------------------------------
// LLM Port – for chat completions (e.g., OpenAI)
// ---------------------------------------------------------------------------
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMPort {
  chatCompletion(model: string, messages: ChatMessage[], temperature: number): Promise<string>;
}

/** Null implementation that just echoes back a stub message */
export const NullLLM: LLMPort = {
  async chatCompletion(_model: string, _messages: ChatMessage[]): Promise<string> {
    return "{}"; // empty JSON as fallback
  }
};

// ---------------------------------------------------------------------------
// InMemoryFileSystem – remains below
// ---------------------------------------------------------------------------
export class InMemoryFileSystem implements FileSystemPort {
  private files: Record<string, string> = {};

  private norm(p: string): string {
    return path.resolve(p);
  }

  exists(p: string): boolean {
    const key = this.norm(p);
    if (Object.prototype.hasOwnProperty.call(this.files, key)) return true;
    const dirPrefix = key.endsWith(path.sep) ? key : key + path.sep;
    return Object.keys(this.files).some((k) => k.startsWith(dirPrefix));
  }
  list(dirPath: string): string[] {
    const dirKey = this.norm(dirPath);
    const prefix = dirKey.endsWith(path.sep) ? dirKey : dirKey + path.sep;
    const entries = new Set<string>();
    Object.keys(this.files).forEach((k) => {
      if (k.startsWith(prefix)) {
        const rest = k.slice(prefix.length);
        const firstPart = rest.split(path.sep)[0];
        if (firstPart) entries.add(firstPart);
      }
    });
    return Array.from(entries);
  }
  readUtf8(filePath: string): string {
    const key = this.norm(filePath);
    if (!this.exists(key)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return this.files[key];
  }
  writeUtf8(filePath: string, contents: string): void {
    const key = this.norm(filePath);
    this.files[key] = contents;
  }
}
