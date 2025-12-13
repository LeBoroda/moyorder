"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEnv = readEnv;
function readEnv(key) {
    switch (key) {
        case "MOYSKLAD_USERNAME":
            return process.env.MOYSKLAD_USERNAME;
        case "MOYSKLAD_PASSWORD":
            return process.env.MOYSKLAD_PASSWORD;
        case "MOYSKLAD_CORS_PROXY":
            return process.env.MOYSKLAD_CORS_PROXY;
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
