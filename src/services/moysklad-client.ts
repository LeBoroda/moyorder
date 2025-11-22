import type { PriceLevel } from "../types/pricing";
import { readEnv } from "../utils/env";

export interface StockItem {
  id: string;
  name: string;
  article: string;
  available: number;
  price: number;
}

export interface OrderLineInput {
  stockId: string;
  quantity: number;
}

export interface OrderPayload {
  customerEmail: string;
  comment?: string;
  lines: OrderLineInput[];
}

// MoySklad API types
interface MoySkladProduct {
  id: string;
  name: string;
  article?: string;
  salePrices?: Array<{
    priceType: {
      name: string;
    };
    value: number;
  }>;
}

interface MoySkladStock {
  stock: number;
  reserve: number;
  inTransit: number;
  quantity: number;
  name: string;
  code?: string;
  article?: string;
  externalCode?: string;
  assortment?: {
    meta: {
      href: string;
      type: string;
    };
  };
}

interface MoySkladResponse<T> {
  rows: T[];
  meta: {
    size: number;
    limit: number;
    offset: number;
  };
}

// Actual MoySklad API base URL (used in meta.href for order payloads)
const MOYSKLAD_API_BASE_ACTUAL = "https://api.moysklad.ru/api/remap/1.2";

// Use proxy in development to avoid CORS issues
// In production, use CORS proxy if MOYSKLAD_CORS_PROXY is set, otherwise try direct API
function getMoySkladApiBase(): string {
  if (process.env.NODE_ENV === "development") {
    return "/api/moysklad";
  }

  // Check if CORS proxy is configured
  const corsProxy = readEnv("MOYSKLAD_CORS_PROXY");
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

function ensureMoySkladCredentials(): { username: string; password: string } {
  const username = readEnv("MOYSKLAD_USERNAME") || "";
  const password = readEnv("MOYSKLAD_PASSWORD");

  if (!password) {
    const errorMsg =
      "Missing MoySklad credentials. Please set MOYSKLAD_PASSWORD in environment variables.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return { username, password };
}

async function moySkladRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { username, password } = ensureMoySkladCredentials();
  const url = `${MOYSKLAD_API_BASE}${endpoint}`;

  const basicAuth = username
    ? btoa(`${username}:${password}`)
    : btoa(`:${password}`);

  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] Making request to: ${url} (via proxy)`);
    console.log(`[DEBUG] Using Basic auth authentication`);
    console.log(
      `[DEBUG] Username: ${username || "(empty)"}, Password: ${password.substring(0, 8)}...${password.substring(password.length - 4)}`,
    );
    console.log(
      `[DEBUG] Basic Auth string: ${username ? `${username}:${password.substring(0, 8)}...` : `:${password.substring(0, 8)}...`}`,
    );
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        Accept: "application/json;charset=utf-8",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `MoySklad API error: ${response.status} ${response.statusText}`;

      // Clone response to read error details without consuming the original
      const responseClone = response.clone();

      // Read error body as text first, then try to parse as JSON
      let errorBodyText = "";
      try {
        errorBodyText = await responseClone.text();
      } catch {
        // If reading fails, use empty string
        errorBodyText = "";
      }

      if (response.status === 401) {
        let authErrorDetails = "";
        if (errorBodyText) {
          try {
            const errorData = JSON.parse(errorBodyText);
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[DEBUG] 401 Error Response:",
                JSON.stringify(errorData, null, 2),
              );
            }
            if (errorData.errors && Array.isArray(errorData.errors)) {
              authErrorDetails = errorData.errors
                .map((e: unknown) => {
                  if (typeof e === "object" && e !== null) {
                    const err = e as { error?: string; message?: string };
                    return err.error || err.message || JSON.stringify(e);
                  }
                  return String(e);
                })
                .join(", ");
            }
          } catch {
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
        throw new Error(
          "MoySklad API rate limit exceeded. Please try again later.",
        );
      }

      // For other errors, try to parse error details from text
      if (errorBodyText) {
        try {
          const errorData = JSON.parse(errorBodyText);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorDetails = errorData.errors
              .map((e: unknown) => {
                if (typeof e === "object" && e !== null) {
                  const err = e as { error?: string; message?: string };
                  return err.error || err.message || JSON.stringify(e);
                }
                return String(e);
              })
              .join(", ");
            errorMessage += `. ${errorDetails}`;
          } else if (errorData.error) {
            errorMessage += `. ${errorData.error}`;
          }
          if (process.env.NODE_ENV === "development") {
            console.error("[DEBUG] API Error Response:", errorData);
          }
        } catch {
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
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error(
          "Network error: Unable to connect to MoySklad API. Please check your internet connection and CORS settings.",
        );
      }
      throw error;
    }
    throw new Error(`Network error while calling MoySklad API: ${endpoint}`);
  }
}

function mapPriceLevelToMoySkladType(priceLevel: PriceLevel): string {
  return priceLevel === "basic" ? "Прайс основной" : "Прайс 1 уровень";
}

function findPriceByType(
  salePrices: Array<{ priceType: { name: string }; value: number }>,
  targetType: string,
): number | null {
  let price = salePrices.find((p) => p.priceType.name === targetType);
  if (price) return price.value / 100;

  price = salePrices.find(
    (p) => p.priceType.name.toLowerCase() === targetType.toLowerCase(),
  );
  if (price) return price.value / 100;

  const targetLower = targetType.toLowerCase();
  price = salePrices.find((p) => {
    const priceTypeLower = p.priceType.name.toLowerCase();
    if (
      targetLower.includes("основной") &&
      priceTypeLower.includes("основной")
    ) {
      return true;
    }
    if (
      targetLower.includes("1 уровень") &&
      priceTypeLower.includes("1 уровень")
    ) {
      return true;
    }
    if (targetLower.includes("1 уровень")) {
      return (
        priceTypeLower.includes("1-й уровень") ||
        priceTypeLower.includes("первый уровень") ||
        priceTypeLower.includes("1 уровень")
      );
    }
    return false;
  });
  if (price) return price.value / 100;

  return null;
}

async function fetchAllPages<T>(endpoint: string, limit = 1000): Promise<T[]> {
  const allItems: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await moySkladRequest<MoySkladResponse<T>>(
      `${endpoint}${endpoint.includes("?") ? "&" : "?"}limit=${limit}&offset=${offset}`,
    );

    if (response.rows && response.rows.length > 0) {
      allItems.push(...response.rows);
      offset += response.rows.length;
      hasMore = response.rows.length === limit;
    } else {
      hasMore = false;
    }
  }

  return allItems;
}

export async function fetchAvailableStock(
  priceLevel: PriceLevel,
): Promise<StockItem[]> {
  ensureMoySkladCredentials();

  try {
    console.log(
      `Fetching products from MoySklad for price level: ${priceLevel}`,
    );

    const products = await fetchAllPages<MoySkladProduct>("/entity/product");

    if (!products || products.length === 0) {
      console.warn("No products found in MoySklad");
      return [];
    }

    console.log(`Found ${products.length} products`);

    const stockData = await fetchAllPages<MoySkladStock>("/report/stock/all");
    console.log(`Found ${stockData.length} stock entries`);

    const stockMap = new Map<string, MoySkladStock>();
    for (const stock of stockData) {
      if (stock.assortment?.meta?.href) {
        const hrefParts = stock.assortment.meta.href.split("/");
        const productId = hrefParts[hrefParts.length - 1];
        if (productId) {
          stockMap.set(productId, stock);
        }
      }
      if (stock.name) {
        const productByName = products.find(
          (p) => p.name && p.name.toLowerCase() === stock.name.toLowerCase(),
        );
        if (productByName && !stockMap.has(productByName.id)) {
          stockMap.set(productByName.id, stock);
        }
      }
    }

    const targetPriceType = mapPriceLevelToMoySkladType(priceLevel);

    const stockItems: StockItem[] = [];

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
        } else {
          continue;
        }
      } else {
        continue;
      }

      const stock = stockMap.get(product.id);
      const available = stock
        ? Math.max(0, (stock.stock || 0) - (stock.reserve || 0))
        : 0;

      if (available <= 0) {
        continue;
      }

      const article =
        product.article ||
        stock?.article ||
        stock?.code ||
        stock?.externalCode ||
        "";

      stockItems.push({
        id: product.id,
        name: productName || "Unnamed Product",
        article,
        available,
        price,
      });
    }

    console.log(
      `Mapped ${stockItems.length} items with valid prices and stock`,
    );
    return stockItems;
  } catch (error) {
    console.error("Failed to fetch stock from MoySklad:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch stock from MoySklad API";
    throw new Error(errorMessage);
  }
}

export function getOrderNotificationEmail(): string {
  const email = readEnv("ORDER_NOTIFICATION_EMAIL");
  if (!email) {
    console.warn(
      "Missing order notification email. Set ORDER_NOTIFICATION_EMAIL.",
    );
    return "";
  }
  return email;
}

export async function submitSalesOrder(payload: OrderPayload): Promise<void> {
  ensureMoySkladCredentials();
  const notificationEmail = getOrderNotificationEmail();

  if (!payload.lines.length) {
    throw new Error("В заказе должна быть как минимум одна строка");
  }

  try {
    const organizations = await moySkladRequest<
      MoySkladResponse<{ id: string; name: string }>
    >("/entity/organization?limit=1");

    if (!organizations.rows || organizations.rows.length === 0) {
      throw new Error(
        "No organization found in MoySklad. Please create an organization first.",
      );
    }
    const organization = organizations.rows[0];

    let counterparty: { id: string; name: string } | null = null;
    try {
      const counterparties = await moySkladRequest<
        MoySkladResponse<{ id: string; name: string; email?: string }>
      >(
        `/entity/counterparty?filter=email=${encodeURIComponent(payload.customerEmail)}&limit=1`,
      );

      if (counterparties.rows && counterparties.rows.length > 0) {
        counterparty = counterparties.rows[0];
      } else {
        const newCounterparty = await moySkladRequest<{
          id: string;
          name: string;
        }>("/entity/counterparty", {
          method: "POST",
          body: JSON.stringify({
            name: payload.customerEmail,
            email: payload.customerEmail,
          }),
        });
        counterparty = newCounterparty;
      }
    } catch (error) {
      console.warn("Failed to fetch/create counterparty:", error);
      try {
        const allCounterparties = await moySkladRequest<
          MoySkladResponse<{ id: string; name: string }>
        >("/entity/counterparty?limit=1");
        if (allCounterparties.rows && allCounterparties.rows.length > 0) {
          counterparty = allCounterparties.rows[0];
        }
      } catch {
        throw new Error(
          "Failed to find or create counterparty (agent) for the order.",
        );
      }
    }

    if (!counterparty) {
      throw new Error(
        "Could not find or create counterparty (agent) for the order.",
      );
    }

    const productIds = payload.lines.map((line) => line.stockId);
    const productPromises = productIds.map((id) =>
      moySkladRequest<MoySkladProduct>(`/entity/product/${id}`),
    );
    const products = await Promise.all(productPromises);

    const positions = payload.lines.map((line, index) => {
      const product = products[index];
      const price =
        product.salePrices && product.salePrices.length > 0
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
      description:
        payload.comment ||
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

    const createdOrder = await moySkladRequest<{ id: string; name: string }>(
      "/entity/customerorder",
      {
        method: "POST",
        body: JSON.stringify(orderData),
      },
    );

    console.log(
      `Order created in MoySklad: ${createdOrder.name} (ID: ${createdOrder.id})`,
    );

    if (notificationEmail) {
      const orderSummary = payload.lines
        .map((line, index) => {
          const product = products[index];
          return `- ${product?.name || line.stockId}: ${line.quantity} шт.`;
        })
        .join("\n");

      console.log(
        `Order notification should be sent to ${notificationEmail}:\n` +
          `Order ID: ${createdOrder.id}\n` +
          `Customer: ${payload.customerEmail}\n` +
          `Comment: ${payload.comment || "No comment"}\n` +
          `Items:\n${orderSummary}`,
      );
    }
  } catch (error) {
    console.error("Failed to submit order to MoySklad:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to submit order to MoySklad API";
    throw new Error(errorMessage);
  }
}
