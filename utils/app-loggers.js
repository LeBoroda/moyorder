"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_bus_1 = require("../events/event-bus");
const events_1 = require("../events/events");
event_bus_1.eventBus.on(events_1.AppEvents.AuthLogin, (user) => {
    console.info("[EventBus] User logged in", user);
});
event_bus_1.eventBus.on(events_1.AppEvents.AuthLogout, () => {
    console.info("[EventBus] User logged out");
});
event_bus_1.eventBus.on(events_1.AppEvents.StockRequested, (payload) => {
    console.info("[EventBus] Stock requested", payload);
});
event_bus_1.eventBus.on(events_1.AppEvents.StockLoaded, (payload) => {
    console.info("[EventBus] Stock loaded", payload);
});
event_bus_1.eventBus.on(events_1.AppEvents.StockFailed, (payload) => {
    console.warn("[EventBus] Stock failed", payload);
});
event_bus_1.eventBus.on(events_1.AppEvents.OrderSubmitted, (order) => {
    console.info("[EventBus] Order submitted", order);
});
