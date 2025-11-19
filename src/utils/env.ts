type EnvKey =
  | "MOYSKLAD_USERNAME"
  | "MOYSKLAD_TOKEN"
  | "ORDER_NOTIFICATION_EMAIL"
  | "EMAILJS_PUBLIC_KEY"
  | "EMAILJS_SERVICE_ID"
  | "EMAILJS_TEMPLATE_ID";

function readViteEnv(): Record<string, string> | undefined {
  try {
    return (0, eval)("import.meta?.env") as Record<string, string> | undefined;
  } catch {
    return undefined;
  }
}

export function readEnv(key: EnvKey): string | undefined {
  const viteEnv = readViteEnv();
  if (viteEnv?.[key]) {
    return viteEnv[key];
  }
  return undefined;
}
