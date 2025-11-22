"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOrders = loadOrders;
exports.addOrder = addOrder;
exports.getOrderById = getOrderById;
exports.clearOrders = clearOrders;
const STORAGE_KEY = "ms-order-history";
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function generateId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function readStore() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
            return parsed;
        }
        return {};
    }
    catch (error) {
        console.warn("Failed to read order history from localStorage", error);
        return {};
    }
}
function writeStore(store) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
function loadOrders(email) {
    var _a;
    const store = readStore();
    const key = normalizeEmail(email);
    return (_a = store[key]) !== null && _a !== void 0 ? _a : [];
}
function addOrder(email, entry) {
    var _a;
    const store = readStore();
    const key = normalizeEmail(email);
    const bucket = (_a = store[key]) !== null && _a !== void 0 ? _a : [];
    const newEntry = Object.assign(Object.assign({}, entry), { customerEmail: email, id: generateId(), createdAt: new Date().toISOString() });
    store[key] = [newEntry, ...bucket];
    writeStore(store);
    return newEntry;
}
function getOrderById(email, orderId) {
    var _a;
    const orders = loadOrders(email);
    return (_a = orders.find((order) => order.id === orderId)) !== null && _a !== void 0 ? _a : null;
}
function clearOrders(email) {
    if (!email) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
    }
    const store = readStore();
    const key = normalizeEmail(email);
    if (store[key]) {
        delete store[key];
        writeStore(store);
    }
}
