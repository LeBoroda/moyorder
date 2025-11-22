"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_model_1 = require("../models/auth-model");
const events_1 = require("../events/events");
const event_bus_1 = require("../events/event-bus");
class AuthController {
    constructor() {
        this.login = (email) => {
            const priceLevel = auth_model_1.authModel.resolvePriceLevel(email);
            if (!priceLevel) {
                return false;
            }
            const user = { email, priceLevel };
            auth_model_1.authModel.setUser(user);
            event_bus_1.eventBus.emit(events_1.AppEvents.AuthLogin, user);
            return true;
        };
        this.logout = () => {
            auth_model_1.authModel.clearUser();
            event_bus_1.eventBus.emit(events_1.AppEvents.AuthLogout, null);
        };
    }
}
exports.authController = new AuthController();
