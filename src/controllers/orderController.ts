import { AppEvents } from "../events/events";
import { eventBus } from "../events/eventBus";
import { addOrder } from "../services/orderHistory";
import {
  getOrderNotificationEmail,
  type StockItem,
  type OrderPayload,
} from "../services/moySkladClient";
import { sendEmail, formatOrderEmail } from "../services/emailService";

interface SubmitParams {
  customerEmail: string;
  comment: string;
  lines: Array<{ item: StockItem; quantity: number }>;
}

class OrderController {
  async submit({ customerEmail, comment, lines }: SubmitParams) {
    const payload: OrderPayload = {
      customerEmail,
      comment,
      lines: lines.map(({ item, quantity }) => ({
        stockId: item.id,
        quantity,
      })),
    };

    console.log("[DEBUG] Order payload:", JSON.stringify(payload, null, 2));

    // Test email notification separately - pass lines with product names
    await testEmailNotification(payload, lines);

    const saved = addOrder(customerEmail, {
      comment,
      lines: lines.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        quantity,
      })),
    });

    eventBus.emit(AppEvents.OrderSubmitted, saved);

    return saved;
  }
}

// Test function to debug and send email notification
async function testEmailNotification(
  payload: OrderPayload,
  linesWithItems: Array<{ item: StockItem; quantity: number }>,
) {
  console.log("[EMAIL DEBUG] Testing email notification...");

  const notificationEmail = getOrderNotificationEmail();
  console.log(
    "[EMAIL DEBUG] Notification email from config:",
    notificationEmail,
  );

  if (!notificationEmail) {
    console.error("[EMAIL DEBUG] ❌ No notification email configured!");
    console.error("[EMAIL DEBUG] Check:");
    console.error(
      "[EMAIL DEBUG] 1. MOYSKLAD_CONFIG.ORDER_NOTIFICATION_EMAIL in src/config/moysklad.config.ts",
    );
    console.error(
      "[EMAIL DEBUG] 2. VITE_ORDER_NOTIFICATION_EMAIL in .env file",
    );
    return;
  }

  console.log("[EMAIL DEBUG] ✅ Notification email found:", notificationEmail);

  // Build order summary with actual product names from the items
  // Create a map of stockId to product name for quick lookup
  const productMap = new Map<string, string>();
  linesWithItems.forEach(({ item }) => {
    productMap.set(item.id, item.name);
  });

  const orderLines = payload.lines
    .map((line) => {
      const productName =
        productMap.get(line.stockId) || `Product ID: ${line.stockId}`;
      return {
        productName,
        quantity: line.quantity,
      };
    })
    .sort((a, b) => a.productName.localeCompare(b.productName));

  // Format email content
  const emailContent = formatOrderEmail(
    payload.customerEmail,
    payload.comment,
    orderLines,
  );

  console.log("[EMAIL DEBUG] Email content prepared:");
  console.log("[EMAIL DEBUG]", JSON.stringify(emailContent, null, 2));

  // Try to send the email
  try {
    await sendEmail({
      to: notificationEmail,
      subject: emailContent.subject,
      body: emailContent.body,
      html: emailContent.html,
      customerEmail: payload.customerEmail,
      comment: payload.comment,
      itemsHtml: emailContent.itemsHtml, // Pass items HTML separately for template
    });
    console.log("[EMAIL DEBUG] ✅ Email sent successfully!");
  } catch (error) {
    console.error("[EMAIL DEBUG] ❌ Failed to send email:", error);
    if (error instanceof Error) {
      console.error("[EMAIL DEBUG] Error message:", error.message);
    }
    console.error(
      "[EMAIL DEBUG] Make sure EmailJS is configured in src/config/moysklad.config.ts",
    );
  }
}

export const orderController = new OrderController();
