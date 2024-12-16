import OrderForm from "@/components/custom/OrderForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Page() {
  return (
    
<ResizablePanelGroup direction="vertical" className="h-screen overflow-y-auto p-8 gap-4">
<ResizablePanelGroup direction="horizontal" className="w-full h-screen/2 p-2">
    <ResizablePanel className="p-2" defaultSize={70}>1</ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel className="p-2" defaultSize={30} maxSize={30} minSize={25}>
      <OrderForm />
    </ResizablePanel>
</ResizablePanelGroup>
<ResizablePanelGroup direction="horizontal" className="w-full h-screen/2 p-2">
    <ResizablePanel className="p-2" defaultSize={50} maxSize={55} minSize={45}>3</ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel  defaultSize={50} maxSize={55} minSize={45}>4</ResizablePanel>
</ResizablePanelGroup>
</ResizablePanelGroup>
    
  );
}