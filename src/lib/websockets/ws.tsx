import useWebSocket from 'react-use-websocket';

const socketUrl = 'wss://echo.websocket.org';

export const wsClient = () => {
  const socket = useWebSocket(socketUrl, {
   onOpen: () => console.log('opened'),
   shouldReconnect: (closeEvent) => true,
  });

  return socket;

}
