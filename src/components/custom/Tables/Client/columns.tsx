"use client";

import { e_OrderSide, e_OrderStatus, e_OrderType } from "@/stores/orderbook-store";
import { ColumnDef } from "@tanstack/react-table";
import { OrderTrade } from "@/stores/orderbook-store";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Badge } from "@/components/ui/badge";

// Helper functions for label mapping
const getOrderStatusLabel = (status: e_OrderStatus): string => {
  switch (status) {
    case e_OrderStatus.PENDING:
      return "Pending";
    case e_OrderStatus.FULFILLED:
      return "Fulfilled";
    case e_OrderStatus.CANCELLED:
      return "Cancelled";
    default:
      return "Unknown";
  }
};

const getOrderTypeLabel = (type: e_OrderType): string => {
  switch (type) {
    case e_OrderType.LIMIT:
      return "Limit";
    case e_OrderType.MARKET:
      return "Market";
    default:
      return "Unknown";
  }
};

const getOrderSideLabel = (side: e_OrderSide): string => {
  switch (side) {
    case e_OrderSide.BUY:
      return "Buy";
    case e_OrderSide.SELL:
      return "Sell";
    default:
      return "Unknown";
  }
};

// Columns definition
export const columns: ColumnDef<OrderTrade>[] = [
  {
    accessorKey: "orderStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const status = getValue() as e_OrderStatus;
      return (
        <Badge
          className={`px-2 rounded-full ${status===e_OrderStatus.PENDING?"bg-orange-700/30 text-orange-400":status===e_OrderStatus.FULFILLED?"bg-green-700/30 text-green-400":"bg-red-700/30 text-red-400"}`}
        >
          {getOrderStatusLabel(status)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const orderStatusValue:number = row.getValue(id); 
      return value.includes(orderStatusValue.toString());
    },
  },
  {
    accessorKey: "orderSide",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BUY/SELL" />
    ),
    cell: ({ getValue }) => {
      const side = getValue() as e_OrderSide;
      return (
        <Badge
          className={`px-2 rounded-full ${side === e_OrderSide.BUY ? "bg-green-700/30 text-green-400" : side === e_OrderSide.SELL ? "bg-red-700/30 text-red-400" : "bg-gray-700/30 text-gray-400"}`}
        >
          {getOrderSideLabel(side)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const orderSideValue: number = row.getValue(id);
      return value.includes(orderSideValue.toString());
    },
  },  
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ getValue }) => `$${getValue()}`, // Format as currency
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
  },
  {
    accessorKey: "orderExpiry",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Expiry" />
    ),
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleString(); // Format date
    },
  },
  {
    accessorKey: "orderType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Type" />
    ),
    cell: ({ getValue }) => {
      const orderType = getValue() as e_OrderType;
      return (
        <span>
          {getOrderTypeLabel(orderType)}
        </span>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
