"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = void 0;
const events_1 = require("../events/events");
const event_bus_1 = require("../events/event-bus");
const order_history_1 = require("../services/order-history");
const moysklad_client_1 = require("../services/moysklad-client");
const email_service_1 = require("../services/email-service");
class OrderController {
    submit(_a) {
        return __awaiter(this, arguments, void 0, function* ({ customerEmail, comment, lines }) {
            const payload = {
                customerEmail,
                comment,
                lines: lines.map(({ item, quantity }) => ({
                    stockId: item.id,
                    quantity,
                })),
            };
            console.log("[DEBUG] Order payload:", JSON.stringify(payload, null, 2));
            // Test email notification separately - pass lines with product names
            yield testEmailNotification(payload, lines);
            const saved = (0, order_history_1.addOrder)(customerEmail, {
                comment,
                lines: lines.map(({ item, quantity }) => ({
                    id: item.id,
                    name: item.name,
                    quantity,
                })),
            });
            event_bus_1.eventBus.emit(events_1.AppEvents.OrderSubmitted, saved);
            return saved;
        });
    }
}
// Test function to debug and send email notification
function testEmailNotification(payload, linesWithItems) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("[EMAIL DEBUG] Testing email notification...");
        const notificationEmail = (0, moysklad_client_1.getOrderNotificationEmail)();
        console.log("[EMAIL DEBUG] Notification email from config:", notificationEmail);
        if (!notificationEmail) {
            console.error("[EMAIL DEBUG] ❌ No notification email configured!");
            console.error("[EMAIL DEBUG] Check:");
            console.error("[EMAIL DEBUG] 1. MOYSKLAD_CONFIG.ORDER_NOTIFICATION_EMAIL in src/config/moysklad.config.ts");
            console.error("[EMAIL DEBUG] 2. VITE_ORDER_NOTIFICATION_EMAIL in .env file");
            return;
        }
        console.log("[EMAIL DEBUG] ✅ Notification email found:", notificationEmail);
        // Build order summary with actual product names from the items
        // Create a map of stockId to product name for quick lookup
        const productMap = new Map();
        linesWithItems.forEach(({ item }) => {
            productMap.set(item.id, item.name);
        });
        const orderLines = payload.lines
            .map((line) => {
            const productName = productMap.get(line.stockId) || `Product ID: ${line.stockId}`;
            return {
                productName,
                quantity: line.quantity,
            };
        })
            .sort((a, b) => a.productName.localeCompare(b.productName));
        // Format email content
        const emailContent = (0, email_service_1.formatOrderEmail)(payload.customerEmail, payload.comment, orderLines);
        console.log("[EMAIL DEBUG] Email content prepared:");
        console.log("[EMAIL DEBUG]", JSON.stringify(emailContent, null, 2));
        // Try to send the email
        try {
            yield (0, email_service_1.sendEmail)({
                to: notificationEmail,
                subject: emailContent.subject,
                body: emailContent.body,
                html: emailContent.html,
                customerEmail: payload.customerEmail,
                comment: payload.comment,
                itemsHtml: emailContent.itemsHtml, // Pass items HTML separately for template
            });
            console.log("[EMAIL DEBUG] ✅ Email sent successfully!");
        }
        catch (error) {
            console.error("[EMAIL DEBUG] ❌ Failed to send email:", error);
            if (error instanceof Error) {
                console.error("[EMAIL DEBUG] Error message:", error.message);
            }
            console.error("[EMAIL DEBUG] Make sure EmailJS is configured in src/config/moysklad.config.ts");
        }
    });
}
exports.orderController = new OrderController();
