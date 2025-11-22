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
exports.sendEmail = sendEmail;
exports.formatOrderEmail = formatOrderEmail;
const env_1 = require("../utils/env");
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("[EMAIL] Attempting to send email...");
        console.log("[EMAIL] To:", options.to);
        console.log("[EMAIL] Subject:", options.subject);
        // @ts-expect-error emailjs type is not defined
        const emailjsAvailable = typeof window.emailjs !== "undefined";
        console.log("[EMAIL] EmailJS available:", emailjsAvailable);
        try {
            yield sendEmailViaEmailJS(options);
            return;
        }
        catch (error) {
            console.error("[EMAIL] EmailJS failed:", error);
            if (error instanceof Error) {
                console.error("[EMAIL] Error message:", error.message);
            }
            throw error;
        }
    });
}
function sendEmailViaEmailJS(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if EmailJS is loaded - wait if it is loading
        let emailjs;
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            // @ts-expect-error emailjs type is not defined
            emailjs = window.emailjs;
            if (emailjs) {
                break;
            }
            yield new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
        }
        if (!emailjs) {
            throw new Error("EmailJS not loaded. Check that the script is included in index.html");
        }
        const publicKey = (0, env_1.readEnv)("EMAILJS_PUBLIC_KEY");
        const serviceId = (0, env_1.readEnv)("EMAILJS_SERVICE_ID");
        const templateId = (0, env_1.readEnv)("EMAILJS_TEMPLATE_ID");
        if (!publicKey || !serviceId || !templateId) {
            const missing = [];
            if (!publicKey)
                missing.push("EMAILJS_PUBLIC_KEY");
            if (!serviceId)
                missing.push("EMAILJS_SERVICE_ID");
            if (!templateId)
                missing.push("EMAILJS_TEMPLATE_ID");
            throw new Error(`EmailJS not configured. Missing: ${missing.join(", ")}`);
        }
        try {
            emailjs.init(publicKey);
            console.log("[EMAIL] ✅ EmailJS initialized");
            const templateParams = {
                to_email: options.to, // This must be mapped to "To Email" in template settings
                subject: options.subject, // This must be mapped to "Subject" in template settings
                customer_email: options.customerEmail || "",
                comment: options.comment || "No comment",
                items_html: options.itemsHtml ||
                    (options.html
                        ? extractItemsHtml(options.html)
                        : formatItemsAsHtml(options.body)),
                items_text: options.body.includes("Items:")
                    ? options.body.split("Items:")[1].trim()
                    : options.body,
            };
            console.log("[EMAIL] Sending email with template params:", {
                to_email: templateParams.to_email,
                subject: templateParams.subject,
                customer_email: templateParams.customer_email,
                comment: templateParams.comment,
                items_html_length: templateParams.items_html.length,
                items_text_length: templateParams.items_text.length,
            });
            const result = yield emailjs.send(serviceId, templateId, templateParams);
            console.log("[EMAIL] Email sent successfully via EmailJS");
            console.log("[EMAIL] Response:", result);
        }
        catch (error) {
            console.error("[EMAIL] EmailJS send error:", error);
            if (error instanceof Error) {
                console.error("[EMAIL] Error details:", {
                    message: error.message,
                    name: error.name,
                });
            }
            throw error;
        }
    });
}
/**
 * Extract items HTML from full email HTML
 */
function extractItemsHtml(fullHtml) {
    // Try to extract the <ul> content from the HTML
    const ulMatch = fullHtml.match(/<ul>([\s\S]*?)<\/ul>/);
    if (ulMatch && ulMatch[1]) {
        return ulMatch[1].trim();
    }
    // Fallback: try to find list items
    const liMatches = fullHtml.match(/<li>[\s\S]*?<\/li>/g);
    if (liMatches) {
        return liMatches.join("");
    }
    return "";
}
/**
 * Format plain text items as HTML list items
 */
function formatItemsAsHtml(text) {
    // Extract items from plain text format: "- Item: quantity"
    const lines = text.split("\n");
    const items = lines
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => {
        const match = line.match(/^-\s*(.+?):\s*(\d+)/);
        if (match) {
            return `<li><strong>${match[1]}</strong>: ${match[2]} шт.</li>`;
        }
        return `<li>${line.replace(/^-\s*/, "")}</li>`;
    });
    return items.join("");
}
/**
 * Format order email content
 */
function formatOrderEmail(customerEmail, comment, orderLines, orderId) {
    const subject = `New Order from ${customerEmail}`;
    // Sort order lines by product name
    const sortedLines = [...orderLines].sort((a, b) => a.productName.localeCompare(b.productName));
    const itemsList = sortedLines
        .map((line) => `- ${line.productName}: ${line.quantity} шт.`)
        .join("\n");
    // HTML formatted items list ONLY (for EmailJS template - template provides the structure)
    const itemsHtml = sortedLines
        .map((line) => `<li><strong>${line.productName}</strong>: ${line.quantity} шт.</li>`)
        .join("");
    const body = `New Order Received

Customer: ${customerEmail}
${orderId ? `Order ID: ${orderId}\n` : ""}Comment: ${comment || "No comment"}

Items:
${itemsList}
`;
    // Full HTML email (for fallback/other uses)
    const html = `<h2>📦 New Order Received</h2>
<p><strong>Customer Email:</strong> ${customerEmail}</p>
${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ""}
<p><strong>Comment:</strong> ${comment || "No comment"}</p>
<h3>Order Items:</h3>
<ul>
${itemsHtml}
</ul>`;
    return {
        subject,
        body,
        html,
        customerEmail,
        comment: comment || "No comment",
        itemsList,
        itemsHtml, // This is just the <li> items, template will wrap in <ul>
    };
}
