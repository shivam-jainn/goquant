"use client";
import { useEffect, useState } from "react";
import OrderForm from "@/components/custom/OrderForm";
import CurrentOrder from "@/components/custom/Tables/Client/CurrentOrder";
import { e_OrderBookAccountType, useOrderBookStore } from "@/stores/orderbook-store";
import OrderMatcher from "@/components/custom/Tables/Manager/OrderMatcher/OrderMatcher";
import { Card } from "@/components/ui/card";
import CandlestickChart from "./Charts/CandleStickChart";

export default function UserProvider() {
  const orderBookState = useOrderBookStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="text-white min-h-screen p-4">
      {orderBookState.role === e_OrderBookAccountType.accmgr ? (
        <div className="flex flex-col gap-4">
          <Card className="bg-zinc-800">
            <OrderMatcher />
          </Card>
          <Card className="bg-zinc-800">
            <CurrentOrder />
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-row gap-4">

            <Card className="bg-zinc-800 basis-3/4">
              <CandlestickChart />
            </Card>

            <Card className="bg-zinc-800 basis-1/4">

              <OrderForm />
            </Card>

          </div>

          <Card className="bg-zinc-800">
            <CurrentOrder />
          </Card>
        </div>
      )}
    </div>
  );
}