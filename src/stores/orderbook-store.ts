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

export interface Base_Trade{
    signature : string;
    apiKey : string;
    timestamp : string;
    symbol : string;
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
    role: e_OrderBookAccountType;
    setRole: (accType: e_OrderBookAccountType) => void;

    asset: string | null;
    setAsset: (newAsset: string | null) => void;

    orders: OrderTrade[];
    createOrder: (orderProps: OrderTrade) => void;
    cancelOrder: (orderId: string) => void;
    updateOrder: (orderId: string, updatedProps: Partial<OrderTrade>) => void;

    getOrdersBySymbol: (symbol: string) => OrderTrade[];
}


export const useOrderBookStore = create<OrderBookState>()(
    devtools(
        persist(
            (set, get) => ({
                role: e_OrderBookAccountType.client,
                setRole: (accType) => set(() => ({ role: accType })),

                asset: null,
                setAsset: (newAsset) => set(() => ({ asset: newAsset })),

                orders: [],
                createOrder: (orderProps) => {
                    const { orders } = get();
                    
                    const isDuplicate = orders.some(
                        (order) => order.orderId === orderProps.orderId
                    );

                    if (isDuplicate) {
                        console.error(`Order with ID ${orderProps.orderId} already exists.`);
                        return false;
                    }

                 
                    set((state) => ({
                        orders: [...state.orders, orderProps],
                    }));
                },
                cancelOrder: (orderId) =>
                    set((state) => ({
                        orders: state.orders.map((order) =>
                            order.id === orderId
                                ? { ...order, orderStatus: e_OrderStatus.CANCELLED }
                                : order
                        ),
                    })),
                updateOrder: (orderId, updatedProps) =>
                    set((state) => ({
                        orders: state.orders.map((order) =>
                            order.id === orderId ? { ...order, ...updatedProps } : order
                        ),
                    })),
                getOrdersBySymbol: (symbol) => {
                    const { orders } = get();
                    return orders.filter((order) => order.orderId === symbol);
                },
            }),
            { name: 'order-book-store' } // Unique key for storage
        )
    )
);
