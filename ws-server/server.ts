import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const PORT = 8080;

// Enums matching your Zustand store
enum OrderSide {
    BUY = 0,
    SELL = 1
}

enum OrderStatus {
    CANCELLED = 0,
    FULFILLED = 1,
    PENDING = 2
}

enum OrderType {
    LIMIT = 0,
    MARKET = 1
}

interface SimulatedOrder {
    id: string;
    orderId: string;
    signature: string;
    apiKey: string;
    timestamp: string;
    symbol: string;
    orderSide: OrderSide;
    orderType: OrderType;
    orderStatus: OrderStatus;
    price: number;
    qty: number;
    expirationDate?: string;
}

// Track connected clients and their subscriptions
interface Client extends WebSocket {
    subscribed?: string;
}

const app = express();
const server = app.listen(PORT, () => {
    console.log(`Simulation server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

// Market state
const marketState: Record<string, { price: number }> = {
    BTCUSDT: { price: 43000 },
    ETHUSDT: { price: 2200 }
};

// Utility functions
const generateRealisticQuantity = (symbol: string): number => {
    if (symbol === 'BTCUSDT') {
        return +(0.1 + Math.random() * 0.9).toFixed(6);
    }
    if (symbol === 'ETHUSDT') {
        return +(1 + Math.random() * 9).toFixed(6);
    }
    return 1;
};

const generateRealisticPrice = (symbol: string): number => {
    const basePrice = marketState[symbol].price;
    const variation = basePrice * (Math.random() * 0.04 - 0.02);
    return +(basePrice + variation).toFixed(2);
};

let orderSideCounter = 0;

const generateOrder = (symbol: string): SimulatedOrder => {
    const orderId = uuidv4();
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

const broadcast = (clients: Set<Client>, message: any) => {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
};

// WebSocket connection handler
wss.on('connection', (ws: Client) => {
    console.log('Client connected to simulation server');

    ws.on('message', (message: string) => {
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
        } catch (error) {
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

        broadcast(wss.clients as Set<Client>, {
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

            broadcast(wss.clients as Set<Client>, {
                type: 'NEW_ORDER',
                order: newOrder
            });
        }

        if (Math.random() < 0.05) {
            const cancelledOrder = {
                orderId: uuidv4(),
                orderStatus: OrderStatus.CANCELLED,
                timestamp: new Date().toISOString()
            };

            broadcast(wss.clients as Set<Client>, {
                type: 'ORDER_CANCELLED',
                ...cancelledOrder
            });
        }
    });
}, 5000);

export {};
