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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StockPage;
const react_1 = require("react");
const order_controller_1 = require("../controllers/order-controller");
const auth_context_1 = require("../context/auth-context");
const use_stock_query_1 = require("../hooks/use-stock-query");
const react_2 = __importDefault(require("react"));
function buildOrderLines(stock, formState) {
    return stock
        .map((item) => {
        var _a;
        return ({
            item,
            quantity: (_a = formState[item.id]) !== null && _a !== void 0 ? _a : 0,
        });
    })
        .filter(({ quantity }) => quantity > 0);
}
function StockPage() {
    var _a;
    const { user } = (0, auth_context_1.useAuth)();
    const priceLevel = (_a = user === null || user === void 0 ? void 0 : user.priceLevel) !== null && _a !== void 0 ? _a : "basic";
    const { data: stock, loading, error } = (0, use_stock_query_1.useStockQuery)(priceLevel);
    const [quantities, setQuantities] = (0, react_1.useState)({});
    const [comment, setComment] = (0, react_1.useState)("");
    const [status, setStatus] = (0, react_1.useState)(null);
    const [isSubmitting, setSubmitting] = (0, react_1.useState)(false);
    // Filter products for:
    // - Start with "Jaws" (case-insensitive) for demo reasons
    // - Contain "мл" somewhere in the name for demo reasons
    // - Have available stock > 0
    // - Sort by name
    const availableStock = (0, react_1.useMemo)(() => stock
        .filter((item) => item.available > 0 &&
        item.name.toLowerCase().startsWith("jaws") &&
        item.name.includes("мл"))
        .sort((a, b) => a.name.localeCompare(b.name)), [stock]);
    const lines = (0, react_1.useMemo)(() => buildOrderLines(availableStock, quantities), [availableStock, quantities]);
    const totalPositions = lines.reduce((acc, { quantity, item }) => ({
        units: acc.units + quantity,
        value: acc.value + quantity * item.price,
    }), { units: 0, value: 0 });
    const handleQtyChange = (id, value) => {
        setQuantities((prev) => {
            const next = Object.assign({}, prev);
            if (!value) {
                delete next[id];
            }
            else {
                next[id] = value;
            }
            return next;
        });
    };
    const handleSubmit = (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        if (!user)
            return;
        if (!lines.length) {
            setStatus("Add at least one position to send an order.");
            return;
        }
        setSubmitting(true);
        setStatus(null);
        try {
            yield order_controller_1.orderController.submit({
                customerEmail: user.email,
                comment,
                lines,
            });
            setQuantities({});
            setComment("");
            setStatus("Order sent to the sales department.");
        }
        catch (submitError) {
            setStatus(submitError instanceof Error
                ? submitError.message
                : "Failed to submit order.");
        }
        finally {
            setSubmitting(false);
        }
    });
    return (react_2.default.createElement("section", { className: "page stock-page" },
        react_2.default.createElement("header", null,
            react_2.default.createElement("h2", null, "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043A \u0437\u0430\u043A\u0430\u0437\u0443"),
            react_2.default.createElement("p", null, "\u0412\u044B\u0431\u0435\u0440\u0435\u0442\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0434\u043B\u044F \u0437\u0430\u043A\u0430\u0437\u0430."),
            react_2.default.createElement("p", { className: "hint" },
                "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0446\u0435\u043D",
                " ",
                priceLevel === "basic" ? "базовый прайс" : "скидочный прайс",
                " \u0434\u043B\u044F",
                " ", user === null || user === void 0 ? void 0 :
                user.email,
                ".")),
        loading && react_2.default.createElement("p", null, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043E\u0441\u0442\u0430\u0442\u043A\u0438..."),
        error && (react_2.default.createElement("p", { role: "alert", className: "form-error" }, error)),
        !loading && !error && (react_2.default.createElement("form", { className: "card", onSubmit: handleSubmit, "aria-label": "Order form" },
            react_2.default.createElement("div", { className: "stock-table", role: "table" },
                react_2.default.createElement("div", { className: "stock-row stock-row--head", role: "row" },
                    react_2.default.createElement("span", { role: "columnheader" }, "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"),
                    react_2.default.createElement("span", { role: "columnheader" }, "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E"),
                    react_2.default.createElement("span", { role: "columnheader" }, "\u0426\u0435\u043D\u0430, \u20BD"),
                    react_2.default.createElement("span", { role: "columnheader" }, "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0432 \u0437\u0430\u043A\u0430\u0437\u0435")),
                availableStock.map((item) => {
                    var _a;
                    return (react_2.default.createElement("div", { key: item.id, className: "stock-row", role: "row" },
                        react_2.default.createElement("span", { role: "cell" }, item.name),
                        react_2.default.createElement("span", { role: "cell" }, item.available),
                        react_2.default.createElement("span", { role: "cell" }, item.price.toLocaleString("ru-RU")),
                        react_2.default.createElement("span", { role: "cell" },
                            react_2.default.createElement("input", { type: "number", min: 0, max: item.available, value: (_a = quantities[item.id]) !== null && _a !== void 0 ? _a : "", onChange: (event) => {
                                    const raw = event.target.value;
                                    const numericValue = raw === "" ? 0 : Number(raw);
                                    handleQtyChange(item.id, numericValue);
                                }, "aria-label": `Quantity for ${item.name}` }))));
                })),
            react_2.default.createElement("label", null,
                "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043A \u0437\u0430\u043A\u0430\u0437\u0443 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)",
                react_2.default.createElement("textarea", { value: comment, onChange: (event) => setComment(event.target.value), rows: 3 })),
            react_2.default.createElement("div", { className: "order-summary" },
                react_2.default.createElement("p", null,
                    "\u0418\u0442\u043E\u0433\u043E \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E: ",
                    react_2.default.createElement("strong", null, totalPositions.units)),
                react_2.default.createElement("p", null,
                    "\u0421\u0443\u043C\u043C\u0430 \u0437\u0430\u043A\u0430\u0437\u0430:",
                    " ",
                    react_2.default.createElement("strong", null,
                        totalPositions.value.toLocaleString("ru-RU"),
                        " \u20BD"))),
            status && (react_2.default.createElement("p", { role: "status", className: "form-message" }, status)),
            react_2.default.createElement("button", { type: "submit", disabled: isSubmitting }, isSubmitting ? "Отправка…" : "Отправить заказ")))));
}
