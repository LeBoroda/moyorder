"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const auth_context_1 = require("../context/auth-context");
const react_2 = __importDefault(require("react"));
function LoginPage() {
    const { login, user } = (0, auth_context_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [email, setEmail] = (0, react_1.useState)("");
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (user) {
            navigate("/stock", { replace: true });
        }
    }, [user, navigate]);
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!email) {
            setError("Введите свой электрический почтовый адрес.");
            return;
        }
        const ok = login(email);
        if (!ok) {
            setError("Логин неверный. Используйте зарегистрированный адрес электронной почты.");
            return;
        }
        navigate("/stock");
    };
    return (react_2.default.createElement("section", { className: "page login-page" },
        react_2.default.createElement("header", null,
            react_2.default.createElement("h2", null, "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C"),
            react_2.default.createElement("p", null, "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0443\u0439\u0442\u0435\u0441\u044C \u043F\u0440\u0438 \u043F\u043E\u043C\u043E\u0449\u0438 \u0430\u0434\u0440\u0435\u0441\u0430 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u044B.")),
        react_2.default.createElement("form", { onSubmit: handleSubmit, className: "card" },
            react_2.default.createElement("label", null,
                "Work email",
                react_2.default.createElement("input", { name: "email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "buyer@company.ru", required: true })),
            error && (react_2.default.createElement("p", { role: "alert", className: "form-error" }, error)),
            react_2.default.createElement("button", { type: "submit" }, "\u0412\u043E\u0439\u0442\u0438")),
        react_2.default.createElement("p", { className: "hint" }, "\u0417\u0430\u043A\u0430\u0437 \u043C\u043E\u0436\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u043F\u0440\u0438 \u043F\u043E\u043C\u043E\u0449\u0438 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u0430\u0434\u0440\u0435\u0441\u0430 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u044B.")));
}
