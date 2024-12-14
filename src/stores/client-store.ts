import { create } from 'zustand';

interface ClientState {
    asset: string | null;
    setAsset: (newAsset: string | null) => void;
}

export const useClientStore = create<ClientState>((set) => ({
    asset: null,
    setAsset: (newAsset) => set(() => ({ asset: newAsset }))
}));
