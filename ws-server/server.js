"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const PORT = 8080;
var e_OrderSide;
(function (e_OrderSide) {
    e_OrderSide[e_OrderSide["BUY"] = 0] = "BUY";
    e_OrderSide[e_OrderSide["SELL"] = 1] = "SELL";
})(e_OrderSide || (e_OrderSide = {}));
var e_OrderStatus;
(function (e_OrderStatus) {
    e_OrderStatus[e_OrderStatus["CANCELLED"] = 0] = "CANCELLED";
    e_OrderStatus[e_OrderStatus["FULFILLED"] = 1] = "FULFILLED";
    e_OrderStatus[e_OrderStatus["PENDING"] = 2] = "PENDING";
})(e_OrderStatus || (e_OrderStatus = {}));
var e_OrderType;
(function (e_OrderType) {
    e_OrderType[e_OrderType["LIMIT"] = 0] = "LIMIT";
    e_OrderType[e_OrderType["MARKET"] = 1] = "MARKET";
})(e_OrderType || (e_OrderType = {}));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const wss = new ws_1.WebSocketServer({ server });
const marketPrices = {
    'BTCUSDT': 45000,
    'ETHUSDT': 2500
};
const createRandomOrder = (symbol) => {
    const orderId = (0, uuid_1.v4)();
    return {
        id: orderId,
        orderId,
        signature: `SIM_${orderId.slice(0, 8)}`,
        apiKey: 'simulator_key',
        timestamp: new Date().toISOString(),
        symbol,
        orderSide: Math.random() > 0.5 ? e_OrderSide.BUY : e_OrderSide.SELL,
        orderType: e_OrderType.LIMIT,
        orderStatus: e_OrderStatus.PENDING,
        price: marketPrices[symbol] + (Math.random() * 1000 - 500),
        qty: +(Math.random() * 2).toFixed(4)
    };
};
const broadcast = (clients, message) => {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
};
wss.on('connection', (ws) => {
    console.log('Client connected');
    Object.entries(marketPrices).forEach(([symbol, price]) => {
        ws.send(JSON.stringify({
            type: 'PRICE_UPDATE',
            symbol,
            price
        }));
    });
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.action === 'SUBSCRIBE' && marketPrices[data.symbol]) {
                ws.send(JSON.stringify({
                    type: 'PRICE_UPDATE',
                    symbol: data.symbol,
                    price: marketPrices[data.symbol]
                }));
            }
        }
        catch (error) {
            console.error('Error handling message:', error);
        }
    });
});
setInterval(() => {
    Object.keys(marketPrices).forEach(symbol => {
        const priceChange = (Math.random() * 200) - 100;
        marketPrices[symbol] = +(marketPrices[symbol] + priceChange).toFixed(2);
        broadcast(wss.clients, {
            type: 'PRICE_UPDATE',
            symbol,
            price: marketPrices[symbol]
        });
    });
}, 3000);
setInterval(() => {
    const symbol = Math.random() > 0.5 ? 'BTCUSDT' : 'ETHUSDT';
    const newOrder = createRandomOrder(symbol);
    broadcast(wss.clients, {
        type: 'NEW_ORDER',
        order: newOrder
    });
}, 5000);
setInterval(() => {
    const symbol = Math.random() > 0.5 ? 'BTCUSDT' : 'ETHUSDT';
    if (Math.random() > 0.7) {
        const orderId = (0, uuid_1.v4)();
        broadcast(wss.clients, {
            type: 'CANCEL_ORDER',
            orderId
        });
    }
    else {
        const updatedOrder = createRandomOrder(symbol);
        broadcast(wss.clients, {
            type: 'UPDATE_ORDER',
            orderId: updatedOrder.orderId,
            updatedProps: updatedOrder
        });
    }
}, 7000);
