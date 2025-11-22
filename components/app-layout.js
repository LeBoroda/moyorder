"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppLayout;
const react_router_dom_1 = require("react-router-dom");
const auth_context_1 = require("../context/auth-context");
const react_1 = __importDefault(require("react"));
const NAV_ITEMS = [
    { to: "/stock", label: "Доступные товары" },
    { to: "/history", label: "Предыдущие заказы" },
    { to: "/about", label: "О приложении" },
];
function AppLayout() {
    const { user, logout } = (0, auth_context_1.useAuth)();
    return (react_1.default.createElement("div", { className: "app-shell" },
        react_1.default.createElement("header", { className: "app-header" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("h1", null, "MoySklad Order Maker"),
                react_1.default.createElement("p", { className: "app-subtitle" }, "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u0432 \u0441\u0435\u0440\u0432\u0438\u0441\u0435 \u041C\u043E\u0439\u0421\u043A\u043B\u0430\u0434")),
            react_1.default.createElement("div", { className: "user-panel", "data-testid": "user-panel" }, user ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "user-name" }, user.email),
                    react_1.default.createElement("p", { className: "user-email" },
                        "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0446\u0435\u043D:",
                        " ",
                        user.priceLevel === "basic"
                            ? "Базовый прайс"
                            : "Скидочный прайс")),
                react_1.default.createElement("button", { type: "button", onClick: logout }, "\u0412\u044B\u0445\u043E\u0434"))) : (react_1.default.createElement("p", { className: "user-name" }, "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0443\u0439\u0442\u0435\u0441\u044C")))),
        user && (react_1.default.createElement("nav", { "aria-label": "Primary", className: "app-nav" }, NAV_ITEMS.map((item) => (react_1.default.createElement(react_router_dom_1.Link, { key: item.to, to: item.to }, item.label))))),
        react_1.default.createElement("main", { className: "app-main" },
            react_1.default.createElement(react_router_dom_1.Outlet, null)),
        react_1.default.createElement("footer", { className: "app-footer" },
            react_1.default.createElement("a", { href: "https://www.flaticon.com/free-icons/beer", title: "beer icons" }, "Beer icons created by Dreamcreateicons - Flaticon"))));
}
