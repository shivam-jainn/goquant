import { create } from 'zustand';

interface CounterState{
    count: number;
    addCount: () => void;
    remCount: () => void;
}

export const useCounterStore = create<CounterState>((set)=> ({
    count:0,
    addCount : () => set((state)=> ({count: state.count+1})),
    remCount : () => set((state)=> ({count: state.count-1}))   
}))