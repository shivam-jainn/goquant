import React, { useMemo, useCallback, memo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderTrade, useOrderBookStore, e_OrderStatus } from '@/stores/orderbook-store';
import EditOrderModal from '@/components/custom/Modals/EditOrderModal';
import MatchModal from '@/components/custom/Modals/MatchModal';

interface OrderActionsProps {
  onEdit: () => void;
  onMatch: () => void;
  onCancel: () => void;
  type: 'buy' | 'sell';
}

const OrderActions = memo(({ onEdit, onMatch, onCancel, type }: OrderActionsProps) => (
  <div className="flex justify-end gap-1">
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 rounded-full hover:bg-blue-500/20 hover:text-blue-400"
      onClick={onEdit}
    >
      <Edit size={14} />
    </Button>
    
    {type === 'buy' && (
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-full hover:bg-green-500/20 hover:text-green-400"
        onClick={onMatch}
      >
        <ExternalLink size={14} />
      </Button>
    )}
    
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-400"
      onClick={onCancel}
    >
      <X size={14} />
    </Button>
  </div>
));

interface OrderRowProps {
  order: OrderTrade;
  type: 'buy' | 'sell';
  isMatching: boolean;
  matchingSellOrders: OrderTrade[];
  matchPercentage?: number;
  onOrderHover?: (order: OrderTrade | null) => void;
  style?: React.CSSProperties;
}

