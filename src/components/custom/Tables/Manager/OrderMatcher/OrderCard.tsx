import React, { useCallback, useEffect, useMemo } from 'react';
import { cn } from "@/lib/utils";
import EditOrderModal from '../../../Modals/EditOrderModal';
import MatchModal from '../../../Modals/MatchModal';
import { OrderTrade, useOrderBookStore } from '@/stores/orderbook-store';
import OrderActions from './OrderActions';

interface OrderCardProps {
    order: OrderTrade;
    type: 'buy' | 'sell';
    matchingSellOrders: OrderTrade[];
    onOrderHover?: (order: OrderTrade | null) => void;
}
  
export default function OrderCard ({ order, type, matchingSellOrders, onOrderHover }:OrderCardProps) {
  const { cancelOrder } = useOrderBookStore();
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showMatchModal, setShowMatchModal] = React.useState(false);

  const closeModals = useCallback(() => {
    setShowEditModal(false);
    setShowMatchModal(false);
    onOrderHover?.(null);
  }, [onOrderHover]);

  useEffect(() => {
    return () => closeModals();
  }, [closeModals]);

  const isMatching = useMemo(() => {
    return matchingSellOrders?.some(match => match.orderId === order?.orderId);
  }, [matchingSellOrders, order?.orderId]);

  if (!order) return null;

  return (
    <tr
      className={cn(
        "transition-colors duration-200 group",
        type === 'buy' ? 'hover:bg-zinc-700/50' : '',
        type === 'sell' && isMatching ? 'bg-blue-500/20 hover:bg-blue-500/30' : 'hover:bg-zinc-700/50'
      )}
      onMouseEnter={() => type === 'buy' && onOrderHover?.(order)}
      onMouseLeave={() => type === 'buy' && onOrderHover?.(null)}
    >
      <td className="p-4">{order.symbol}</td>
      <td className="p-4">${(order.price * order.qty).toFixed(2)}</td>
      <td className="p-4">${order.price}</td>
      <td className="p-4">{order.qty}</td>
        <td className="p-4">
          <OrderActions
            onEdit={() => setShowEditModal(true)}
            onMatch={() => setShowMatchModal(true)}
            onCancel={() => {
                cancelOrder(order.orderId);
              onOrderHover?.(null);
            }}
            type={type}
          />
          <EditOrderModal
            open={showEditModal}
            order={order}
            onClose={closeModals}
            />
            {type === 'buy' && (
          <MatchModal
            open={showMatchModal}
            buyOrder={order}
            matchingSellOrders={matchingSellOrders}
            onClose={closeModals}
          />
        )}
        </td>
    </tr>
  );
};