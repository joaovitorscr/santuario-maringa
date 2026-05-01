import chalk from "chalk";
import type { MiddlewareHandler } from "hono";

export const isDevelopmentMode = () => process.env.NODE_ENV === "development";

const getMethodLabel = (method: string) => {
  switch (method) {
    case "GET":
      return chalk.black.bgGreen(` ${method} `);
    case "POST":
      return chalk.black.bgBlue(` ${method} `);
    case "PATCH":
      return chalk.black.bgYellow(` ${method} `);
    case "PUT":
      return chalk.black.bgCyan(` ${method} `);
    case "DELETE":
      return chalk.black.bgRed(` ${method} `);
    default:
      return chalk.black.bgWhite(` ${method} `);
  }
};

const getStatusLabel = (status: number) => {
  if (status >= 500) {
    return chalk.redBright.bold(String(status));
  }

  if (status >= 400) {
    return chalk.yellowBright.bold(String(status));
  }

  if (status >= 300) {
    return chalk.cyanBright.bold(String(status));
  }

  return chalk.greenBright.bold(String(status));
};

const getDurationLabel = (durationMs: number) => {
  if (durationMs >= 1_000) {
    return chalk.red(`${durationMs}ms`);
  }

  if (durationMs >= 250) {
    return chalk.yellow(`${durationMs}ms`);
  }

  return chalk.gray(`${durationMs}ms`);
};

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  if (!isDevelopmentMode()) {
    await next();
    return;
  }

  const startedAt = performance.now();
  const timestamp = chalk.dim(new Date().toLocaleTimeString("en-US", { hour12: false }));
  const { pathname, search } = new URL(c.req.url);
  const requestTarget = chalk.whiteBright(`${pathname}${search}`);

  try {
    await next();
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    console.error(
      `${chalk.dim("API")} ${timestamp} ${getMethodLabel(c.req.method)} ${chalk.redBright.bold("ERR")} ${requestTarget} ${getDurationLabel(durationMs)}`,
    );
    throw error;
  }

  const durationMs = Math.round(performance.now() - startedAt);

  console.log(
    `${chalk.dim("API")} ${timestamp} ${getMethodLabel(c.req.method)} ${getStatusLabel(c.res.status)} ${requestTarget} ${getDurationLabel(durationMs)}`,
  );
};