const OrderRow = memo(function OrderRow({
  order,
  type,
  isMatching,
  matchingSellOrders,
  matchPercentage,
  onOrderHover,
  style
}: OrderRowProps) {
  const { cancelOrder } = useOrderBookStore();
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showMatchModal, setShowMatchModal] = React.useState(false);

  const closeModals = useCallback(() => {
    setShowEditModal(false);
    setShowMatchModal(false);
    onOrderHover?.(null);
  }, [onOrderHover]);

  const handleMouseEnter = useCallback(() => {
    if (type === 'buy') {
      onOrderHover?.(order);
    }
  }, [type, order, onOrderHover]);

  const handleMouseLeave = useCallback(() => {
    if (type === 'buy') {
      onOrderHover?.(null);
    }
  }, [type, onOrderHover]);

  const getMatchingClass = useCallback(() => {
    if (!isMatching) return '';
    
    if (matchPercentage !== undefined) {
      if (matchPercentage >= 90) return 'bg-blue-900/50';
      if (matchPercentage >= 70) return 'bg-blue-900/40';
      if (matchPercentage >= 50) return 'bg-blue-900/30';
      return 'bg-blue-900/20';
    }
    return '';
  }, [isMatching, matchPercentage]);

  return (
    <div
      style={style}
      className={cn(
        "grid grid-cols-5 w-full h-12 items-center",
        type === 'buy' ? 'hover:bg-zinc-800' : 'hover:bg-blue-900/20',
        getMatchingClass(),
        "border-b border-zinc-800/50"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="px-4 text-sm">{order.symbol}</div>
      <div className="px-4 text-sm tabular-nums">${(order.price * order.qty).toFixed(2)}</div>
      <div className="px-4 text-sm tabular-nums">${order.price.toFixed(2)}</div>
      <div className="px-4 text-sm tabular-nums">{order.qty.toFixed(4)}</div>
      <div className="px-4">
        <OrderActions
          onEdit={() => setShowEditModal(true)}
          onMatch={() => setShowMatchModal(true)}
          onCancel={() => cancelOrder(order.orderId)}
          type={type}
        />
      </div>

      {showEditModal && (
        <EditOrderModal
          open={showEditModal}
          order={order}
          onClose={closeModals}
        />
      )}
      {showMatchModal && type === 'buy' && (
        <MatchModal
          open={showMatchModal}
          buyOrder={order}
          matchingSellOrders={matchingSellOrders}
          onClose={closeModals}
        />
      )}
    </div>
  );
});
interface OrderTableProps {
  type: 'buy' | 'sell';
  orders: OrderTrade[];
  matchingSellOrders: OrderTrade[];
  matchingPercentages?: Map<string, number>;
  onOrderHover?: (order: OrderTrade | null) => void;
  scrollToIndex?: number;
}

const OrderTable = memo(function OrderTable({
  type,
  orders,
  matchingSellOrders,
  matchingPercentages,
  onOrderHover,
  scrollToIndex
}: OrderTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5
  });

  useEffect(() => {
    if (scrollToIndex !== undefined && scrollToIndex >= 0) {
      virtualizer.scrollToIndex(scrollToIndex, { align: 'center' });
    }
  }, [scrollToIndex, virtualizer]);

  const matchingOrdersMap = useMemo(() => 
    new Set(matchingSellOrders.map(order => order.orderId)),
    [matchingSellOrders]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-zinc-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 h-14 bg-zinc-900">
        <h3 className={cn(
          "font-semibold text-sm",
          type === 'buy' ? 'text-green-400' : 'text-red-400'
        )}>
          {type === 'buy' ? 'Buy Orders' : 'Sell Orders'}
        </h3>
        <Badge 
          variant="outline" 
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-normal",
            type === 'buy' ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'
          )}
        >
          {orders.length}
        </Badge>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <OrderRow
              key={orders[virtualRow.index].orderId}
              order={orders[virtualRow.index]}
              type={type}
              matchingSellOrders={matchingSellOrders}
              isMatching={matchingOrdersMap.has(orders[virtualRow.index].orderId)}
              matchPercentage={matchingPercentages?.get(orders[virtualRow.index].orderId)}
              onOrderHover={onOrderHover}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default function OrderMatcher() {
  const orderBookStore = useOrderBookStore();
  const [matchingSellOrders, setMatchingSellOrders] = React.useState<OrderTrade[]>([]);
  const [matchingPercentages, setMatchingPercentages] = React.useState<Map<string, number>>(new Map());
  const [scrollToIndex, setScrollToIndex] = React.useState<number | undefined>(undefined);

  const { buyOrders, sellOrders } = useMemo(() => {
    return {
      buyOrders: orderBookStore.buyOrders
        .filter(order => 
          order.symbol === orderBookStore.asset && 
          order.orderStatus !== e_OrderStatus.CANCELLED && 
          order.orderStatus !== e_OrderStatus.FULFILLED
        )
        .sort((a, b) => b.price - a.price),
      
      sellOrders: orderBookStore.sellOrders
        .filter(order => 
          order.symbol === orderBookStore.asset && 
          order.orderStatus !== e_OrderStatus.CANCELLED && 
          order.orderStatus !== e_OrderStatus.FULFILLED
        )
        .sort((a, b) => a.price - b.price)
    };
  }, [orderBookStore.buyOrders, orderBookStore.sellOrders, orderBookStore.asset]);

  const handleOrderHover = useCallback((order: OrderTrade | null) => {
    if (!order) {
      setMatchingSellOrders([]);
      setMatchingPercentages(new Map());
      setScrollToIndex(undefined);
      return;
    }

    const matches = sellOrders
      .map(sellOrder => {
        const priceDiff = Math.abs((sellOrder.price - order.price) / order.price);
        const qtyDiff = Math.abs((sellOrder.qty - order.qty) / order.qty);
        const matchPercentage = 100 - ((priceDiff + qtyDiff) / 2 * 100);
        
        return {
          order: sellOrder,
          matchPercentage: Math.max(0, Math.min(100, matchPercentage))
        };
      })
      .filter(match => match.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);

    const percentages = new Map();
    matches.forEach(match => {
      percentages.set(match.order.orderId, match.matchPercentage);
    });

    setMatchingSellOrders(matches.map(m => m.order));
    setMatchingPercentages(percentages);

    // Find and set scroll index for best match
    if (matches.length > 0) {
      const bestMatchIndex = sellOrders.findIndex(order => 
        order.orderId === matches[0].order.orderId
      );
      setScrollToIndex(bestMatchIndex);
    }
  }, [sellOrders]);

  return (
    <div className="grid grid-cols-2 gap-6 p-6 h-full">
      <OrderTable 
        type="buy"
        orders={buyOrders}
        matchingSellOrders={matchingSellOrders}
        onOrderHover={handleOrderHover}
      />
      <OrderTable 
        type="sell"
        orders={sellOrders}
        matchingSellOrders={matchingSellOrders}
        matchingPercentages={matchingPercentages}
        scrollToIndex={scrollToIndex}
      />
    </div>
  );
}