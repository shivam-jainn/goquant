"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useOrderFormStore } from "@/stores/order-form-store";
import { useOrderBookStore } from "@/stores/orderbook-store";

export default function QuantityPriceInput() {
    const orderFormState = useOrderFormStore();
    const orderBookState = useOrderBookStore();

    const asset = orderBookState.asset;
    const price = orderFormState.price;
    const [isRealTimePrice, setIsRealTimePrice] = useState<boolean>(true);
    const [isPriceFrozen, setIsPriceFrozen] = useState<boolean>(false);
    const quantity = orderFormState.quantity;

    const product = (price || 0) * (quantity || 0);

    const formatNumber = (value: number) => {
        const formatted = value.toLocaleString("en-US", {
            minimumIntegerDigits: 6,
            useGrouping: false,
        });

        const leadingZeros = formatted.match(/^0+/)?.[0] || "";
        const restOfNumber = formatted.slice(leadingZeros.length);

        return { leadingZeros, restOfNumber };
    };

    const { leadingZeros, restOfNumber } = formatNumber(product || 0);

    useEffect(() => {
        if (isRealTimePrice && asset) {
            const unsubscribe = orderBookState.connectWebSocket(asset);

            const interval = setInterval(() => {
                if (!isPriceFrozen) {
                    orderFormState.setPrice(orderBookState.prices[asset] || 0);
                }
            }, 500);

            return () => {
                clearInterval(interval);
                unsubscribe();
            };
        }
    }, [asset, isRealTimePrice, isPriceFrozen, orderBookState]);

    const handleQuantityChange = (value: number) => {
        orderFormState.setQuantity(value);
        setIsPriceFrozen(true);
    };

    return (
        <>
        <div>
            <div className="flex gap-4">
                <label htmlFor="market-price" className="font-medium">
                    Market Price
                </label>
                <Switch
                    id="market-price"
                    checked={isRealTimePrice}
                    onCheckedChange={(checked) => {
                        setIsRealTimePrice(checked);
                        if (!checked) {
                            setIsPriceFrozen(false);
                        }
                    }}
                />
            </div>
        </div>
        <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex gap-4 items-center justify-center">
                <div className="grid w-full max-w-[12vw] items-center gap-1.5">
                    <Input
                        type="number"
                        id="price"
                        placeholder="Price"
                        className="rounded-md text-center text-lg"
                        value={price}
                        onChange={(e) => !isRealTimePrice && orderFormState.setPrice(Number(e.target.value))}
                        readOnly={isRealTimePrice}
                    />
                </div>

                <div className="font-black text-lg text-gray-700">x</div>

                <div className="grid w-full max-w-[12vw] items-center gap-1.5">
                    <Input
                        type="number"
                        id="quantity"
                        placeholder="Quantity"
                        className="rounded-md text-center text-lg"
                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    />
                </div>
            </div>

            <div>
                <div className="font-black text-3xl tabular-nums">
                    <span className="text-white/20">{leadingZeros}</span>
                    <span>{restOfNumber}</span>
                </div>
            </div>
        </div>
        </>
    );
}
