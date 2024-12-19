import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { e_OrderStatus, useOrderBookStore } from '@/stores/orderbook-store';

const OrderAdjustmentStep = ({ buyOrder, sellOrder, onAdjustmentSelect, onBack }) => {
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  
  const hasDifferences = buyOrder.price !== sellOrder.price || buyOrder.qty !== sellOrder.qty;
  
  const buyAdjustment = {
    price: sellOrder.price,
    qty: sellOrder.qty,
    total: sellOrder.price * sellOrder.qty
  };
  
  const sellAdjustment = {
    price: buyOrder.price,
    qty: buyOrder.qty,
    total: buyOrder.price * buyOrder.qty
  };

  const handleSelect = (type) => {
    setSelectedAdjustment(type);
    onAdjustmentSelect(type === 'buy' ? buyAdjustment : sellAdjustment);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-zinc-400">
        There are differences in the order details. Please select which order to adjust:
      </div>
      
      <div className="grid gap-4">
        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            "border-zinc-700 hover:border-blue-500",
            selectedAdjustment === 'buy' && "border-blue-500 bg-blue-500/10"
          )}
          onClick={() => handleSelect('buy')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Adjust Buy Order</h3>
            <Badge variant="outline">Buy Side</Badge>
          </div>
          
          <div className="space-y-2">
            {buyOrder.price !== sellOrder.price && (
              <div className="flex items-center">
                <span className="text-zinc-400 w-20">Price:</span>
                <span className="font-medium">
                  ${buyOrder.price} {' → '} 
                  <span className="text-blue-400">${sellOrder.price}</span>
                </span>
              </div>
            )}
            
            {buyOrder.qty !== sellOrder.qty && (
              <div className="flex items-center">
                <span className="text-zinc-400 w-20">Quantity:</span>
                <span className="font-medium">
                  {buyOrder.qty} {' → '} 
                  <span className="text-blue-400">{sellOrder.qty}</span>
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card
          className={cn(
            "p-4 cursor-pointer transition-all",
            "border-zinc-700 hover:border-blue-500",
            selectedAdjustment === 'sell' && "border-blue-500 bg-blue-500/10"
          )}
          onClick={() => handleSelect('sell')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Adjust Sell Order</h3>
            <Badge variant="outline">Sell Side</Badge>
          </div>
          
          <div className="space-y-2">
            {buyOrder.price !== sellOrder.price && (
              <div className="flex items-center">
                <span className="text-zinc-400 w-20">Price:</span>
                <span className="font-medium">
                  ${sellOrder.price} {' → '} 
                  <span className="text-blue-400">${buyOrder.price}</span>
                </span>
              </div>
            )}
            
            {buyOrder.qty !== sellOrder.qty && (
              <div className="flex items-center">
                <span className="text-zinc-400 w-20">Quantity:</span>
                <span className="font-medium">
                  {sellOrder.qty} {' → '} 
                  <span className="text-blue-400">{buyOrder.qty}</span>
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Selection
        </Button>
      </div>
    </div>
  );
};

const MatchModal = ({ open, buyOrder, matchingSellOrders, onClose }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');
  const [adjustedValues, setAdjustedValues] = useState(null);
  const { updateOrder } = useOrderBookStore();

  useEffect(() => {
    if (!buyOrder) {
      setSelectedOrder(null);
      setCurrentStep('select');
      setAdjustedValues(null);
    }
  }, [buyOrder]);

  const handleOrderSelect = (sellOrder) => {
    if (!sellOrder || !buyOrder) return;
    setSelectedOrder(sellOrder);
    
    if (sellOrder.price !== buyOrder.price || sellOrder.qty !== buyOrder.qty) {
      setCurrentStep('adjust');
    }
  };

  const handleAdjustmentSelect = (adjustment) => {
    setAdjustedValues(adjustment);
  };

  const handleConfirmMatch = () => {
    if (selectedOrder && buyOrder) {
      console.log(selectedOrder);
      console.log(buyOrder);
      console.log(adjustedValues);
      const buyOrderUpdate = adjustedValues ? 
        { 
          orderStatus: e_OrderStatus.FULFILLED,
          price: adjustedValues.price,
          qty: adjustedValues.qty
        } : 
        { orderStatus: e_OrderStatus.FULFILLED };
      
      updateOrder(buyOrder.orderId, buyOrderUpdate);
      updateOrder(selectedOrder.orderId, { orderStatus: e_OrderStatus.FULFILLED });
      
      onClose();
    }
  };

  const isPerfectMatch = selectedOrder && 
    buyOrder.price === selectedOrder.price && 
    buyOrder.qty === selectedOrder.qty;

  if (!buyOrder || !matchingSellOrders?.length) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Match Orders</DialogTitle>
          <DialogDescription>
            {currentStep === 'select' ? 
              'Select a matching sell order to settle the trade' :
              'Adjust order details to complete the match'
            }
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'select' ? (
          <div className="space-y-6">
            <Card className="p-4 bg-zinc-800/50 border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Buy Order Details</h3>
                <Badge variant="outline">{buyOrder.orderId}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Price:</span>
                  <span className="ml-2 font-medium">${buyOrder.price}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Quantity:</span>
                  <span className="ml-2 font-medium">{buyOrder.qty}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Total:</span>
                  <span className="ml-2 font-medium">
                    ${(buyOrder.price * buyOrder.qty).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-zinc-400">Best Matches</h4>
              <div className="grid gap-4">
                {matchingSellOrders.map((sellOrder) => (
                  <Card
                    key={sellOrder.orderId}
                    className={cn(
                      "p-4 cursor-pointer transition-all",
                      "border-zinc-700 hover:border-blue-500",
                      selectedOrder?.orderId === sellOrder.orderId && "border-blue-500 bg-blue-500/10"
                    )}
                    onClick={() => handleOrderSelect(sellOrder)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          sellOrder.matchPercentage >= 90 ? "bg-green-500/20 text-green-400" :
                            sellOrder.matchPercentage >= 70 ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                        )}
                      >
                        {sellOrder.matchPercentage}% Match
                      </Badge>
                      <span className="text-xs text-zinc-400">ID: {sellOrder.orderId}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-400">Price:</span>
                        <span className={cn(
                          "ml-2 font-medium",
                          sellOrder.priceDiff > 0 ? "text-red-400" :
                            sellOrder.priceDiff < 0 ? "text-green-400" : "text-white"
                        )}>
                          ${sellOrder.price}
                          {sellOrder.priceDiff !== 0 && (
                            <span className="text-xs ml-1">
                              ({sellOrder.priceDiff > 0 ? '+' : ''}{sellOrder.priceDiff})
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Qty:</span>
                        <span className={cn(
                          "ml-2 font-medium",
                          sellOrder.qtyDiff > 0 ? "text-red-400" :
                            sellOrder.qtyDiff < 0 ? "text-green-400" : "text-white"
                        )}>
                          {sellOrder.qty}
                          {sellOrder.qtyDiff !== 0 && (
                            <span className="text-xs ml-1">
                              ({sellOrder.qtyDiff > 0 ? '+' : ''}{sellOrder.qtyDiff})
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Total:</span>
                        <span className="ml-2 font-medium">
                          ${(sellOrder.price * sellOrder.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>

              {selectedOrder && (
                <Button
                  onClick={isPerfectMatch ? handleConfirmMatch : () => handleOrderSelect(selectedOrder)}
                  className={cn(
                    "flex items-center gap-2",
                    isPerfectMatch ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600",
                    "transition-all"
                  )}
                >
                  {isPerfectMatch ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Match</span>
                    </>
                  ) : (
                    <>
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <OrderAdjustmentStep
              buyOrder={buyOrder}
              sellOrder={selectedOrder}
              onAdjustmentSelect={handleAdjustmentSelect}
              onBack={() => {
                setCurrentStep('select');
                setAdjustedValues(null);
              }}
            />

            {adjustedValues && (
              <div className="flex justify-between items-center border-t border-zinc-800 mt-6 pt-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmMatch}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Match</span>
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;