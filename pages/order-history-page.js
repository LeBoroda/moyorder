"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrderHistoryPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const auth_context_1 = require("../context/auth-context");
const order_history_1 = require("../services/order-history");
const react_2 = __importDefault(require("react"));
function OrderHistoryPage() {
    const { user } = (0, auth_context_1.useAuth)();
    const [orders, setOrders] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (!user) {
            setOrders([]);
            return;
        }
        setOrders((0, order_history_1.loadOrders)(user.email));
    }, [user]);
    return (react_2.default.createElement("section", { className: "page history-page" },
        react_2.default.createElement("header", null,
            react_2.default.createElement("h2", null, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u043E\u0432"),
            react_2.default.createElement("p", null, "\u0417\u0430\u043A\u0430\u0437\u044B \u0445\u0440\u0430\u043D\u044F\u0442\u0441\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430.")),
        !user ? (react_2.default.createElement("div", { className: "card" },
            react_2.default.createElement("p", null, "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0443\u0439\u0442\u0435\u0441\u044C, \u0447\u0442\u043E\u0431\u044B \u0432\u0438\u0434\u0435\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E \u0437\u0430\u043A\u0430\u0437\u043E\u0432."))) : !orders.length ? (react_2.default.createElement("div", { className: "card" },
            react_2.default.createElement("p", null, "\u041F\u043E\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u043D\u0435\u0442. \u0421\u0434\u0435\u043B\u0430\u0439\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0437."))) : (react_2.default.createElement("div", { className: "history-list" }, orders.map((order) => (react_2.default.createElement("article", { key: order.id, className: "card history-card" },
            react_2.default.createElement("header", null,
                react_2.default.createElement("h3", null,
                    react_2.default.createElement(react_router_dom_1.Link, { to: `/history/${order.id}`, className: "order-link" }, new Date(order.createdAt).toLocaleString())),
                react_2.default.createElement("p", null, order.customerEmail)),
            react_2.default.createElement("ul", null, order.lines
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((line) => (react_2.default.createElement("li", { key: line.id },
                line.name,
                " \u00D7 ",
                line.quantity)))),
            order.comment && (react_2.default.createElement("p", { className: "history-comment" }, order.comment)),
            react_2.default.createElement("div", { className: "order-actions" },
                react_2.default.createElement(react_router_dom_1.Link, { to: `/history/${order.id}`, className: "view-details-link" }, "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 \u2192")))))))));
}
