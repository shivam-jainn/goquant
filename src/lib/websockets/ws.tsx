import useWebSocket from 'react-use-websocket';

const socketUrl = process.env.BINANCE_WSS;


export const wsClient = () => {
  if(!socketUrl){
    return {
      sendMessage: () => {},
      sendJsonMessage: () => {},
      lastMessage: null,
      lastJsonMessage: null,
      readyState: -1,
      getWebSocket: () => null,
    };
  }

  const socket = useWebSocket(socketUrl, {
   onOpen: () => console.log('opened'),
   shouldReconnect: (closeEvent) => true,
  });

  return socket;

}
