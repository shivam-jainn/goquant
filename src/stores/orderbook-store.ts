import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export enum e_OrderBookAccountType {
    client = "client",
    accmgr = "accmgr",
}

export enum e_OrderSide {
    BUY,
    SELL
}

export enum e_OrderStatus {
    CANCELLED,
    FULFILLED,
    PENDING
}

export enum e_OrderType {
    LIMIT,
    MARKET
}

export interface Base_Trade {
    signature: string;
    apiKey: string;
    timestamp: string;
    symbol: string;
}

export interface OrderTrade extends Base_Trade {
    id: string;
    orderSide: e_OrderSide;
    orderType: e_OrderType;
    orderStatus: e_OrderStatus;
    orderId: string;
    price: number;
    qty: number;
}

interface OrderBookState {
    // WebSocket Price Tracking
    prices: Record<string, number>;
    connectWebSocket: (symbol: string) => () => void;
    updatePrice: (symbol: string, price: number) => void;

    // Existing Order Book State
    role: e_OrderBookAccountType;
    setRole: (accType: e_OrderBookAccountType) => void;

    asset: string | null;
    setAsset: (newAsset: string | null) => void;

    buyOrders: OrderTrade[];
    sellOrders: OrderTrade[];
    createOrder: (orderProps: OrderTrade) => void;
    cancelOrder: (orderId: string) => void;
    updateOrder: (orderId: string, updatedProps: Partial<OrderTrade>) => void;
    getOrdersBySymbol: (symbol: string) => { buyOrders: OrderTrade[]; sellOrders: OrderTrade[] };
    reset : () => void;
}

export const useOrderBookStore = create<OrderBookState>()(
    devtools(
        persist(
            (set, get) => ({
                // WebSocket Price Tracking
                prices: {},
                connectWebSocket: (symbol) => {
                    const symbolLower = symbol.toLowerCase();
                    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbolLower}@ticker`);
                    
                    const handleMessage = (event: MessageEvent) => {
                        try {
                            const tickerData = JSON.parse(event.data);
                            const price = parseFloat(tickerData.c);
                            set(state => ({
                                prices: {
                                    ...state.prices,
                                    [symbol]: price
                                }
                            }));
                        } catch (error) {
                            console.error('WebSocket message error:', error);
                        }
                    };

                    ws.onmessage = handleMessage;

                    return () => {
                        ws.close();
                    };
                },
                updatePrice: (symbol, price) => {
                    set(state => ({
                        prices: {
                            ...state.prices,
                            [symbol]: price
                        }
                    }));
                },

                // Existing Order Book Logic
                role: e_OrderBookAccountType.client,
                setRole: (accType) => {
                    console.log("Setting Role:", accType);
                    set(() => ({ role: accType }));
                },

                asset: null,
                setAsset: (newAsset) => {
                    console.log("Setting Asset:", newAsset);
                    set(() => ({ asset: newAsset }));
                },

                buyOrders: [],
                sellOrders: [],

                createOrder: (orderProps) => {
                    console.log("Creating Order:", orderProps);

                    set((state) => {
                        const { buyOrders, sellOrders } = state;

                        // Check for duplicates
                        const existingOrder =
                            [...buyOrders, ...sellOrders].some((order) => order.id === orderProps.id);

                        if (existingOrder) {
                            console.error(`Order with ID ${orderProps.id} already exists.`);
                            return state;
                        }

                        // Add order to the appropriate list
                        const updatedOrders =
                            orderProps.orderSide === e_OrderSide.BUY
                                ? [...buyOrders, orderProps].sort((a, b) => a.price - b.price) // Sort ascending for BUY
                                : [...sellOrders, orderProps].sort((a, b) => b.price - a.price); // Sort descending for SELL

                        console.log("Updated Orders (Sorted):", updatedOrders);

                        return orderProps.orderSide === e_OrderSide.BUY
                            ? { buyOrders: updatedOrders, sellOrders }
                            : { sellOrders: updatedOrders, buyOrders };
                    });
                },

                cancelOrder: (orderId) => {
                    console.log("Cancelling Order ID:", orderId);
                
                    set((state) => {
                        const updatedBuyOrders = state.buyOrders.map((order) =>
                            order.orderId === orderId
                                ? { ...order, orderStatus: e_OrderStatus.CANCELLED }
                                : order
                        );
                
                        const updatedSellOrders = state.sellOrders.map((order) =>
                            order.orderId === orderId
                                ? { ...order, orderStatus: e_OrderStatus.CANCELLED }
                                : order
                        );
                
                        console.log("Updated Buy Orders After Cancel:", updatedBuyOrders);
                        console.log("Updated Sell Orders After Cancel:", updatedSellOrders);
                
                        return {
                            buyOrders: updatedBuyOrders,
                            sellOrders: updatedSellOrders
                        };
                    });
                },

                updateOrder: (orderId, updatedProps) => {
                    console.log("Updating Order ID:", orderId, "With:", updatedProps);
                
                    set((state) => {
                        const updatedBuyOrders = state.buyOrders.map((order) => {
                            if (order.orderId === orderId) {
                                return { ...order, ...updatedProps };
                            }
                            return order;
                        });
                
                        const updatedSellOrders = state.sellOrders.map((order) => {
                            if (order.orderId === orderId) {
                                return { ...order, ...updatedProps };
                            }
                            return order;
                        });
                
                        console.log("Updated Buy Orders:", updatedBuyOrders);
                        console.log("Updated Sell Orders:", updatedSellOrders);
                
                        return { buyOrders: updatedBuyOrders, sellOrders: updatedSellOrders };
                    });
                },
                

                getOrdersBySymbol: (symbol) => {
                    const { buyOrders, sellOrders } = get();

                    const filteredBuyOrders = buyOrders.filter((order) => order.symbol === symbol);
                    const filteredSellOrders = sellOrders.filter((order) => order.symbol === symbol);

                    console.log(`Orders for Symbol: ${symbol}`, {
                        buyOrders: filteredBuyOrders,
                        sellOrders: filteredSellOrders,
                    });

                    return { buyOrders: filteredBuyOrders, sellOrders: filteredSellOrders };
                },
                reset: () => {
                    console.log("Resetting Store to Initial State");
                    set(() => ({
                        prices: {},
                        role: e_OrderBookAccountType.client,
                        asset: null,
                        buyOrders: [],
                        sellOrders: [],
                    }));
                }
            }),
            { name: 'order-book-store' }
        )
    )
);