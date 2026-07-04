const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  log: (...args: unknown[]) => isDev && console.log(...args),
  info: (...args: unknown[]) => isDev && console.info(...args),
  warn: (...args: unknown[]) => isDev && console.warn(...args),
  error: (...args: unknown[]) => isDev && console.error(...args),
  debug: (...args: unknown[]) => isDev && console.debug(...args),
};