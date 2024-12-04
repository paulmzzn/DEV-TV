const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupWebSocket } = require('./websocket/socket');
const db = require('./models/db');

// Initialisation
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const columnsRoutes = require('./routes/columns');
const cardsRoutes = require('./routes/cards');

app.use('/columns', columnsRoutes);
app.use('/cards', cardsRoutes);


// Connexion à MongoDB
db.connect();

// Gestion des WebSockets
setupWebSocket(server);

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});