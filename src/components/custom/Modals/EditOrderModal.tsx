import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useOrderBookStore } from '@/stores/orderbook-store';

interface EditOrderModalProps {
  open: boolean;
  order: any;
  onClose: () => void;
}

export default function EditOrderModal({ open, order, onClose }:EditOrderModalProps){
  const { updateOrder } = useOrderBookStore();
  const [price, setPrice] = React.useState(order?.price || 0);
  const [qty, setQty] = React.useState(order?.qty || 0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (order) {
      setPrice(order.price);
      setQty(order.qty);
      setErrors({});
    }
  }, [order]);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (price <= 0) newErrors.price = "Price must be greater than 0";
    if (qty <= 0) newErrors.qty = "Quantity must be greater than 0";

    if (Object.keys(newErrors).length === 0) {
      updateOrder(order.orderId, { price, qty });
      onClose();
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order {order?.orderId}</DialogTitle>
          <DialogDescription>
            Modify the order details below
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <div className="col-span-3">
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={cn(errors.price && "border-red-500")}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">Quantity</Label>
            <div className="col-span-3">
              <Input
                id="qty"
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className={cn(errors.qty && "border-red-500")}
              />
              {errors.qty && (
                <p className="text-red-500 text-sm mt-1">{errors.qty}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
