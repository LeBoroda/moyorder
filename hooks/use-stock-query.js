"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStockQuery = useStockQuery;
const react_1 = require("react");
const stock_controller_1 = require("../controllers/stock-controller");
const stock_model_1 = require("../models/stock-model");
function useStockQuery(priceLevel) {
    const snapshot = (0, react_1.useSyncExternalStore)(stock_model_1.stockModel.subscribe, stock_model_1.stockModel.getSnapshot);
    (0, react_1.useEffect)(() => {
        stock_controller_1.stockController.load(priceLevel);
    }, [priceLevel]);
    const data = snapshot.priceLevel === priceLevel ? snapshot.items : [];
    const error = snapshot.priceLevel === priceLevel ? snapshot.error : null;
    const loading = snapshot.loading || snapshot.priceLevel !== priceLevel;
    return { data, loading, error };
}
