const WebSocket = require('ws');

let clients = [];

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    clients.push(ws);
    console.log('Client connected');

    ws.on('message', (message) => {
      console.log('Message received:', message);
      broadcast(message);
    });

    ws.on('close', () => {
      clients = clients.filter((client) => client !== ws);
      console.log('Client disconnected');
    });
  });

  const broadcast = (message) => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
};

module.exports = { setupWebSocket };