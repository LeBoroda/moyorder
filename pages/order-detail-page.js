"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrderDetailPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const auth_context_1 = require("../context/auth-context");
const order_history_1 = require("../services/order-history");
const react_2 = __importDefault(require("react"));
function OrderDetailPage() {
    const { user } = (0, auth_context_1.useAuth)();
    const { orderId } = (0, react_router_dom_1.useParams)();
    const [order, setOrder] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!user || !orderId) {
            setLoading(false);
            return;
        }
        const foundOrder = (0, order_history_1.getOrderById)(user.email, orderId);
        setOrder(foundOrder);
        setLoading(false);
    }, [user, orderId]);
    if (!user) {
        return react_2.default.createElement(react_router_dom_1.Navigate, { to: "/", replace: true });
    }
    if (loading) {
        return (react_2.default.createElement("section", { className: "page order-detail-page" },
            react_2.default.createElement("div", { className: "card" },
                react_2.default.createElement("p", null, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..."))));
    }
    if (!order) {
        return (react_2.default.createElement("section", { className: "page order-detail-page" },
            react_2.default.createElement("div", { className: "card" },
                react_2.default.createElement("h2", null, "\u0417\u0430\u043A\u0430\u0437 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"),
                react_2.default.createElement("p", null, "\u0417\u0430\u043A\u0430\u0437 \u0441 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u043C \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440\u043E\u043C \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442."),
                react_2.default.createElement(react_router_dom_1.Link, { to: "/history" }, "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0437\u0430\u043A\u0430\u0437\u043E\u0432"))));
    }
    const totalQuantity = order.lines.reduce((sum, line) => sum + line.quantity, 0);
    return (react_2.default.createElement("section", { className: "page order-detail-page" },
        react_2.default.createElement("header", null,
            react_2.default.createElement("h2", null, "\u0414\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430"),
            react_2.default.createElement("p", null,
                "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435 \u043E\u0442 ",
                new Date(order.createdAt).toLocaleString())),
        react_2.default.createElement("div", { className: "card order-detail-card" },
            react_2.default.createElement("div", { className: "order-detail-header" },
                react_2.default.createElement("div", null,
                    react_2.default.createElement("h3", null,
                        "\u0417\u0430\u043A\u0430\u0437 #",
                        order.id.slice(-8)),
                    react_2.default.createElement("p", { className: "order-date" },
                        "\u0421\u043E\u0437\u0434\u0430\u043D: ",
                        new Date(order.createdAt).toLocaleString("ru-RU")),
                    react_2.default.createElement("p", { className: "order-email" },
                        "Email: ",
                        order.customerEmail)),
                react_2.default.createElement(react_router_dom_1.Link, { to: "/history", className: "back-link" }, "\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0438\u0441\u0442\u043E\u0440\u0438\u0438")),
            order.comment && (react_2.default.createElement("div", { className: "order-comment-section" },
                react_2.default.createElement("h4", null, "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043A \u0437\u0430\u043A\u0430\u0437\u0443:"),
                react_2.default.createElement("p", { className: "order-comment" }, order.comment))),
            react_2.default.createElement("div", { className: "order-lines-section" },
                react_2.default.createElement("h4", null,
                    "\u041F\u043E\u0437\u0438\u0446\u0438\u0438 \u0437\u0430\u043A\u0430\u0437\u0430 (",
                    order.lines.length,
                    "):"),
                react_2.default.createElement("div", { className: "order-lines-table" },
                    react_2.default.createElement("div", { className: "order-line-header" },
                        react_2.default.createElement("span", null, "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435"),
                        react_2.default.createElement("span", null, "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E")),
                    order.lines
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((line) => (react_2.default.createElement("div", { key: line.id, className: "order-line-row" },
                        react_2.default.createElement("span", { className: "line-name" }, line.name),
                        react_2.default.createElement("span", { className: "line-quantity" },
                            "\u00D7 ",
                            line.quantity))))),
                react_2.default.createElement("div", { className: "order-total" },
                    react_2.default.createElement("strong", null,
                        "\u0412\u0441\u0435\u0433\u043E \u043F\u043E\u0437\u0438\u0446\u0438\u0439: ",
                        totalQuantity))))));
}
