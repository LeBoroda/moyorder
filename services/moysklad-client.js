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
exports.fetchAvailableStock = fetchAvailableStock;
exports.getOrderNotificationEmail = getOrderNotificationEmail;
exports.submitSalesOrder = submitSalesOrder;
const env_1 = require("../utils/env");
// Actual MoySklad API base URL (used in meta.href for order payloads)
const MOYSKLAD_API_BASE_ACTUAL = "https://api.moysklad.ru/api/remap/1.2";
// Use proxy in development to avoid CORS issues
// In production, use CORS proxy if MOYSKLAD_CORS_PROXY is set, otherwise try direct API
function getMoySkladApiBase() {
    if (process.env.NODE_ENV === "development") {
        return "/api/moysklad";
    }
    // Check if CORS proxy is configured
    const corsProxy = (0, env_1.readEnv)("MOYSKLAD_CORS_PROXY");
    if (corsProxy) {
        // Remove trailing slash if present
        // The proxy will receive paths like /api/remap/1.2/entity/product
        // and will forward them to https://api.moysklad.ru/api/remap/1.2/entity/product
        return corsProxy.endsWith("/") ? corsProxy.slice(0, -1) : corsProxy;
    }
    // Try direct API (may fail due to CORS)
    return MOYSKLAD_API_BASE_ACTUAL;
}
const MOYSKLAD_API_BASE = getMoySkladApiBase();
function ensureMoySkladCredentials() {
    const username = (0, env_1.readEnv)("MOYSKLAD_USERNAME") || "";
    const password = (0, env_1.readEnv)("MOYSKLAD_PASSWORD");
    if (!password) {
        const errorMsg = "Missing MoySklad credentials. Please set MOYSKLAD_PASSWORD in environment variables.";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    return { username, password };
}
function moySkladRequest(endpoint_1) {
    return __awaiter(this, arguments, void 0, function* (endpoint, options = {}) {
        const { username, password } = ensureMoySkladCredentials();
        const url = `${MOYSKLAD_API_BASE}${endpoint}`;
        const basicAuth = username
            ? btoa(`${username}:${password}`)
            : btoa(`:${password}`);
        if (process.env.NODE_ENV === "development") {
            console.log(`[DEBUG] Making request to: ${url} (via proxy)`);
            console.log(`[DEBUG] Using Basic auth authentication`);
            console.log(`[DEBUG] Username: ${username || "(empty)"}, Password: ${password.substring(0, 8)}...${password.substring(password.length - 4)}`);
            console.log(`[DEBUG] Basic Auth string: ${username ? `${username}:${password.substring(0, 8)}...` : `:${password.substring(0, 8)}...`}`);
        }
        try {
            const response = yield fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign({ Authorization: `Basic ${basicAuth}`, "Content-Type": "application/json", Accept: "application/json;charset=utf-8" }, options.headers) }));
            if (!response.ok) {
                let errorMessage = `MoySklad API error: ${response.status} ${response.statusText}`;
                // Clone response to read error details without consuming the original
                const responseClone = response.clone();
                // Read error body as text first, then try to parse as JSON
                let errorBodyText = "";
                try {
                    errorBodyText = yield responseClone.text();
                }
                catch (_a) {
                    // If reading fails, use empty string
                    errorBodyText = "";
                }
                if (response.status === 401) {
                    let authErrorDetails = "";
                    if (errorBodyText) {
                        try {
                            const errorData = JSON.parse(errorBodyText);
                            if (process.env.NODE_ENV === "development") {
                                console.error("[DEBUG] 401 Error Response:", JSON.stringify(errorData, null, 2));
                            }
                            if (errorData.errors && Array.isArray(errorData.errors)) {
                                authErrorDetails = errorData.errors
                                    .map((e) => {
                                    if (typeof e === "object" && e !== null) {
                                        const err = e;
                                        return err.error || err.message || JSON.stringify(e);
                                    }
                                    return String(e);
                                })
                                    .join(", ");
                            }
                        }
                        catch (_b) {
                            // If JSON parsing fails, use text as is
                            if (process.env.NODE_ENV === "development") {
                                console.error("[DEBUG] 401 Error Text:", errorBodyText);
                            }
                            authErrorDetails = errorBodyText;
                        }
                    }
                    let authError = "MoySklad authentication failed. ";
                    if (authErrorDetails) {
                        authError += `Details: ${authErrorDetails}. `;
                    }
                    authError += "Please verify your MOYSKLAD_PASSWORD and .env setup.";
                    throw new Error(authError);
                }
                if (response.status === 429) {
                    throw new Error("MoySklad API rate limit exceeded. Please try again later.");
                }
                // For other errors, try to parse error details from text
                if (errorBodyText) {
                    try {
                        const errorData = JSON.parse(errorBodyText);
                        if (errorData.errors && Array.isArray(errorData.errors)) {
                            const errorDetails = errorData.errors
                                .map((e) => {
                                if (typeof e === "object" && e !== null) {
                                    const err = e;
                                    return err.error || err.message || JSON.stringify(e);
                                }
                                return String(e);
                            })
                                .join(", ");
                            errorMessage += `. ${errorDetails}`;
                        }
                        else if (errorData.error) {
                            errorMessage += `. ${errorData.error}`;
                        }
                        if (process.env.NODE_ENV === "development") {
                            console.error("[DEBUG] API Error Response:", errorData);
                        }
                    }
                    catch (_c) {
                        // If JSON parsing fails, use text as is
                        errorMessage += `. ${errorBodyText}`;
                        if (process.env.NODE_ENV === "development") {
                            console.error("[DEBUG] API Error Text:", errorBodyText);
                        }
                    }
                }
                throw new Error(errorMessage);
            }
            return response.json();
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("Failed to fetch") ||
                    error.message.includes("NetworkError")) {
                    throw new Error("Network error: Unable to connect to MoySklad API. Please check your internet connection and CORS settings.");
                }
                throw error;
            }
            throw new Error(`Network error while calling MoySklad API: ${endpoint}`);
        }
    });
}
function mapPriceLevelToMoySkladType(priceLevel) {
    return priceLevel === "basic" ? "Прайс основной" : "Прайс 1 уровень";
}
function findPriceByType(salePrices, targetType) {
    let price = salePrices.find((p) => p.priceType.name === targetType);
    if (price)
        return price.value / 100;
    price = salePrices.find((p) => p.priceType.name.toLowerCase() === targetType.toLowerCase());
    if (price)
        return price.value / 100;
    const targetLower = targetType.toLowerCase();
    price = salePrices.find((p) => {
        const priceTypeLower = p.priceType.name.toLowerCase();
        if (targetLower.includes("основной") &&
            priceTypeLower.includes("основной")) {
            return true;
        }
        if (targetLower.includes("1 уровень") &&
            priceTypeLower.includes("1 уровень")) {
            return true;
        }
        if (targetLower.includes("1 уровень")) {
            return (priceTypeLower.includes("1-й уровень") ||
                priceTypeLower.includes("первый уровень") ||
                priceTypeLower.includes("1 уровень"));
        }
        return false;
    });
    if (price)
        return price.value / 100;
    return null;
}
function fetchAllPages(endpoint_1) {
    return __awaiter(this, arguments, void 0, function* (endpoint, limit = 1000) {
        const allItems = [];
        let offset = 0;
        let hasMore = true;
        while (hasMore) {
            const response = yield moySkladRequest(`${endpoint}${endpoint.includes("?") ? "&" : "?"}limit=${limit}&offset=${offset}`);
            if (response.rows && response.rows.length > 0) {
                allItems.push(...response.rows);
                offset += response.rows.length;
                hasMore = response.rows.length === limit;
            }
            else {
                hasMore = false;
            }
        }
        return allItems;
    });
}
function fetchAvailableStock(priceLevel) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        ensureMoySkladCredentials();
        try {
            console.log(`Fetching products from MoySklad for price level: ${priceLevel}`);
            const products = yield fetchAllPages("/entity/product");
            if (!products || products.length === 0) {
                console.warn("No products found in MoySklad");
                return [];
            }
            console.log(`Found ${products.length} products`);
            const stockData = yield fetchAllPages("/report/stock/all");
            console.log(`Found ${stockData.length} stock entries`);
            const stockMap = new Map();
            for (const stock of stockData) {
                if ((_b = (_a = stock.assortment) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.href) {
                    const hrefParts = stock.assortment.meta.href.split("/");
                    const productId = hrefParts[hrefParts.length - 1];
                    if (productId) {
                        stockMap.set(productId, stock);
                    }
                }
                if (stock.name) {
                    const productByName = products.find((p) => p.name && p.name.toLowerCase() === stock.name.toLowerCase());
                    if (productByName && !stockMap.has(productByName.id)) {
                        stockMap.set(productByName.id, stock);
                    }
                }
            }
            const targetPriceType = mapPriceLevelToMoySkladType(priceLevel);
            const stockItems = [];
            for (const product of products) {
                const productName = product.name || "";
                const startsWithJaws = productName.trim().startsWith("Jaws");
                if (!startsWithJaws) {
                    continue;
                }
                let price = 0;
                if (product.salePrices && product.salePrices.length > 0) {
                    const foundPrice = findPriceByType(product.salePrices, targetPriceType);
                    if (foundPrice !== null) {
                        price = foundPrice;
                    }
                    else {
                        continue;
                    }
                }
                else {
                    continue;
                }
                const stock = stockMap.get(product.id);
                const available = stock
                    ? Math.max(0, (stock.stock || 0) - (stock.reserve || 0))
                    : 0;
                if (available <= 0) {
                    continue;
                }
                const article = product.article ||
                    (stock === null || stock === void 0 ? void 0 : stock.article) ||
                    (stock === null || stock === void 0 ? void 0 : stock.code) ||
                    (stock === null || stock === void 0 ? void 0 : stock.externalCode) ||
                    "";
                stockItems.push({
                    id: product.id,
                    name: productName || "Unnamed Product",
                    article,
                    available,
                    price,
                });
            }
            console.log(`Mapped ${stockItems.length} items with valid prices and stock`);
            return stockItems;
        }
        catch (error) {
            console.error("Failed to fetch stock from MoySklad:", error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to fetch stock from MoySklad API";
            throw new Error(errorMessage);
        }
    });
}
function getOrderNotificationEmail() {
    const email = (0, env_1.readEnv)("ORDER_NOTIFICATION_EMAIL");
    if (!email) {
        console.warn("Missing order notification email. Set ORDER_NOTIFICATION_EMAIL.");
        return "";
    }
    return email;
}
function submitSalesOrder(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        ensureMoySkladCredentials();
        const notificationEmail = getOrderNotificationEmail();
        if (!payload.lines.length) {
            throw new Error("В заказе должна быть как минимум одна строка");
        }
        try {
            const organizations = yield moySkladRequest("/entity/organization?limit=1");
            if (!organizations.rows || organizations.rows.length === 0) {
                throw new Error("No organization found in MoySklad. Please create an organization first.");
            }
            const organization = organizations.rows[0];
            let counterparty = null;
            try {
                const counterparties = yield moySkladRequest(`/entity/counterparty?filter=email=${encodeURIComponent(payload.customerEmail)}&limit=1`);
                if (counterparties.rows && counterparties.rows.length > 0) {
                    counterparty = counterparties.rows[0];
                }
                else {
                    const newCounterparty = yield moySkladRequest("/entity/counterparty", {
                        method: "POST",
                        body: JSON.stringify({
                            name: payload.customerEmail,
                            email: payload.customerEmail,
                        }),
                    });
                    counterparty = newCounterparty;
                }
            }
            catch (error) {
                console.warn("Failed to fetch/create counterparty:", error);
                try {
                    const allCounterparties = yield moySkladRequest("/entity/counterparty?limit=1");
                    if (allCounterparties.rows && allCounterparties.rows.length > 0) {
                        counterparty = allCounterparties.rows[0];
                    }
                }
                catch (_a) {
                    throw new Error("Failed to find or create counterparty (agent) for the order.");
                }
            }
            if (!counterparty) {
                throw new Error("Could not find or create counterparty (agent) for the order.");
            }
            const productIds = payload.lines.map((line) => line.stockId);
            const productPromises = productIds.map((id) => moySkladRequest(`/entity/product/${id}`));
            const products = yield Promise.all(productPromises);
            const positions = payload.lines.map((line, index) => {
                const product = products[index];
                const price = product.salePrices && product.salePrices.length > 0
                    ? product.salePrices[0].value / 100
                    : 0;
                return {
                    quantity: line.quantity,
                    price: price * 100,
                    discount: 0,
                    vat: 0,
                    assortment: {
                        meta: {
                            href: `${MOYSKLAD_API_BASE_ACTUAL}/entity/product/${line.stockId}`,
                            type: "product",
                        },
                    },
                };
            });
            const orderData = {
                name: `Заказ от ${payload.customerEmail}`,
                description: payload.comment ||
                    `Заказ от клиента ${payload.customerEmail}\nEmail: ${payload.customerEmail}`,
                organization: {
                    meta: {
                        href: `${MOYSKLAD_API_BASE_ACTUAL}/entity/organization/${organization.id}`,
                        type: "organization",
                    },
                },
                agent: {
                    meta: {
                        href: `${MOYSKLAD_API_BASE_ACTUAL}/entity/counterparty/${counterparty.id}`,
                        type: "counterparty",
                    },
                },
                positions,
            };
            const createdOrder = yield moySkladRequest("/entity/customerorder", {
                method: "POST",
                body: JSON.stringify(orderData),
            });
            console.log(`Order created in MoySklad: ${createdOrder.name} (ID: ${createdOrder.id})`);
            if (notificationEmail) {
                const orderSummary = payload.lines
                    .map((line, index) => {
                    const product = products[index];
                    return `- ${(product === null || product === void 0 ? void 0 : product.name) || line.stockId}: ${line.quantity} шт.`;
                })
                    .join("\n");
                console.log(`Order notification should be sent to ${notificationEmail}:\n` +
                    `Order ID: ${createdOrder.id}\n` +
                    `Customer: ${payload.customerEmail}\n` +
                    `Comment: ${payload.comment || "No comment"}\n` +
                    `Items:\n${orderSummary}`);
            }
        }
        catch (error) {
            console.error("Failed to submit order to MoySklad:", error);
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to submit order to MoySklad API";
            throw new Error(errorMessage);
        }
    });
}
