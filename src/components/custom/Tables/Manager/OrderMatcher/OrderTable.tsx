import React from 'react';
import { Badge } from "@/components/ui/badge";
import OrderCard from './OrderCard';
import { OrderTrade } from '@/stores/orderbook-store';

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
}:OrderTableProps){
  const title = type === 'buy' ? 'Buy Orders' : 'Sell Orders';
  const titleColor = type === 'buy' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
        <Badge variant="outline" className={titleColor}>
          {orders.length} Orders
        </Badge>
      </div>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full table-auto text-sm">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="p-4 text-left font-medium">Symbol</th>
              <th className="p-4 text-left font-medium">Total</th>
              <th className="p-4 text-left font-medium">Price</th>
              <th className="p-4 text-left font-medium">Quantity</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  type={type}
                  matchingSellOrders={matchingSellOrders}
                  onOrderHover={type === 'buy' ? onOrderHover : undefined}
                />
              ))
            ) : (
              <tr>
                <td colSpan={type === 'buy' ? 5 : 4} className="p-8 text-center text-zinc-400">
                  No {type} orders available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
