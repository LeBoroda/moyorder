"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.handlers = new Map();
    }
    emit(event, payload) {
        const listeners = this.handlers.get(event);
        if (!listeners)
            return;
        listeners.forEach((handler) => handler(payload));
    }
    on(event, handler) {
        var _a;
        const listeners = (_a = this.handlers.get(event)) !== null && _a !== void 0 ? _a : new Set();
        listeners.add(handler);
        this.handlers.set(event, listeners);
        return () => {
            listeners.delete(handler);
            if (!listeners.size) {
                this.handlers.delete(event);
            }
        };
    }
}
exports.EventBus = EventBus;
exports.eventBus = new EventBus();
