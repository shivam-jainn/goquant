"use client";
import { useState } from "react";
import { Input } from "../ui/input";

export default function QuantityPriceInput() {
    const [price, setPrice] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const product = (price || 0) * (quantity || 0);

    const formatNumber = (value: number) => value.toLocaleString("en-US", { minimumIntegerDigits: 3, useGrouping: false });

    return (
        <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex gap-4 items-center justify-center">
            <div className="grid w-full max-w-[12vw] items-center gap-1.5">
                <Input
                    type="number"
                    id="price"
                    placeholder="Price"
                    className="rounded-md text-center text-lg"
                    onChange={(e) => setPrice(Number(e.target.value) || null)}
                />
           
            </div>

            <div className="font-black text-lg text-gray-700">x</div>

            <div className="grid w-full max-w-[12vw] items-center gap-1.5">
                <Input
                    type="number"
                    id="quantity"
                    placeholder="Quantity"
                    className="rounded-md text-center text-lg"
                    onChange={(e) => setQuantity(Number(e.target.value) || null)}
                />
              
            </div>
            </div>

            <div>
            <div className="font-black text-3xl">
                <span className="tabular-nums">{formatNumber(product || 0)}</span>
            </div>
            </div>
        </div>
    );
}
