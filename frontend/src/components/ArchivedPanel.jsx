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

  const fetchColumns = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return;
      }
      const response = await fetch('http://192.168.1.64:3000/api/columns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }
      setColumns(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des colonnes:', error);
    }
  }, []);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const decoded = jwt_decode(token);
      setDecodedToken(decoded);
    }
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
      await fetch(`http://192.168.1.64:3000/api/cards/${cardToDelete._id}`, {
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

  return (
    <div className="management-panel">
      <div className="avatar-container">
        <img src={avatarImage} alt="Avatar" className="avatar" onClick={toggleAccountMenu} />
        {showAccountMenu && (
          <div className="account-menu">
            {decodedToken && <p><b> {capitalizeFirstLetter(decodedToken.username)}</b></p>}
            <select onChange={(e) => setView(e.target.value)} value={view}>
              <option value="all">Toutes les taches</option>
              <option value="assigned">Assigné à moi</option>
              <option value="inProgress">En cours par moi</option>
              <option value="createdByMe">Créé par moi</option>
            </select>
            <select onChange={(e) => setAssigneeFilter(e.target.value)} value={assigneeFilter}>
              <option value="all">Tous les assignés</option>
              <option value="Aubin">Assigné à Aubin</option>
              <option value="Stéphane">Assigné à Stéphane</option>
              <option value="Léo">Assigné à Léo</option>
              <option value="Thomas">Assigné à Thomas</option>
              <option value="François">Assigné à François</option>
              <option value="Paul">Assigné à Paul</option>
            </select>
          </div>
        )}
      </div>
      <div className="button-container">
        <button className="btnGoToTV" onClick={() => window.location.href = '/tv.html'}>Go to TV Display</button>
        <button className="btnGoToManagement" onClick={() => window.location.href = '/'}>Go to Management</button>
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
                  {column.cards.map((card, index) => (
                    <SwiperSlide key={card._id}>
                      <div
                        id={card._id}
                        className="card"
                        onClick={() => openCardPopup(card)}
                        style={{ backgroundColor: '#eee', minHeight: '100px' }} // Adjust min-height
                      >
                        <h4 className="card-title">{card.title}</h4>
                        <button className="btnDeleteCard" onClick={(e) => {
                          e.stopPropagation();
                          openDeletePopup(card);
                        }}>x</button>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <Swiper
                  spaceBetween={20}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  style={{ width: '100%' }}
                >
                  {column.cards.map((card, index) => (
                    <SwiperSlide key={card._id}>
                      <div
                        id={card._id}
                        className="card"
                        onClick={() => openCardPopup(card)}
                        style={{ backgroundColor: '#eee', minHeight: '100px' }} // Adjust min-height
                      >
                        <h4 className="card-title">{card.title}</h4>
                        <button className="btnDeleteCard" onClick={(e) => {
                          e.stopPropagation();
                          openDeletePopup(card);
                        }}>x</button>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
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
              <button className="btncancel" onClick={closeCardPopup}>Fermer</button>
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
    </div>
  );
}

export default ArchivedPanel;
