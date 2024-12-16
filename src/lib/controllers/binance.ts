const basepath = process.env.NEXT_PUBLIC_BINANCE_REST_API;

export async function ListCoins():Promise<string[]> {
  const path = `/api/v3/exchangeInfo`;
  const url = basepath + path;
  // https://api.binance.com/api/v3/exchangeInfo?symbolStatus=trading&showPermissionSets=false&permissions=SPOT
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV === "development") console.log(data);

    const symbolsSet:Set<string> = new Set(
      data.symbols
        .filter((symbolObject: any) => symbolObject.symbol)
        .map((symbolObject: any) => symbolObject.symbol)
    );

    if (process.env.NODE_ENV === "development") console.log([...symbolsSet]);

    return [...symbolsSet];
  } catch (error) {
    console.error("Error fetching Binance coins:", error);
    return [];
  }
}


export async function FetchKLineHistoricalData(timerange:string) {
  const path = `/api/v3/klines`;
  const url = basepath + path;
  
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (process.env.NODE_ENV === "development") console.log(data);

    const symbolsSet:Set<string> = new Set(
      data.symbols
        .filter((symbolObject: any) => symbolObject.symbol)
        .map((symbolObject: any) => symbolObject.symbol)
    );

    if (process.env.NODE_ENV === "development") console.log([...symbolsSet]);

    return [...symbolsSet];
  } catch (error) {
    console.error("Error fetching Binance coins:", error);
    return [];
  }
}