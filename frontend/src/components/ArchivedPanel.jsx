import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import '../styles/management.css';
import avatarImage from '../images/Avatar.png';
import jwt_decode from 'jwt-decode';

const ArchivedPanel = () => {
  const [columns, setColumns] = useState([]);
  const [showCardPopup, setShowCardPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [view, setView] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false); // Define showLoginPopup state

  const fetchColumns = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return;
      }
      const response = await fetch('http://87.106.130.160/api/columns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }
      setColumns(data);
      localStorage.setItem('columns', JSON.stringify(data)); // Cache the columns data
    } catch (error) {
      console.error('Erreur lors de la récupération des colonnes:', error);
      const cachedColumns = localStorage.getItem('columns');
      if (cachedColumns) {
        setColumns(JSON.parse(cachedColumns)); // Load cached columns data
      }
    }
  }, []);

  useEffect(() => {
    const cachedColumns = localStorage.getItem('columns');
    if (cachedColumns) {
      setColumns(JSON.parse(cachedColumns)); // Load cached columns data
    }
    fetchColumns();
  }, [fetchColumns]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const decoded = jwt_decode(token);
      setDecodedToken(decoded);
    }
  }, []);

  useEffect(() => {
    const metaViewport = document.createElement('meta');
    metaViewport.name = 'viewport';
    metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(metaViewport);

    const metaNoTranslate = document.createElement('meta');
    metaNoTranslate.name = 'google';
    metaNoTranslate.content = 'notranslate';
    document.head.appendChild(metaNoTranslate);

    return () => {
      document.head.removeChild(metaViewport);
      document.head.removeChild(metaNoTranslate);
    };
  }, []);

  const openCardPopup = (card) => {
    setSelectedCard(card);
    setShowCardPopup(true);
  };

  const closeCardPopup = () => {
    setShowCardPopup(false);
    setSelectedCard(null);
  };

  const openDeletePopup = (card) => {
    setCardToDelete(card);
    setShowDeletePopup(true);
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setCardToDelete(null);
  };

  const deleteCard = async () => {
    if (!cardToDelete) return;
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch(`http://87.106.130.160/api/cards/${cardToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchColumns();
      closeDeletePopup();
    } catch (error) {
      console.error('Erreur lors de la suppression de la carte:', error);
    }
  };

  const filterTasks = (columns) => {
    return columns.map(column => ({
      ...column,
      cards: column.cards.filter(card => {
        if (!card.archived) return false;
        if (view === 'assigned') {
          return card.assigne.toLowerCase() === decodedToken.username.toLowerCase();
        } else if (view === 'inProgress') {
          return card.status.toLowerCase() === `en cours : ${decodedToken.username.toLowerCase()}`;
        } else if (view === 'createdByMe') {
          return card.author.toLowerCase() === decodedToken.username.toLowerCase();
        } else if (assigneeFilter !== 'all') {
          return card.assigne.toLowerCase() === assigneeFilter.toLowerCase();
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            card.title.toLowerCase().includes(query) ||
            card.content.toLowerCase().includes(query) ||
            card.author.toLowerCase().includes(query) ||
            card.status.toLowerCase().includes(query) ||
            card.societe.toLowerCase().includes(query) ||
            card.assigne.toLowerCase().includes(query) ||
            card.priority.toString().includes(query) ||
            (card.link && card.link.toLowerCase().includes(query))
          );
        }
        return true;
      })
    }));
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAccountMenu && !event.target.closest('.account-menu') && !event.target.closest('.avatar')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  const cardStyle = {
    backgroundColor: '#eee',
    minHeight: '50px', // Adjust min-height for archived cards
    maxHeight: '100px', // Set max-height for archived cards
    overflow: 'hidden' // Hide overflow content
  };

  const mobileCardStyle = {
    ...cardStyle,
    minHeight: '50px', // Increase min-height for mobile carousel
    maxHeight: '100px' // Increase max-height for mobile carousel
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setDecodedToken(null);
    setShowAccountMenu(false);
    setColumns([]);
  };

  const handleLoginSubmit = async (username, password) => {
    try {
      const response = await fetch('http://87.106.130.160/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('jwt_token', data.token);
      const decoded = jwt_decode(data.token);
      setDecodedToken(decoded);
      setShowLoginPopup(false);
      fetchColumns();
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Login failed, please try again.');
    }
  };

  const handleViewChange = (e) => {
    setView(e.target.value);
    if (e.target.value !== 'all') {
      setAssigneeFilter('all'); // Reset the second select
    }
  };

  const handleAssigneeFilterChange = (e) => {
    setAssigneeFilter(e.target.value);
    if (e.target.value !== 'all') {
      setView('all'); // Reset the first select
    }
  };

  return (
    <div className="management-panel">
      <div className="avatar-container">
        <img src={avatarImage} alt="Avatar" className="avatar" onClick={toggleAccountMenu} />
        {showAccountMenu && (
          <div className="account-menu">
            {decodedToken && <p><b> {capitalizeFirstLetter(decodedToken.username)}</b></p>}
            <select onChange={handleViewChange} value={view}>
              <option value="all">Toutes les taches</option>
              <option value="assigned">Assigné à moi</option>
              <option value="inProgress">En cours par moi</option>
              <option value="createdByMe">Créé par moi</option>
            </select>
            <select onChange={handleAssigneeFilterChange} value={assigneeFilter}>
              <option value="all">Tous les assignés</option>
              <option value="Aubin">Assigné à Aubin</option>
              <option value="Stéphane">Assigné à Stéphane</option>
              <option value="Léo">Assigné à Léo</option>
              <option value="Thomas">Assigné à Thomas</option>
              <option value="François">Assigné à François</option>
              <option value="Paul">Assigné à Paul</option>
            </select>
            <button className="btnGoToStatistics" onClick={() => window.location.href = '/statistics'}>Statistiques</button>
            {decodedToken ? (
              <button className="btnLogout" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="btnLogin" onClick={() => setShowLoginPopup(true)}>Login</button>
            )}
          </div>
        )}
      </div>
      <div className="button-container">
        <button className="btnGoToTV" onClick={() => window.location.href = '/tv.html'}>Affichage TV</button>
        <button className="btnGoToManagement" onClick={() => window.location.href = '/'}>Management</button>
      </div>
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />
      <div className="columns">
        {filterTasks(columns).map((column) => (
          <div key={column._id} className="column">
            <h3>{column.title}</h3>
            <div className="cards">
              {isMobile ? (
                <Swiper
                  spaceBetween={20}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  style={{ width: '100%' }}
                >
                  {column.cards.reduce((acc, card, index) => {
                    const pageIndex = Math.floor(index / 5);
                    if (!acc[pageIndex]) {
                      acc[pageIndex] = [];
                    }
                    acc[pageIndex].push(card);
                    return acc;
                  }, []).map((page, pageIndex) => (
                    <SwiperSlide key={pageIndex}>
                      {page.map(card => (
                        <div
                          key={card._id}
                          id={card._id}
                          className="card"
                          onClick={() => openCardPopup(card)}
                          style={mobileCardStyle} // Apply mobile card style
                        >
                          <h4 className="card-title">{card.title}</h4>
                          <button className="btnDeleteCard" onClick={(e) => {
                            e.stopPropagation();
                            openDeletePopup(card);
                          }}>x</button>
                        </div>
                      ))}
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                column.cards.map((card, index) => (
                  <div
                    key={card._id}
                    id={card._id}
                    className="card"
                    onClick={() => openCardPopup(card)}
                    style={cardStyle} // Apply card style
                  >
                    <h4 className="card-title">{card.title}</h4>
                    <button className="btnDeleteCard" onClick={(e) => {
                      e.stopPropagation();
                      openDeletePopup(card);
                    }}>x</button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showCardPopup && selectedCard && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{selectedCard.title}</h3>
            <p><b>Auteur:</b> {selectedCard.author}</p>
            <p><b>Contenu:</b> {selectedCard.content}</p>
            <p><b>Statut:</b> {selectedCard.status}</p>
            <p><b>Société:</b> {selectedCard.societe}</p>
            <p><b>Assigné à:</b> {selectedCard.assigne}</p>
            <p><b>Priorité:</b> {selectedCard.priority}</p>
            <p><b>Link:</b> <a href={selectedCard.link} target="_blank" rel="noopener noreferrer">{selectedCard.link}</a></p>
            <div className="form-actions">
              <button className="btncancel full-width" onClick={closeCardPopup}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && cardToDelete && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Êtes-vous sûr de vouloir supprimer cette carte ?</h3>
            <div className="form-actions">
              <button className="btn-status-red" onClick={closeDeletePopup}>Annuler</button>
              <button className="btn-status-green" onClick={deleteCard}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {showLoginPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Connexion</h3>
            <input type="text" id="login-username" placeholder="Nom d'utilisateur" />
            <input type="password" id="login-password" placeholder="Mot de passe" />
            <div className="form-actions">
              <button className='btn-status-red' onClick={() => setShowLoginPopup(false)}>Annuler</button>
              <button className='btn-status-green' onClick={() => {
                const username = document.getElementById('login-username').value.trim();
                const password = document.getElementById('login-password').value.trim();
                handleLoginSubmit(username, password);
              }}>Se connecter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArchivedPanel;
