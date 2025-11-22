type EnvKey =
  | "MOYSKLAD_USERNAME"
  | "MOYSKLAD_PASSWORD"
  | "MOYSKLAD_TOKEN"
  | "ORDER_NOTIFICATION_EMAIL"
  | "EMAILJS_PUBLIC_KEY"
  | "EMAILJS_SERVICE_ID"
  | "EMAILJS_TEMPLATE_ID";

export function readEnv(key: EnvKey): string | undefined {
  switch (key) {
    case "MOYSKLAD_USERNAME":
      return process.env.MOYSKLAD_USERNAME;
    case "MOYSKLAD_PASSWORD":
      return process.env.MOYSKLAD_PASSWORD;
    case "MOYSKLAD_TOKEN":
      return process.env.MOYSKLAD_TOKEN;
    case "ORDER_NOTIFICATION_EMAIL":
      return process.env.ORDER_NOTIFICATION_EMAIL;
    case "EMAILJS_PUBLIC_KEY":
      return process.env.EMAILJS_PUBLIC_KEY;
    case "EMAILJS_SERVICE_ID":
      return process.env.EMAILJS_SERVICE_ID;
    case "EMAILJS_TEMPLATE_ID":
      return process.env.EMAILJS_TEMPLATE_ID;
    default:
      return undefined;
  }
}
