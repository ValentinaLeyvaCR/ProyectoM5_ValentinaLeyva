type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};


function getMinLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? "info").toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") return raw;
  return "info";
}


const TOKEN_PATTERN = /gh[pousr]_[A-Za-z0-9_]{20,}/g;

function redact(text: string): string {
  return text.replace(TOKEN_PATTERN, "[REDACTED_TOKEN]");
}


function log(level: LogLevel, message: string, meta?: object): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[getMinLevel()]) return;

  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${redact(message)}`;

  if (meta) {
    
    const safeMeta = JSON.parse(redact(JSON.stringify(meta)));
    console.error(line, safeMeta);
  } else {
    console.error(line);
  }
}

export const logger = {
  debug: (message: string, meta?: object) => log("debug", message, meta),
  info: (message: string, meta?: object) => log("info", message, meta),
  warn: (message: string, meta?: object) => log("warn", message, meta),
  error: (message: string, meta?: object) => log("error", message, meta),
};
