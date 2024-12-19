import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import OrderTable from './OrderTable';
import { findMatchingSellOrders } from './OrderMatching';
import { e_OrderStatus, useOrderBookStore } from '@/stores/orderbook-store';

export default function OrderMatcher() {
  const orderBookStore = useOrderBookStore();
  const [matchingSellOrders, setMatchingSellOrders] = React.useState([]);
  const [hoveredBuyOrder, setHoveredBuyOrder] = React.useState(null);
  
  const filteredBuyOrders = useMemo(() =>
    orderBookStore.buyOrders.filter(
      (order) => 
        order.symbol === orderBookStore.asset &&
        order.orderStatus !== e_OrderStatus.CANCELLED &&
        order.orderStatus !== e_OrderStatus.FULFILLED
    ),
    [orderBookStore.buyOrders, orderBookStore.asset]
  );

  const filteredSellOrders = useMemo(() =>
    orderBookStore.sellOrders.filter(
      (order) => 
        order.symbol === orderBookStore.asset &&
        order.orderStatus !== e_OrderStatus.CANCELLED &&
        order.orderStatus !== e_OrderStatus.FULFILLED
    ),
    [orderBookStore.sellOrders, orderBookStore.asset]
  );

  const handleOrderHover = React.useCallback((order) => {
    setHoveredBuyOrder(order);
    if (order) {
      const matches = findMatchingSellOrders(order, filteredSellOrders);
      setMatchingSellOrders(matches);
    } else {
      setMatchingSellOrders([]);
    }
  }, [filteredSellOrders]);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Order Matcher</h2>
          <p className="text-sm text-zinc-400">
            {orderBookStore.asset ? `Trading ${orderBookStore.asset}` : 'Select an asset to trade'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 gap-6 grid grid-cols-2">
            <OrderTable 
              type="buy"
              orders={filteredBuyOrders}
              matchingSellOrders={matchingSellOrders}
              onOrderHover={handleOrderHover}
            />
            <OrderTable 
              type="sell"
              orders={filteredSellOrders}
              matchingSellOrders={matchingSellOrders}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}