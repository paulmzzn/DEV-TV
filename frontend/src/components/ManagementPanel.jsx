import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import '../styles/management.css';
import avatarImage from '../images/Avatar.png';
import jwt_decode from 'jwt-decode';

const ManagementPanel = () => {
  const [columns, setColumns] = useState([]);
  const [showCardForm, setShowCardForm] = useState(false); 
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [name, setName] = useState('');
  const [currentColumnId, setCurrentColumnId] = useState(null); 
  const [cardData, setCardData] = useState({
    title: '',
    content: '',
    link: '',
    author: '',
    status: '',
    societe: '',
    priority: 3,
  });
  const [showEditCardForm, setShowEditCardForm] = useState(false); 
  const [editCardData, setEditCardData] = useState({
    title: '',
    content: '',
    link: '',
    author: '',
    cardId: '',
    status: '',
    societe: '',
    priority: 3,
  });
  const [showDeleteColumnPopup, setShowDeleteColumnPopup] = useState(false);
  const [showDeleteCardPopup, setShowDeleteCardPopup] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [cardToDelete, setCardToDelete] = useState({ columnId: null, cardId: null });
  const [loginName, setLoginName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [decodedToken, setDecodedToken] = useState(null);
  const [view, setView] = useState('all');
  const [sortOption, setSortOption] = useState('normal');
  const [showColumnSelectPopup, setShowColumnSelectPopup] = useState(false);

  const priorityColors = {
    1: '#D4EDDA',
    2: '#A9DFBF',
    3: '#F9E79F',
    4: '#F5CBA7',
    5: '#F1948A'
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  const fetchColumns = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setShowLoginPopup(true);
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
    } catch (error) {
      console.error('Erreur lors de la récupération des colonnes:', error);
      setShowLoginPopup(true);
    }
  }, []);

  useEffect(() => {
    fetchColumns();

    const intervalId = setInterval(() => {
      if (!showCardForm && !showEditCardForm) {
        fetchColumns();
      }
    }, 20000); 

    return () => clearInterval(intervalId);
  }, [showCardForm, showEditCardForm, fetchColumns]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const decoded = jwt_decode(token);
      setDecodedToken(decoded);
      setLoginName(decoded.username); // Set loginName from decoded token
      setCardData((prevCardData) => ({
        ...prevCardData,
        author: decoded.username // Set author field in cardData
      }));
    }
  }, []);

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

  const addColumn = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    const title = prompt('Enter column title:');
    if (!title) return;

    const res = await fetch('http://87.106.130.160/api/columns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, cards: [] }),
    });

    const newColumn = await res.json();
    setColumns([...columns, newColumn]);
  };

  const confirmDeleteColumn = (id) => {
    setColumnToDelete(id);
    setShowDeleteColumnPopup(true);
  };

  const confirmArchiveCard = (columnId, cardId) => {
    setCardToDelete({ columnId, cardId });
    setShowDeleteCardPopup(true);
  };

  const deleteColumn = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    const id = columnToDelete;
    setShowDeleteColumnPopup(false);
    try {
      await fetch(`http://87.106.130.160/api/columns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setColumns(columns.filter((column) => column._id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la colonne:', error);
    }
  };

  const archiveCard = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    const { columnId, cardId } = cardToDelete;
    setShowDeleteCardPopup(false);
    try {
      await fetch(`http://87.106.130.160/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ archived: true }),
      });

      const updatedColumns = columns.map((column) => {
        if (column._id === columnId) {
          return {
            ...column,
            cards: column.cards.filter((card) => card._id !== cardId),
          };
        }
        return column;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Erreur lors de l\'archivage de la carte:', error);
    }
  };

  const addCard = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    if (!cardData.title) {
      alert('Veuillez remplir le titre.');
      return;
    }
  
    const authorName = nameSubmitted ? name : loginName;
    const newCardData = {
      title: cardData.title,
      content: cardData.content,
      columnId: currentColumnId,
      link: cardData.link,
      author: authorName,
      status: cardData.status || 'À faire',
      societe: cardData.societe,
      assigne: cardData.assigne, 
      priority: cardData.priority,
    };
  
    try {
      const res = await fetch('http://87.106.130.160/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCardData),
      });
  
      const newCard = await res.json();
  
      const updatedColumns = columns.map((column) => {
        if (column._id === currentColumnId) {
          return {
            ...column,
            cards: [...column.cards, newCard],
          };
        }
        return column;
      });
  
      setColumns(updatedColumns);
      setShowCardForm(false);
      setCardData({ title: '', content: '', link: '', author: authorName, status: '', societe: '', priority: 3 });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la carte:', error);
    }
  };

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDrop = async (e, newColumnId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');

    const sourceColumn = columns.find((column) =>
      column.cards.some((card) => card._id === cardId)
    );

    if (!sourceColumn) return;

    const cardToMove = sourceColumn.cards.find((card) => card._id === cardId);

    if (!cardToMove) return;

    if (sourceColumn._id === newColumnId) return;

    try {
      await updateCardColumn(cardId, newColumnId, cardToMove);

      const updatedColumns = columns.map((column) => {
        if (column._id === sourceColumn._id) {
          return {
            ...column,
            cards: column.cards.filter((card) => card._id !== cardId),
          };
        }
        if (column._id === newColumnId) {
          return {
            ...column,
            cards: [...column.cards, { ...cardToMove, columnId: newColumnId }],
          };
        }
        return column;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Erreur lors du déplacement de la carte:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const updateCardColumn = async (cardId, newColumnId, cardToMove) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    try {
      const response = await fetch(`http://87.106.130.160/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: cardToMove.title,
          content: cardToMove.content,
          link: cardToMove.link,
          columnId: newColumnId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la carte');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
      throw error;
    }
  };

  const openEditCardForm = (card) => {
    setEditCardData({ ...card, cardId: card._id });
    setShowEditCardForm(true);
  };

  const updateCard = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    if (!editCardData.title || !editCardData.columnId) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const res = await fetch(`http://87.106.130.160/api/cards/${editCardData.cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editCardData.title,
          content: editCardData.content,
          link: editCardData.link,
          columnId: editCardData.columnId,
          author: loginName, // Set author field to loginName
          status: editCardData.status,
          societe: editCardData.societe,
          assigne: editCardData.assigne,
          priority: editCardData.priority,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erreur dans la réponse du serveur:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la carte');
      }

      const updatedCard = await res.json();

      const updatedColumns = columns.map((column) => {
        if (column.cards.some((card) => card._id === editCardData.cardId)) {
          return {
            ...column,
            cards: column.cards.map((card) =>
              card._id === editCardData.cardId ? updatedCard : card
            ),
          };
        }
        return column;
      });

      setColumns(updatedColumns);
      setShowEditCardForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la carte:', error);
    }
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
      setLoginName(username); // Store the login name
      setCardData((prevCardData) => ({
        ...prevCardData,
        author: username // Set author field in cardData
      }));
      fetchColumns();
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Login failed, please try again.');
    }
  };

  const handleNameSubmit = () => {
    setNameSubmitted(true);
    setShowNamePopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setDecodedToken(null);
    setShowAccountMenu(false);
    setColumns([]);
  };
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const sortCards = (cards) => {
    if (sortOption === 'priorityAsc') {
      return [...cards].sort((a, b) => a.priority - b.priority);
    } else if (sortOption === 'priorityDesc') {
      return [...cards].sort((a, b) => b.priority - a.priority);
    }
    return cards;
  };

  const filterTasks = (columns) => {
    return columns.map(column => ({
      ...column,
      cards: sortCards(column.cards.filter(card => {
        if (card.archived) return false;
        if (view === 'assigned') {
          return card.assigne.toLowerCase() === decodedToken.username.toLowerCase();
        } else if (view === 'inProgress') {
          return card.status.toLowerCase() === `en cours : ${decodedToken.username.toLowerCase()}`;
        } else if (view === 'createdByMe') {
          return card.author.toLowerCase() === decodedToken.username.toLowerCase();
        }
        return true;
      }))
    }));
  };

  const isMobile = window.innerWidth <= 768;

  const handleAddCardClick = () => {
    if (isMobile) {
      setShowColumnSelectPopup(true);
    } else {
      setShowCardForm(true);
    }
  };

  const handleColumnSelect = (columnId) => {
    setCurrentColumnId(columnId);
    setShowColumnSelectPopup(false);
    setShowCardForm(true);
  };

  const getColumnButtonStyle = (title) => {
    switch (title) {
      case 'Prepa Commande':
        return { backgroundColor: 'rgb(179, 229, 252)' };
      case 'Stock':
        return { backgroundColor: 'rgb(200, 230, 201)' };
      case 'Inter':
        return { backgroundColor: 'rgb(255, 249, 196)' };
      case 'Rappel':
        return { backgroundColor: 'rgb(251, 135, 135)' };
      default:
        return {};
    }
  };

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
            <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
              <option value="normal">Normal</option>
              <option value="priorityDesc">Priorité + </option>
              <option value="priorityAsc">Priorité - </option>
            </select>
            {decodedToken ? (
              <button className="btnLogout" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="btnLogin" onClick={() => setShowLoginPopup(true)}>Login</button>
            )}
          </div>
        )}
      </div>
      <div className="button-container">
        <button className="btnGoToTV" onClick={() => window.location.href = '/tv.html'}>Go to TV Display</button>
        <button className="btnGoToManagement" onClick={() => window.location.href = '/archive'}>Go to Archive</button>
      </div>
      <button onClick={addColumn}>Add Column</button>
      <div className="columns">
        {filterTasks(columns).map((column, index) => (
          <div
            key={column._id}
            className={`column ${isMobile && index === columns.length - 1 ? 'last-column' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column._id)}
          >
            <h3>{column.title}</h3>
            <button
              className="btnDeleteColumn"
              onClick={() => confirmDeleteColumn(column._id)}
            >
              x
            </button>
            <div className="cards">
              {!isMobile && (
                <button className='btnAddCard'
                  onClick={() => {
                    setCurrentColumnId(column._id);
                    setShowCardForm(true);
                  }}
                >
                  Add Card +
                </button>
              )}
              {isMobile ? (
                <>
                  <Swiper
                    spaceBetween={20}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    modules={[Pagination]}
                    style={{ width: '100%' }}
                  >
                    {column.cards.map((card) => (
                      <SwiperSlide key={card._id}>
                        <div
                          id={card._id}
                          className="card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, card._id)}
                          style={{ backgroundColor: sortOption === 'normal' ? '#eee' : priorityColors[card.priority] }}
                        >
                          <h4 className="card-title">{card.title}</h4>
                          <p className="card-content">{card.content}</p>
                          {card.link && (
                            <a href={card.link} target="_blank" rel="noopener noreferrer" className="card-link">
                              {card.link}
                            </a>
                          )}
                          <div className="card-footer"></div>
                            <p className={`card-status ${card.status === 'À faire' ? 'available' : 'unavailable'}`}>
                              <b>{card.status || '???'}</b>
                            </p>
                            {card.assigne !== 'Personne' && (
                              <p className="card-author">Assigné à : <b>{card.assigne}</b></p>
                            )}
                            <p className="card-author">Auteur : <b>{card.author || '???'}</b></p>
                          <div className="card-buttons mobile-buttons">
                            <button className="btnupdatecard" onClick={() => openEditCardForm(card)}>
                              Update Card
                            </button>
                            <button className="btndeletecard" onClick={() => confirmArchiveCard(column._id, card._id)}>
                              Archive Card
                            </button>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </>
              ) : (
                column.cards.map((card) => (
                  <div
                    key={card._id}
                    id={card._id}
                    className="card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card._id)}
                    style={{ backgroundColor: sortOption === 'normal' ? '#eee' : priorityColors[card.priority] }}
                  >
                    <h4 className="card-title">{card.title}</h4>
                    <p className="card-content">{card.content}</p>
                    {card.link && (
                      <a href={card.link} target="_blank" rel="noopener noreferrer" className="card-link">
                        {card.link}
                      </a>
                    )}
                    <div className="card-footer"></div>
                      <p className={`card-status ${card.status === 'À faire' ? 'available' : 'unavailable'}`}>
                        <b>{card.status || '???'}</b>
                      </p>
                      {card.assigne !== 'Personne' && (
                        <p className="card-author">Assigné à : <b>{card.assigne}</b></p>
                      )}
                      <p className="card-author">Auteur : <b>{card.author || '???'}</b></p>
                    <div className="card-buttons">
                      <button className="btnupdatecard" onClick={() => openEditCardForm(card)}>
                        Update Card
                      </button>
                      <button className="btndeletecard" onClick={() => confirmArchiveCard(column._id, card._id)}>
                        Archive Card
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {isMobile && (
        <button
          className="btnAddCardSticky"
          onClick={handleAddCardClick}
        >
          Add Card +
        </button>
      )}

      {showColumnSelectPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Select Column</h3>
            <div className="column-select-wrapper">
              <div className="column-select">
                {columns.map((column) => (
                  <button
                    key={column._id}
                    className="column-select-button"
                    onClick={() => handleColumnSelect(column._id)}
                    style={getColumnButtonStyle(column.title)}
                  >
                    <span className="column-select-title"><b>{column.title}</b></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="btncancel full-width" onClick={() => setShowColumnSelectPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCardForm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Nouvelle Carte</h3>
            <label>
              Titre :
              <input
                type="text"
                value={cardData.title}
                onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
                placeholder='Titre de la carte'
              />
            </label>
            <label>
              Contenu :
              <textarea
                value={cardData.content}
                onChange={(e) => setCardData({ ...cardData, content: e.target.value })}
                placeholder='Contenu de la carte'
              />
            </label>
            <label>
              Lien :
              <input
                type="url"
                value={cardData.link || ''}
                onChange={(e) => {
                  let link = e.target.value;
                  if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
                    link = 'https://' + link;
                  }
                  setCardData({ ...cardData, link });
                }}
                placeholder='https://'
              />
            </label>
            <label>
              Assigné à :
              <select
                value={cardData.assigne}
                onChange={(e) => setCardData({ ...cardData, assigne: e.target.value })}
              >
                <option value="Personne">Personne</option>
                <option value="Aubin">Aubin</option>
                <option value="Stéphane">Stéphane</option>
                <option value="Léo">Léo</option>
                <option value="Thomas">Thomas</option>
                <option value="François">François</option>
                <option value="Paul">Paul</option>
              </select>
            </label>
            <label>
              Société :
              <select
                value={cardData.societe}
                onChange={(e) => setCardData({ ...cardData, societe: e.target.value })}
              >
                <option value="François">François</option>
                <option value="Thomas">Thomas</option>
              </select>
            </label>
            <label>
              Priorité :
              <select
                value={cardData.priority}
                onChange={(e) => setCardData({ ...cardData, priority: e.target.value })}
              >
                <option value="1">Très faible priorité</option>
                <option value="2">Faible priorité</option>
                <option value="3">Priorité moyenne</option>
                <option value="4">Haute priorité</option>
                <option value="5">Très haute priorité</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="btncancel large-button" onClick={() => setShowCardForm(false)}>Annuler</button>
              <button className="btn-add large-button" onClick={addCard}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {showEditCardForm && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Modifier la Carte</h3>
            <label>
              Titre :
              <input
                type="text"
                value={editCardData.title}
                onChange={(e) => setEditCardData({ ...editCardData, title: e.target.value })}
              />
            </label>
            <label>
              Contenu :
              <textarea
                value={editCardData.content}
                onChange={(e) => setEditCardData({ ...editCardData, content: e.target.value })}
              />
            </label>
            <label>
              Lien :
              <input
                type="url"
                value={editCardData.link || ''}
                onChange={(e) => setEditCardData({ ...editCardData, link: e.target.value })}
              />
            </label>
            <label>
              Statut :
              <input
                type="text"
                value={editCardData.status}
                onChange={(e) => setEditCardData({ ...editCardData, status: e.target.value })}
              />
            </label>
            <label>
            Assigné à :
              <select
                value={editCardData.assigne}
                onChange={(e) => setEditCardData({ ...editCardData, assigne: e.target.value })}
              >
                <option value="Personne">Personne</option>
                <option value="Aubin">Aubin</option>
                <option value="Stéphane">Stéphane</option>
                <option value="Léo">Léo</option>
                <option value="Thomas">Thomas</option>
                <option value="François">François</option>
                <option value="Paul">Paul</option>
              </select>
            </label>
            <label>
              Société :
              <select
                value={editCardData.societe}
                onChange={(e) => setEditCardData({ ...editCardData, societe: e.target.value })}
              >
                <option value="François">François</option>
                <option value="Thomas">Thomas</option>
              </select>
            </label>
            <label>
              Priorité :
              <select
                value={editCardData.priority}
                onChange={(e) => setEditCardData({ ...editCardData, priority: e.target.value })}
              >
                <option value="1">Très faible priorité</option>
                <option value="2">Faible priorité</option>
                <option value="3">Priorité moyenne</option>
                <option value="4">Haute priorité</option>
                <option value="5">Très haute priorité</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="btncancel large-button" onClick={() => setShowEditCardForm(false)}>Annuler</button>
              <button className="btn-update large-button" onClick={updateCard}>Mettre à Jour</button>
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
              <button className='btn-status-red full-width' onClick={() => setShowLoginPopup(false)}>Annuler</button>
              <button className='btn-status-green' onClick={() => {
                const username = document.getElementById('login-username').value.trim();
                const password = document.getElementById('login-password').value.trim();
                handleLoginSubmit(username, password);
              }}>Se connecter</button>
            </div>
          </div>
        </div>
      )}

    {showNamePopup && !nameSubmitted && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Entrez votre nom</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
            />
            <div className="form-actions">
              <button className="full-width" onClick={handleNameSubmit}>OK</button>
            </div>
          </div>
        </div>
      )}

    {showDeleteColumnPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Êtes-vous sûr de vouloir supprimer cette colonne ?</h3>
              <div className="form-actions">
                <button className="btncancel large-button" onClick={() => setShowDeleteColumnPopup(false)}>Annuler</button>
                <button className="btndelete large-button" onClick={deleteColumn}>Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteCardPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Êtes-vous sûr de vouloir archiver cette carte ?</h3>
              <div className="form-actions">
                <button className="btncancel large-button" onClick={() => setShowDeleteCardPopup(false)}>Annuler</button>
                <button className="btnarchive large-button" onClick={archiveCard}>Archiver</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default ManagementPanel;