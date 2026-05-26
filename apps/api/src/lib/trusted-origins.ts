const privateNetworkHostPatterns = [
  /^localhost(?::\d+)?$/,
  /^127\.0\.0\.1(?::\d+)?$/,
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(?::\d+)?$/,
  /^192\.168\.\d{1,3}\.\d{1,3}(?::\d+)?$/,
];

export const trustedAuthOrigins = [
  "santuario-maringa://",
  "exp://",
  "exp://**",
  "http://localhost:*",
  "http://127.0.0.1:*",
  "http://10.*.*.*:*",
  "http://172.*.*.*:*",
  "http://192.168.*.*:*",
];

export function resolveCorsOrigin(origin: string) {
  if (!origin) {
    return null;
  }

  if (origin.startsWith("santuario-maringa://") || origin.startsWith("exp://")) {
    return origin;
  }

  try {
    const url = new URL(origin);

    if (url.protocol !== "http:") {
      return null;
    }

    return privateNetworkHostPatterns.some((pattern) => pattern.test(url.host)) ? origin : null;
  } catch {
    return null;
  }
}
