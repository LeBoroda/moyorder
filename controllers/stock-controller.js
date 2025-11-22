"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockController = void 0;
const stock_model_1 = require("../models/stock-model");
const moysklad_client_1 = require("../services/moysklad-client");
const event_bus_1 = require("../events/event-bus");
const events_1 = require("../events/events");
class StockController {
    load(priceLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            stock_model_1.stockModel.setLoading(priceLevel);
            event_bus_1.eventBus.emit(events_1.AppEvents.StockRequested, { priceLevel });
            try {
                const items = yield (0, moysklad_client_1.fetchAvailableStock)(priceLevel);
                stock_model_1.stockModel.setData(priceLevel, items);
                event_bus_1.eventBus.emit(events_1.AppEvents.StockLoaded, { priceLevel, items });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load stock.";
                stock_model_1.stockModel.setError(priceLevel, message);
                event_bus_1.eventBus.emit(events_1.AppEvents.StockFailed, { priceLevel, message });
            }
        });
    }
}
exports.stockController = new StockController();
