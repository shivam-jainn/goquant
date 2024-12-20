import React, { useMemo, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import OrderCard from './OrderCard';
import { OrderTrade } from '@/stores/orderbook-store';
import { useVirtualizer } from '@tanstack/react-virtual';

interface OrderTableProps {
    type: 'buy' | 'sell';
    orders: OrderTrade[];
    matchingSellOrders: OrderTrade[];
    onOrderHover?: (order: OrderTrade | null) => void;
}

export default function OrderTable({
    type,
    orders,
    matchingSellOrders,
    onOrderHover
}: OrderTableProps) {
    const parentRef = React.useRef<HTMLDivElement>(null);

    // Calculate matching orders map for performance
    const matchingOrdersMap = useMemo(() => {
        if (type !== 'sell') return new Map();
        return new Map(matchingSellOrders.map(order => [order.orderId, true]));
    }, [type, matchingSellOrders]);

    // Virtualized rows for performance
    const rowVirtualizer = useVirtualizer({
        count: orders.length,
        getScrollElement: () => parentRef.current,
        estimateSize: useCallback(() => 56, []), // Estimated row height
        overscan: 5
    });

    const title = type === 'buy' ? 'Buy Orders' : 'Sell Orders';
    const titleColor = type === 'buy' ? 'text-green-400' : 'text-red-400';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between sticky top-0 bg-zinc-900 z-10 p-2">
                <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
                <Badge variant="outline" className={titleColor}>
                    {orders.length} Orders
                </Badge>
            </div>
            <div className="rounded-lg border border-zinc-800">
                <div className="w-full">
                    <div className="bg-zinc-800/50 sticky top-0 z-10">
                        <div className="grid grid-cols-5 w-full">
                            <div className="p-4 text-left font-medium">Symbol</div>
                            <div className="p-4 text-left font-medium">Total</div>
                            <div className="p-4 text-left font-medium">Price</div>
                            <div className="p-4 text-left font-medium">Quantity</div>
                            <div className="p-4 text-right font-medium">Actions</div>
                        </div>
                    </div>
                </div>
                <div 
                    ref={parentRef} 
                    className="max-h-[500px] overflow-auto"
                >
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative'
                        }}
                    >
                        {orders.length > 0 ? (
                            rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const order = orders[virtualRow.index];
                                return (
                                    <div
                                        key={order.orderId}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: `${virtualRow.size}px`,
                                            transform: `translateY(${virtualRow.start}px)`
                                        }}
                                    >
                                        <OrderCard
                                            order={order}
                                            type={type}
                                            matchingSellOrders={matchingSellOrders}
                                            onOrderHover={type === 'buy' ? onOrderHover : undefined}
                                            isMatching={matchingOrdersMap.has(order.orderId)}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-zinc-400">
                                No {type} orders available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}