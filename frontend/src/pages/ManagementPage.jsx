import React from 'react';
import ManagementPanel from '../components/ManagementPanel';

const ManagementPage = () => {
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
              borderRadius: '10px', // Arrondir les bords de l'image
            }}
          />
        </div>
        {/* Texte centré */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          Management Panel
        </div>
      </h1>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      </div>
      <ManagementPanel />
    </div>
  );
};

export default ManagementPage;