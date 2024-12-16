"use client";
import { Input } from "@/components/ui/input";
import { useOrderFormStore } from "@/stores/order-form-store";

export default function QuantityPriceInput() {
    const orderFormState = useOrderFormStore();

    const price = orderFormState.price;
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

    return (
        <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex gap-4 items-center justify-center">
                <div className="grid w-full max-w-[12vw] items-center gap-1.5">
                    <Input
                        type="number"
                        id="price"
                        placeholder="Price"
                        className="rounded-md text-center text-lg"
                        onChange={(e) => orderFormState.setPrice(Number(e.target.value))}
                    />
                </div>

                <div className="font-black text-lg text-gray-700">x</div>

                <div className="grid w-full max-w-[12vw] items-center gap-1.5">
                    <Input
                        type="number"
                        id="quantity"
                        placeholder="Quantity"
                        className="rounded-md text-center text-lg"
                        onChange={(e) => orderFormState.setQuantity(Number(e.target.value))}
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
    );
}
