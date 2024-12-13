"use client";
import { useCounterStore } from "@/stores/counter-store";

export default function Page() {

  const {count,addCount,remCount} = useCounterStore((state) => state);

  return (
    <main>
      <h1>Counter</h1>
      <div>{count}</div>
      <button onClick={addCount}>Increase</button>
      <button onClick={remCount}>Decrease</button>
    </main>
  );
}