"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = __importDefault(require("react"));
const auth_controller_1 = require("../controllers/auth-controller");
const auth_model_1 = require("../models/auth-model");
const react_2 = require("react");
const AuthContext = (0, react_2.createContext)(undefined);
function AuthProvider({ children }) {
    const snapshot = (0, react_2.useSyncExternalStore)(auth_model_1.authModel.subscribe, auth_model_1.authModel.getSnapshot);
    const value = (0, react_2.useMemo)(() => ({
        user: snapshot.user,
        login: auth_controller_1.authController.login,
        logout: auth_controller_1.authController.logout,
        hasCredentials: auth_model_1.authModel.hasCredentials(),
    }), [snapshot.user]);
    return react_1.default.createElement(AuthContext.Provider, { value: value }, children);
}
function useAuth() {
    const context = (0, react_2.useContext)(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
