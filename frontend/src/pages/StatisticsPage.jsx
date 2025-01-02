import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const commonWords = [
  'aura', 'faudrait', 'suivantes', 'commandes', 'commande', 'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'entre', 'par', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'qui', 'que', 'quoi', 'dont', 'où', 'quand', 'comment', 'pourquoi', 'parce', 'qu', 'est', 'sont', 'était', 'étaient', 'être', 'avoir', 'faire', 'aller', 'venir', 'pouvoir', 'vouloir', 'devoir', 'savoir', 'voir', 'prendre', 'mettre', 'dire', 'parler', 'donner', 'trouver', 'falloir', 'venir', 'passer', 'croire', 'aimer', 'penser', 'demander', 'travailler', 'utiliser', 'essayer', 'jouer', 'marcher', 'courir', 'laver', 'nettoyer', 'sécher', 'rincer', 'polir', 'cirer', 'aspirer', 'brosser', 'frotter', 'essuyer', 'réparer', 'changer', 'remplacer', 'vérifier', 'contrôler', 'tester', 'diagnostiquer', 'nettoyage', 'lavage', 'séchage', 'rinçage', 'polissage', 'cirage', 'aspiration', 'brossage', 'frottage', 'essuyage', 'réparation', 'changement', 'remplacement', 'vérification', 'contrôle', 'test', 'diagnostic'
];

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const StatisticsPage = () => {
  const [taskData, setTaskData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      try {
        const response = await fetch('http://87.106.130.160/api/columns', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const columns = await response.json();
        const archivedCards = columns.flatMap(column => column.cards).filter(card => card.archived);

        const taskStats = archivedCards.reduce((acc, card) => {
          const author = card.author;
          const assigne = card.assigne;

          if (!acc[author]) {
            acc[author] = { created: 0, completed: 0 };
          }
          if (!acc[assigne]) {
            acc[assigne] = { created: 0, completed: 0 };
          }

          acc[author].created += 1;
          if (card.status.toLowerCase() === 'clôturé') {
            acc[assigne].completed += 1;
          }
          return acc;
        }, {});

        const keywordStats = archivedCards.reduce((acc, card) => {
          const keywords = card.content.split(/\s+/).filter(word => word.length > 3 && !commonWords.includes(word.toLowerCase()));
          keywords.forEach(keyword => {
            if (!acc[keyword]) {
              acc[keyword] = 0;
            }
            acc[keyword] += 1;
          });
          return acc;
        }, {});

        const sortedKeywordStats = Object.keys(keywordStats)
          .map(keyword => ({ keyword, count: keywordStats[keyword] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);

        setTaskData(Object.keys(taskStats).map(user => ({
          user,
          ...taskStats[user]
        })));
        setKeywordData(sortedKeywordStats);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchData();
  }, []);

  const taskCompletionData = {
    labels: taskData.map(stat => stat.user),
    datasets: [
      {
        label: 'Tâches clôturées',
        data: taskData.map(stat => stat.completed),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Tâches créées',
        data: taskData.map(stat => stat.created),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const keywordFrequencyData = {
    labels: keywordData.map(stat => stat.keyword),
    datasets: [
      {
        label: 'Fréquence des mots-clés',
        data: keywordData.map(stat => stat.count),
        backgroundColor: keywordData.map(() => getRandomColor()),
      },
    ],
  };

return (
  <div>
    <h1 style={{
      fontSize: '3.5vw', // Taille du texte relative à la largeur de la fenêtre
      fontWeight: '700', // Poids plus lourd pour un effet plus imposant
      color: '#333', // Couleur sombre pour contraster
      marginBottom: '20px', // Espace en dessous du titre
      letterSpacing: '2px', // Espacement des lettres
      textTransform: 'uppercase', // Transforme le texte en majuscules
      WebkitBackgroundClip: 'text', // Applique le dégradé au texte uniquement
      padding: '10px 0', // Ajout d'un peu de padding
      fontFamily: '"Poppins", sans-serif', // Application de la police Poppins
      display: 'flex', // Utilisation de flexbox pour aligner les éléments
      alignItems: 'center', // Alignement vertical
      justifyContent: 'center', // Centre le texte
      position: 'relative', // Position relative pour le logo
    }}>
      {/* Conteneur du logo aligné à gauche */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '20px' }}>
        <img 
          src="https://www.pagesjaunes.fr/media/agc/85/c2/5d/00/00/48/65/0e/8b/14/63cd85c25d000048650e8b14/63cd85c25d000048650e8b15.png?w=1200" 
          alt="Logo" 
          style={{
            width: '10vw', // Taille de l'image relative à la largeur de la fenêtre
            height: 'auto', // Maintenir le ratio de l'image
            maxWidth: '80px', // Taille maximale de l'image
          }}
        />
      </div>
      {/* Texte centré */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        Statistiques
      </div>
    </h1>
    <div className="button-container">
      <button className="btnGoToTV" onClick={() => window.location.href = '/tv.html'}>Affichage TV</button>
      <button className="btnGoToManagement" onClick={() => window.location.href = '/'}>Management</button>
    </div>
    <div>
      <h2 style={{
        fontSize: '2.5vw', // Taille du texte relative à la largeur de la fenêtre
        fontWeight: '600', // Poids plus lourd pour un effet plus imposant
        color: '#555', // Couleur sombre pour contraster
        marginBottom: '15px', // Espace en dessous du titre
        letterSpacing: '1px', // Espacement des lettres
        textTransform: 'uppercase', // Transforme le texte en majuscules
        padding: '5px 0', // Ajout d'un peu de padding
        fontFamily: '"Poppins", sans-serif', // Application de la police Poppins
        textAlign: 'center', // Centre le texte
      }}>Clôture des tâches par personne</h2>
      <Bar data={taskCompletionData} />
    </div>
    <div>
      <h2 style={{
        fontSize: '2.5vw', // Taille du texte relative à la largeur de la fenêtre
        fontWeight: '600', // Poids plus lourd pour un effet plus imposant
        color: '#555', // Couleur sombre pour contraster
        marginBottom: '15px', // Espace en dessous du titre
        letterSpacing: '1px', // Espacement des lettres
        textTransform: 'uppercase', // Transforme le texte en majuscules
        padding: '5px 0', // Ajout d'un peu de padding
        fontFamily: '"Poppins", sans-serif', // Application de la police Poppins
        textAlign: 'center', // Centre le texte
      }}>Fréquence des mots-clés</h2>
      <Pie data={keywordFrequencyData} />
    </div>
  </div>
);
};

export default StatisticsPage;
