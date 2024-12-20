import { useOrderBookStore } from '@/stores/orderbook-store';
import { useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';

const WS_URL = process.env.NEXT_PUBLIC_SIMULATOR_WS_URL || 'ws://localhost:8080';

export const useSimulator = () => {
  const {
    updatePrice,
    createOrder,
    cancelOrder,
    updateOrder,
    setAsset
  } = useOrderBookStore();

  const {
    sendJsonMessage,
    lastJsonMessage,
    readyState
  } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established');
    },
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
    reconnectAttempts: 10
  });

  const handleWebSocketMessage = useCallback((message: any) => {
    if (!message?.type) return;

    switch (message.type) {
      case 'PRICE_UPDATE':
        updatePrice(message.symbol, message.price);
        break;

      case 'NEW_ORDER':
        createOrder(message.order);
        break;

      case 'CANCEL_ORDER':
        cancelOrder(message.orderId);
        break;

      case 'UPDATE_ORDER':
        updateOrder(message.orderId, message.updatedProps);
        break;

      default:
        console.warn('Unhandled WebSocket message type:', message.type);
    }
  }, [updatePrice, createOrder, cancelOrder, updateOrder]);

  useEffect(() => {
    if (lastJsonMessage) {
      handleWebSocketMessage(lastJsonMessage);
    }
  }, [lastJsonMessage, handleWebSocketMessage]);

  const sendAction = useCallback((action: string, data: any) => {
    if (readyState === WebSocket.OPEN) {
      sendJsonMessage({ action, data });
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [readyState, sendJsonMessage]);

  return {
    sendAction,
    readyState
  };
};