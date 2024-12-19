"use client";
import React from "react";
import { e_OrderStatus, useOrderBookStore } from "@/stores/orderbook-store";
import { DataTable } from "./DataTable";
import { columns } from "./columns";

export default function CurrentOrder() {
  const orderBookStore = useOrderBookStore();

  const mergedOrders = [...orderBookStore.buyOrders, ...orderBookStore.sellOrders];
  const pendingOrders = mergedOrders.filter((order) => order.orderStatus === e_OrderStatus.PENDING);
  const otherOrders = mergedOrders.filter((order) => order.orderStatus !== e_OrderStatus.PENDING);
  
  return (
    <div className="container mx-auto py-10 min-h-[80%]">
      <div className="flex flex-row space-x-4">
        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-2">Pending Orders</h2>
          <DataTable columns={columns} data={pendingOrders} />
        </div>

        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-2">Other Orders</h2>
          <DataTable columns={columns} data={otherOrders} />
        </div>
      </div>
    </div>
  );
}
