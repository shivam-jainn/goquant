"use client";
import React from 'react'
import { useOrderBookStore } from '@/stores/orderbook-store'
import { DataTable } from './DataTable';
import {columns} from './columns';
export default function CurrentOrder() {
  const orderBookStore = useOrderBookStore();
  const data = orderBookStore.orders;

  // if(process.env.NODE_ENV==="development") console.log(data)
  return (
    <div className="container mx-auto py-10">
    <DataTable columns={columns} data={data} />
  </div>
  )
}
