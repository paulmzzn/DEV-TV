const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupWebSocket } = require('./websocket/socket');
const db = require('./models/db');
const basicAuth = require('basic-auth');
const dotenv = require('dotenv');
const ip = require('ip');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Récupérer la liste des adresses IP/Plages IP autorisées
const allowedIPRanges = process.env.ALLOWED_IPS.split(',');

const isAllowedIP = (clientIP) => {
  // Vérifier si l'IP est une correspondance directe
  if (allowedIPRanges.includes(clientIP)) {
    return true;
  }

  // Vérifier si l'IP est dans une plage CIDR
  return allowedIPRanges.some(range => {
    try {
      return ip.cidrSubnet(range).contains(clientIP);
    } catch (error) {
      console.error(`Invalid CIDR range: ${range}`);
      return false;
    }
  });
};

const normalizeIP = (ipAddress) => {
  if (ipAddress.startsWith('::ffff:')) {
    return ipAddress.split('::ffff:')[1];
  }
  return ipAddress;
};

const authMiddleware = (req, res, next) => {
  let clientIP = req.ip || req.connection.remoteAddress;
  clientIP = normalizeIP(clientIP);

  console.log(`Client IP: ${clientIP}`);

  if (isAllowedIP(clientIP)) {
    return next();
  }

  const user = basicAuth(req);
  const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = process.env;

  if (!user || user.name !== BASIC_AUTH_USERNAME || user.pass !== BASIC_AUTH_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="example"');
    return res.status(401).send('Authentication required.');
  }

  next();
};

app.use(authMiddleware);

const columnsRoutes = require('./routes/columns');
const cardsRoutes = require('./routes/cards');

app.use('/api/columns', columnsRoutes);
app.use('/api/cards', cardsRoutes);

db.connect();
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});