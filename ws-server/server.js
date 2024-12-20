"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const PORT = 8080;
// Enums matching your Zustand store
var OrderSide;
(function (OrderSide) {
    OrderSide[OrderSide["BUY"] = 0] = "BUY";
    OrderSide[OrderSide["SELL"] = 1] = "SELL";
})(OrderSide || (OrderSide = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["CANCELLED"] = 0] = "CANCELLED";
    OrderStatus[OrderStatus["FULFILLED"] = 1] = "FULFILLED";
    OrderStatus[OrderStatus["PENDING"] = 2] = "PENDING";
})(OrderStatus || (OrderStatus = {}));
var OrderType;
(function (OrderType) {
    OrderType[OrderType["LIMIT"] = 0] = "LIMIT";
    OrderType[OrderType["MARKET"] = 1] = "MARKET";
})(OrderType || (OrderType = {}));
const app = (0, express_1.default)();
const server = app.listen(PORT, () => {
    console.log(`Simulation server running on port ${PORT}`);
});
const wss = new ws_1.WebSocketServer({ server });
// Market state
const marketState = {
    BTCUSDT: { price: 43000 },
    ETHUSDT: { price: 2200 }
};
// Utility functions
const generateRealisticQuantity = (symbol) => {
    if (symbol === 'BTCUSDT') {
        return +(0.1 + Math.random() * 0.9).toFixed(6);
    }
    if (symbol === 'ETHUSDT') {
        return +(1 + Math.random() * 9).toFixed(6);
    }
    return 1;
};
const generateRealisticPrice = (symbol) => {
    const basePrice = marketState[symbol].price;
    const variation = basePrice * (Math.random() * 0.04 - 0.02);
    return +(basePrice + variation).toFixed(2);
};
let orderSideCounter = 0;
const generateOrder = (symbol) => {
    const orderId = (0, uuid_1.v4)();
    const now = new Date();
    const expirationDate = new Date(now.getTime() + Math.random() * 3600000);
    const orderSide = orderSideCounter % 2 === 0 ? OrderSide.BUY : OrderSide.SELL;
    orderSideCounter++;
    return {
        id: orderId,
        orderId,
        signature: `sim_${orderId.slice(0, 8)}`,
        apiKey: 'simulation_api',
        timestamp: now.toISOString(),
        symbol,
        orderSide,
        orderType: OrderType.LIMIT,
        orderStatus: OrderStatus.PENDING,
        price: generateRealisticPrice(symbol),
        qty: generateRealisticQuantity(symbol),
        expirationDate: expirationDate.toISOString()
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
// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected to simulation server');
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'SUBSCRIBE' && data.symbol) {
                ws.subscribed = data.symbol;
                ws.send(JSON.stringify({
                    type: 'PRICE_UPDATE',
                    symbol: data.symbol,
                    price: marketState[data.symbol].price,
                    timestamp: new Date().toISOString()
                }));
            }
        }
        catch (error) {
            console.error('Error handling message:', error);
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected from simulation server');
    });
});
// Simulation intervals
setInterval(() => {
    Object.keys(marketState).forEach(symbol => {
        const currentPrice = marketState[symbol].price;
        const volatility = 0.001;
        const change = currentPrice * volatility * (Math.random() * 2 - 1);
        marketState[symbol].price = +(currentPrice + change).toFixed(2);
        broadcast(wss.clients, {
            type: 'PRICE_UPDATE',
            symbol,
            price: marketState[symbol].price,
            timestamp: new Date().toISOString()
        });
    });
}, 2000);
setInterval(() => {
    const symbols = Object.keys(marketState);
    symbols.forEach(symbol => {
        const numOrders = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numOrders; i++) {
            const newOrder = generateOrder(symbol);
            broadcast(wss.clients, {
                type: 'NEW_ORDER',
                order: newOrder
            });
        }
        if (Math.random() < 0.05) {
            const cancelledOrder = {
                orderId: (0, uuid_1.v4)(),
                orderStatus: OrderStatus.CANCELLED,
                timestamp: new Date().toISOString()
            };
            broadcast(wss.clients, Object.assign({ type: 'ORDER_CANCELLED' }, cancelledOrder));
        }
    });
}, 5000);
