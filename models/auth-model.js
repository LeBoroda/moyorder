"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authModel = void 0;
const env_1 = require("../utils/env");
const PRICE_LEVEL_BY_EMAIL = {
    "small@beer.ru": "basic",
    "big@beer.ru": "level1",
};
const SESSION_STORAGE_KEY = "ms-user-session";
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function resolvePriceLevel(email) {
    var _a;
    return (_a = PRICE_LEVEL_BY_EMAIL[normalizeEmail(email)]) !== null && _a !== void 0 ? _a : null;
}
function hasCredentials() {
    return Boolean((0, env_1.readEnv)("MOYSKLAD_PASSWORD"));
}
function saveUserToStorage(user) {
    try {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    }
    catch (error) {
        console.warn("Failed to save user session to localStorage", error);
    }
}
function loadUserFromStorage() {
    try {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const user = JSON.parse(raw);
        if (user && user.email && user.priceLevel) {
            const currentPriceLevel = resolvePriceLevel(user.email);
            if (currentPriceLevel === user.priceLevel) {
                return user;
            }
        }
        clearUserFromStorage();
        return null;
    }
    catch (error) {
        console.warn("Failed to load user session from localStorage", error);
        clearUserFromStorage();
        return null;
    }
}
function clearUserFromStorage() {
    try {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    catch (error) {
        console.warn("Failed to clear user session from localStorage", error);
    }
}
class AuthModel {
    constructor() {
        this.listeners = new Set();
        this.subscribe = (listener) => {
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        };
        this.getSnapshot = () => this.state;
        this.setUser = (user) => {
            this.state = { user };
            saveUserToStorage(user);
            this.emit();
        };
        this.clearUser = () => {
            if (!this.state.user)
                return;
            this.state = { user: null };
            clearUserFromStorage();
            this.emit();
        };
        this.hasCredentials = () => hasCredentials();
        this.resolvePriceLevel = resolvePriceLevel;
        const savedUser = loadUserFromStorage();
        this.state = { user: savedUser };
    }
    emit() {
        this.listeners.forEach((listener) => listener());
    }
}
exports.authModel = new AuthModel();
