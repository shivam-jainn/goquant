// server.ts
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const PORT = 8080;

enum e_OrderSide {
    BUY = 0,
    SELL = 1
}

enum e_OrderStatus {
    CANCELLED = 0,
    FULFILLED = 1,
    PENDING = 2
}

enum e_OrderType {
    LIMIT = 0,
    MARKET = 1
}

interface OrderTrade {
    id: string;
    orderId: string;
    signature: string;
    apiKey: string;
    timestamp: string;
    symbol: string;
    orderSide: e_OrderSide;
    orderType: e_OrderType;
    orderStatus: e_OrderStatus;
    price: number;
    qty: number;
}

const app = express();
app.use(cors());

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const marketPrices: Record<string, number> = {
    'BTCUSDT': 45000,
    'ETHUSDT': 2500
};

const createRandomOrder = (symbol: string): OrderTrade => {
    const orderId = uuidv4();
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

const broadcast = (clients: Set<WebSocket>, message: any) => {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
};

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    Object.entries(marketPrices).forEach(([symbol, price]) => {
        ws.send(JSON.stringify({
            type: 'PRICE_UPDATE',
            symbol,
            price
        }));
    });

    ws.on('message', (message: Buffer) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.action === 'SUBSCRIBE' && marketPrices[data.symbol]) {
                ws.send(JSON.stringify({
                    type: 'PRICE_UPDATE',
                    symbol: data.symbol,
                    price: marketPrices[data.symbol]
                }));
            }
        } catch (error) {
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
        const orderId = uuidv4();
        broadcast(wss.clients, {
            type: 'CANCEL_ORDER',
            orderId
        });
    } else {
        const updatedOrder = createRandomOrder(symbol);
        broadcast(wss.clients, {
            type: 'UPDATE_ORDER',
            orderId: updatedOrder.orderId,
            updatedProps: updatedOrder
        });
    }
}, 7000);
