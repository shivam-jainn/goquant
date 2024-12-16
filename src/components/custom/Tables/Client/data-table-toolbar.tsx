"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

import { e_OrderSide, e_OrderStatus } from "@/stores/orderbook-store";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

const orderStatuses = [
    { value: e_OrderStatus.PENDING.toString(), label: "Pending" },
    { value: e_OrderStatus.FULFILLED.toString(), label: "Fulfilled" },
    { value: e_OrderStatus.CANCELLED.toString(), label: "Cancelled" },
  ];
  
  const orderSides = [
    { value: e_OrderSide.BUY.toString(), label: "Buy" },
    { value: e_OrderSide.SELL.toString(), label: "Sell" },
  ];
  
export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">

        <Input
          placeholder="Filter by symbol..."
          value={(table.getColumn("symbol")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("symbol")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn("orderStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("orderStatus")}
            title="Status"
            options={orderStatuses}
          />
        )}

        {table.getColumn("orderSide") && (
          <DataTableFacetedFilter
            column={table.getColumn("orderSide")}
            title="Side"
            options={orderSides}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  );
}
