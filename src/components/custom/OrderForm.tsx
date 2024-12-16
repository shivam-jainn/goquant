"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuantityPriceInput from "./QuantityPrice";
import { ExpirationDate } from "./ExpirationDate";
import { z } from "zod";
import { useOrderFormStore } from "@/stores/order-form-store";
import { toast } from "sonner";
import { e_OrderSide, e_OrderStatus, e_OrderType, useOrderBookStore } from "@/stores/orderbook-store";
import { v4 as uuidv4 } from 'uuid';

export default function OrderForm() {
  const [isBuy, setIsBuy] = useState(false);
  const orderFormState = useOrderFormStore();
  const orderBookState = useOrderBookStore();

  const orderFormSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    symbol: z.string().nonempty("Symbol is required"),
    orderSide: z.nativeEnum(e_OrderSide),
    orderType: z.nativeEnum(e_OrderType),
    orderStatus: z.nativeEnum(e_OrderStatus),
    price: z.number().positive("Price must be a positive number"),
    qty: z.number()
      .min(1, "Quantity must be at least 1")
      .max(100, "Quantity must not exceed 100"),
    orderListId: z.number().int(),
    orderExpiry: z.date().refine((date) => date > new Date(), {
      message: "Expiration date must be in the future",
    }),
    timeInForce: z.string().nonempty(),
    timestamp: z.string().nonempty("Timestamp is required"),
    signature: z.string().nonempty("Signature is required"),
    apiKey: z.string().nonempty("API Key is required"),
  });

  function handleFormSubmission() {
    const SIDE = isBuy ? e_OrderSide.BUY : e_OrderSide.SELL;

    const requestBody = {
      id: uuidv4(),
      orderId: uuidv4(),
      symbol: "AAPL",
      orderSide: SIDE,
      orderType: e_OrderType.MARKET,
      orderStatus: e_OrderStatus.PENDING,
      price: orderFormState.price,
      qty: orderFormState.quantity,
      orderListId: -1, // recommended by Binance
      orderExpiry: orderFormState.expirationDate,
      timeInForce: "GTC",
      timestamp: Date.now().toString(),
      signature: "a-signature-string",
      apiKey: process.env.BINANCE_API_KEY ?? "an-api-key",
    };

    const validation = orderFormSchema.safeParse(requestBody);

    if (!validation.success) {
      toast.error(
        validation.error.issues.map((issue) => issue.message).join(", ")
      );
      return;
    }

    orderBookState.createOrder(requestBody);
    toast.success("Order created successfully!");
  }

  return (
    <Card className=" p-4 shadow-lg border rounded-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <p className="text-xl font-medium">
            {isBuy ? "Buy Order" : "Sell Order"}
          </p>
          <CustomSwitch isBuy={isBuy} onToggle={() => setIsBuy(!isBuy)} />
        </CardTitle>
        <CardDescription className="text-gray-500">
          Place your {isBuy ? "Buy" : "Sell"} order here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <QuantityPriceInput />
        <ExpirationDate />
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full py-2 rounded-md text-lg ${
            isBuy
              ? "bg-green-600 hover:bg-green-500"
              : "bg-red-600 hover:bg-red-500"
          }`}
          onClick={handleFormSubmission}
        >
          {isBuy ? "Buy" : "Sell"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function CustomSwitch({
  isBuy,
  onToggle,
}: {
  isBuy: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`relative flex h-8 w-24 cursor-pointer items-center rounded-full bg-gray-200 transition-colors duration-300 ${
        isBuy ? "bg-green-500" : "bg-red-500"
      }`}
      onClick={onToggle}
    >
      <div
        className={`absolute top-0 bottom-0 left-0 right-0 rounded-full ${
          isBuy ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>

      <div
        className={`absolute z-10 h-6 w-8 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          isBuy ? "translate-x-14" : "translate-x-3"
        }`}
      ></div>

      <div className="absolute z-10 flex gap-3 w-full justify-between px-3 text-xs font-bold text-white uppercase">
        <span className={isBuy ? "opacity-50" : "opacity-100"}>Sell</span>
        <span className={isBuy ? "opacity-100" : "opacity-50"}>Buy</span>
      </div>
    </div>
  );
}
