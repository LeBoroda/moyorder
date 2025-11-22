"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockModel = void 0;
const defaultState = {
    items: [],
    loading: false,
    error: null,
    priceLevel: "basic",
};
class StockModel {
    constructor() {
        this.state = defaultState;
        this.listeners = new Set();
        this.subscribe = (listener) => {
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        };
        this.getSnapshot = () => this.state;
        this.setLoading = (priceLevel) => {
            this.state = Object.assign(Object.assign({}, this.state), { loading: true, error: null, priceLevel });
            this.emit();
        };
        this.setData = (priceLevel, items) => {
            this.state = { items, loading: false, error: null, priceLevel };
            this.emit();
        };
        this.setError = (priceLevel, message) => {
            this.state = Object.assign(Object.assign({}, this.state), { loading: false, error: message, priceLevel });
            this.emit();
        };
    }
    emit() {
        this.listeners.forEach((listener) => listener());
    }
}
exports.stockModel = new StockModel();
