import OrderForm from "@/components/custom/OrderForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import CurrentOrder from "@/components/custom/Tables/Client/CurrentOrder";

export default function Page() {
  return (
    <>    
<ResizablePanelGroup direction="horizontal" className="w-full h-screen/2 p-2">
    <ResizablePanel className="p-2" defaultSize={70}>1</ResizablePanel>
    <ResizablePanel className="p-2" defaultSize={30} maxSize={30} minSize={25}>
      <OrderForm />
    </ResizablePanel>
</ResizablePanelGroup>
<CurrentOrder />
    </>
    
  );
}