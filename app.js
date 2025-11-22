"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_router_dom_1 = require("react-router-dom");
require("./app.css");
const app_layout_1 = __importDefault(require("./components/app-layout"));
const auth_context_1 = require("./context/auth-context");
const about_page_1 = __importDefault(require("./pages/about-page"));
const login_page_1 = __importDefault(require("./pages/login-page"));
const order_detail_page_1 = __importDefault(require("./pages/order-detail-page"));
const order_history_page_1 = __importDefault(require("./pages/order-history-page"));
const stock_page_1 = __importDefault(require("./pages/stock-page"));
const react_1 = __importDefault(require("react"));
function RequireAuth() {
    const { user } = (0, auth_context_1.useAuth)();
    if (!user) {
        return react_1.default.createElement(react_router_dom_1.Navigate, { to: "/", replace: true });
    }
    return react_1.default.createElement(react_router_dom_1.Outlet, null);
}
function AppRoutes() {
    const { user } = (0, auth_context_1.useAuth)();
    const defaultPath = user ? "/stock" : "/";
    return (react_1.default.createElement(react_router_dom_1.Routes, null,
        react_1.default.createElement(react_router_dom_1.Route, { element: react_1.default.createElement(app_layout_1.default, null) },
            react_1.default.createElement(react_router_dom_1.Route, { index: true, element: react_1.default.createElement(login_page_1.default, null) }),
            react_1.default.createElement(react_router_dom_1.Route, { element: react_1.default.createElement(RequireAuth, null) },
                react_1.default.createElement(react_router_dom_1.Route, { path: "/stock", element: react_1.default.createElement(stock_page_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "/history", element: react_1.default.createElement(order_history_page_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "/history/:orderId", element: react_1.default.createElement(order_detail_page_1.default, null) }),
                react_1.default.createElement(react_router_dom_1.Route, { path: "/about", element: react_1.default.createElement(about_page_1.default, null) })),
            react_1.default.createElement(react_router_dom_1.Route, { path: "*", element: react_1.default.createElement(react_router_dom_1.Navigate, { to: defaultPath, replace: true }) }))));
}
function App() {
    return (react_1.default.createElement(auth_context_1.AuthProvider, null,
        react_1.default.createElement(AppRoutes, null)));
}
