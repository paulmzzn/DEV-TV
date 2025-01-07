const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('./models/db');
const { setupWebSocket } = require('./websocket/socket');
const cron = require('node-cron');
const axios = require('axios');
const { extractDates, calculatePriority } = require('./utils/dateAnalyzer');

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


// Fonction pour vérifier les nouvelles commandes WooCommerce
const checkNewOrders = async () => {
    try {
        const response = await axios.get('https://aleaulavage.com/wp-json/wc/v3/orders', {
            auth: {
                username: process.env.WC_CONSUMER_KEY,
                password: process.env.WC_CONSUMER_SECRET
            }
        });

        const orders = response.data;

        const prepaCommandeColumnId = '675c36542c393909c784f275'; // Utilisez directement l'ID de la colonne "Prepa Commande"

        for (const order of orders) {
            // Ignorez les commandes avec le statut "completed"
            if (order.status === 'completed') {
                console.log(`Commande ${order.id} ignorée car elle est déjà complétée.`);
                continue;
            }

            // Vérifiez si la commande existe déjà dans la base de données
            const existingCard = await db.Card.findOne({ societe: order.id });
            if (existingCard) {
                console.log(`Commande ${order.id} déjà ajoutée.`);
                continue;
            }

            // Préparez le contenu de la carte avec les articles de la commande
            const content = order.line_items.map(item => `${item.name} *${item.quantity}`).join('\n');

            // Préparez les données de la nouvelle carte
            const newCard = {
                title: `Commande #${order.id} ${order.billing.first_name} ${order.billing.last_name}`,
                content: content,
                columnId: prepaCommandeColumnId,
                link: order.payment_url,
                author: `WooCommerce`,
                status: order.status,
                assigne: 'Personne', // Vous pouvez modifier cette valeur si nécessaire
                societe: order.id,
                priority: '1', // Vous pouvez modifier cette valeur si nécessaire
                archived: false
            };
            console.log('Nouvelle carte à ajouter:', newCard);

            // Ajoutez la carte à la base de données
            const createdCard = await db.Card.create(newCard);
            console.log('Carte créée avec succès:', createdCard);

            // Ajoutez l'ID de la carte à la colonne correspondante
            const column = await db.Column.findById(prepaCommandeColumnId);
            if (column) {
                column.cards.push(createdCard._id);
                await column.save();
                console.log('Carte ajoutée à la colonne:', column);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des nouvelles commandes WooCommerce:', error);
    }
};

// Planifiez la tâche cron pour s'exécuter toutes les 30 minutes
cron.schedule('*/30 * * * *', checkNewOrders);

// Fonction pour analyser les dates et mettre à jour les priorités
const updateCardPriorities = async () => {
    try {
        const cards = await db.Card.find({});
        
        for (const card of cards) {
            // Rechercher une date uniquement dans le titre
            const titleDate = extractDates(card.title);
            
            if (titleDate) {
                const newPriority = calculatePriority(titleDate);
                if (card.priority !== newPriority) {
                    card.priority = newPriority;
                    await card.save();
                    console.log(`Priorité mise à jour pour la carte ${card._id}: ${newPriority}`);
                }
            }
            // Si pas de date dans le titre, on ne fait rien et on garde la priorité existante
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour des priorités:', error);
    }
};

// Ajouter le nouveau cron (exécution toutes les heures)
cron.schedule('0 * * * *', updateCardPriorities);

// Connexion à la base de données
db.connect();

// Configuration des websockets
setupWebSocket(server);

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});