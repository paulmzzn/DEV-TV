import React from 'react';
import ManagementPanel from '../components/ManagementPanel';


const ManagementPage = () => {
    return (
      <div>
        <h1 style={{
          textAlign: 'center',
          fontSize: '3em', /* Taille du texte */
          fontWeight: '700', /* Poids plus lourd pour un effet plus imposant */
          color: '#333', /* Couleur sombre pour contraster */
          marginBottom: '20px', /* Espace en dessous du titre */
          letterSpacing: '2px', /* Espacement des lettres */
          textTransform: 'uppercase', /* Transforme le texte en majuscules */
          WebkitBackgroundClip: 'text', /* Applique le dégradé au texte uniquement */
          padding: '10px 0', /* Ajout d'un peu de padding */
          fontFamily: '"Poppins", sans-serif', /* Application de la police Poppins */
        }}>
          Management Panel
        </h1>
        <ManagementPanel />
      </div>
    );
  };

export default ManagementPage;