const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('./models/db');
const { setupWebSocket } = require('./websocket/socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

// Secret pour JWT (à placer dans votre fichier .env)
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Middleware pour vérifier le JWT
const authMiddleware = (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Gérer les adresses IPv6 encodées en IPv4 (si nécessaire)
    const ipv4 = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp;

    // Vérification de l'IP autorisée
    if (ipv4 === '193.253.212.56') {
        console.log(`Accès autorisé sans token pour l'IP : ${ipv4}`);
        return next();
    }

    // Vérification classique du token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Récupère le token après "Bearer"

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user; // Ajoute les infos utilisateur à la requête
        next();
    });
};


// Routes protégées avec le middleware
const columnsRoutes = require('./routes/columns');
const cardsRoutes = require('./routes/cards');
const loginRoutes = require('./routes/user');


// Applique le middleware d'auth pour toutes les routes API
app.get('/api/check-ip', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipv4 = clientIp.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp;

    if (ipv4 === '193.253.212.56') {
        return res.json({ showNamePopup: true });
    }

    res.json({ showNamePopup: false });
});

app.get('/api/test', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    console.log(`Test - Adresse IP : ${ip}`);
    console.log(`Test - User-Agent : ${userAgent}`);
    res.json({ ip, userAgent });
});

app.use('/api' , loginRoutes);
app.use('/api/columns', authMiddleware, columnsRoutes);
app.use('/api/cards', authMiddleware, cardsRoutes);

// Connexion à la base de données
db.connect();

// Configuration des websockets
setupWebSocket(server);

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});