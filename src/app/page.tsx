"use client";
import OrderForm from "@/components/custom/OrderForm";
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import CurrentOrder from "@/components/custom/Tables/Client/CurrentOrder";
import { e_OrderBookAccountType, useOrderBookStore } from "@/stores/orderbook-store";

export default function Page() {
  const orderBookState = useOrderBookStore();

  return (
    <>
      {orderBookState.role === e_OrderBookAccountType.accmgr ? (
        <div className="flex items-center justify-center h-full text-xl font-bold">
          hi
        </div>
      ) : (
        <>
          <ResizablePanelGroup direction="horizontal" className="w-full h-screen/2 p-2">
            <ResizablePanel className="p-2" defaultSize={70}>
              1
            </ResizablePanel>
            <ResizablePanel className="p-2" defaultSize={30} maxSize={30} minSize={25}>
              <OrderForm />
            </ResizablePanel>
          </ResizablePanelGroup>
          <CurrentOrder />
        </>
      )}
    </>
  );
}
