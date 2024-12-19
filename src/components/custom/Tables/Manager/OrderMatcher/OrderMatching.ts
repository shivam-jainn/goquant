import { e_OrderStatus } from "@/stores/orderbook-store";

export const findMatchingSellOrders = (buyOrder, sellOrders) => {
    if (!buyOrder || !sellOrders) return [];
  
    const MAX_PRICE_DIFF_WEIGHT = 0.6;
    const MAX_QTY_DIFF_WEIGHT = 0.4;
  
    return sellOrders
      .filter(sell => sell.orderStatus !== e_OrderStatus.CANCELLED)
      .map(sell => {
        const priceDiffPercent = Math.abs((sell.price - buyOrder.price) / buyOrder.price);
        const qtyDiffPercent = Math.abs((sell.qty - buyOrder.qty) / buyOrder.qty);
  
        const matchScore = (priceDiffPercent * MAX_PRICE_DIFF_WEIGHT) +
          (qtyDiffPercent * MAX_QTY_DIFF_WEIGHT);
  
        return {
          ...sell,
          matchScore,
          priceDiff: sell.price - buyOrder.price,
          qtyDiff: sell.qty - buyOrder.qty,
          matchPercentage: ((1 - matchScore) * 100).toFixed(1)
        };
      })
      .filter(sell => sell.matchPercentage > 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);
  };