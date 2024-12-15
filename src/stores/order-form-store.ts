import { create } from 'zustand';

interface OrderFormState {
    expirationDate: Date | null;
    quantity: number;
    price: number;

    setExpirationDate: (newExpirationDate: Date | null) => void;
    setExpirationTime: (newTime: Date) => void;
    setDateAndTime: (newDate: Date) => void;
    setQuantity: (newQuantity: number) => void;
    setPrice: (newPrice: number) => void;
}

export const useOrderFormStore = create<OrderFormState>((set, get) => ({
    expirationDate: null,
    quantity: 0,
    price: 0,

    setExpirationDate: (newExpirationDate) =>
        set(() => ({ expirationDate: newExpirationDate })),

    setExpirationTime: (newTime) =>
        set(() => ({ expirationDate: newTime })),

    setDateAndTime: (newDate) =>
        set(() => ({ expirationDate: newDate })),

    setQuantity: (newQuantity) => 
        set(() => ({ quantity: newQuantity })),

    setPrice: (newPrice) =>
        set(() => ({ price: newPrice })),
}));
