import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { useEffect, useState, useCallback } from 'react';
import '../styles/management.css';
import '../styles/tv.css';

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
  });
  const [showDeleteColumnPopup, setShowDeleteColumnPopup] = useState(false);
  const [showDeleteCardPopup, setShowDeleteCardPopup] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [cardToDelete, setCardToDelete] = useState({ columnId: null, cardId: null });
  const [loginName, setLoginName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  
  const fetchColumns = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt_token');
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

  const checkClientIp = useCallback(async () => {
    try {
      const response = await fetch('http://87.106.130.160/api/check-ip');
      const data = await response.json();
      if (data.showNamePopup && !nameSubmitted) {
        setShowNamePopup(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'IP:', error);
    }
  }, [nameSubmitted]);

  useEffect(() => {
    checkClientIp();
    fetchColumns();

    const intervalId = setInterval(() => {
      if (!showCardForm && !showEditCardForm) {
        fetchColumns();
      }
    }, 20000); 

    return () => clearInterval(intervalId);
  }, [showCardForm, showEditCardForm, fetchColumns, checkClientIp]);

  useEffect(() => {
    columns.forEach(column => {
      column.cards.forEach(card => {
        const cardElement = document.getElementById(card._id);
        if (cardElement && cardElement.classList.contains('expanded')) {
          cardElement.querySelector('.expand-btn').textContent = 'Réduire';
        }
      });
    });
  }, [columns]);

  const addColumn = async () => {
    const title = prompt('Enter column title:');
    if (!title) return;

    const res = await fetch('http://87.106.130.160/api/columns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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

  const confirmDeleteCard = (columnId, cardId) => {
    setCardToDelete({ columnId, cardId });
    setShowDeleteCardPopup(true);
  };

  const deleteColumn = async () => {
    const id = columnToDelete;
    setShowDeleteColumnPopup(false);
    try {
      await fetch(`http://87.106.130.160/api/columns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
      });

      setColumns(columns.filter((column) => column._id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la colonne:', error);
    }
  };

  const deleteCard = async () => {
    const { columnId, cardId } = cardToDelete;
    setShowDeleteCardPopup(false);
    try {
      await fetch(`http://87.106.130.160/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        }
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
      console.error('Erreur lors de la suppression de la carte:', error);
    }
  };

  const addCard = async () => {
    if (!cardData.title || !cardData.content) {
      alert('Veuillez remplir tous les champs.');
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
    };
  
    try {
      const res = await fetch('http://87.106.130.160/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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
      setCardData({ title: '', content: '', link: '', author: '', status: '', societe: '' });
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
    try {
      const response = await fetch(`http://87.106.130.160/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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
    if (!editCardData.title || !editCardData.content || !editCardData.columnId) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const res = await fetch(`http://87.106.130.160/api/cards/${editCardData.cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
        },
        body: JSON.stringify({
          title: editCardData.title,
          content: editCardData.content,
          link: editCardData.link,
          columnId: editCardData.columnId,
          author: editCardData.author,
          status: editCardData.status,
          societe: editCardData.societe,
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

  const toggleCardExpansion = (cardId) => {
    const cardElement = document.getElementById(cardId);
    if (cardElement) {
      cardElement.classList.toggle('expanded');
      const expandBtn = cardElement.querySelector('.expand-btn');
      if (expandBtn) {
        expandBtn.textContent = cardElement.classList.contains('expanded') ? 'Réduire' : 'Développer';
      }
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
      setShowLoginPopup(false);
      setLoginName(username); // Store the login name
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
  
  return (
    <div className="management-panel">
      <button onClick={addColumn}>Add Column</button>
      <div className="columns">
        {columns.map((column) => (
          <div
            key={column._id}
            className="column"
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
              <button
                onClick={() => {
                  setCurrentColumnId(column._id);
                  setShowCardForm(true);
                }}
              >
                Add Card +
              </button>
              {column.cards.map((card) => (
                <div
                  key={card._id}
                  id={card._id}
                  className="card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, card._id)}
                >
                  <h4 className="card-title">{card.title}</h4>
                  <button className="expand-btn" onClick={() => toggleCardExpansion(card._id)}>
                    {document.getElementById(card._id) && document.getElementById(card._id).classList.contains('expanded') ? 'Réduire' : 'Développer'}
                  </button>
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
                    <p className="card-author">Auteur : {card.author || '???'}</p>
                  <div className="card-buttons">
                    <button className="btnupdatecard" onClick={() => openEditCardForm(card)}>
                      Update Card
                    </button>
                    <button className="btndeletecard" onClick={() => confirmDeleteCard(column._id, card._id)}>
                      Delete Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
              Auteur :
              <input
                type="text"
                value={cardData.author}
                onChange={(e) => setCardData({ ...cardData, author: e.target.value })}
                placeholder='Auteur de la carte'
              />
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
            <div className="form-actions">
              <button className="btncancel" onClick={() => setShowCardForm(false)}>Annuler</button>
              <button onClick={addCard}>Ajouter</button>
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
              Auteur :
              <input
                type="text"
                value={editCardData.author}
                onChange={(e) => setEditCardData({ ...editCardData, author: e.target.value })}
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
              Société :
              <select
                value={editCardData.societe}
                onChange={(e) => setEditCardData({ ...editCardData, societe: e.target.value })}
              >
                <option value="François">François</option>
                <option value="Thomas">Thomas</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="btncancel" onClick={() => setShowEditCardForm(false)}>Annuler</button>
              <button onClick={updateCard}>Mettre à Jour</button>
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
              <button onClick={handleNameSubmit}>OK</button>
            </div>
          </div>
        </div>
      )}

    {showDeleteColumnPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Êtes-vous sûr de vouloir supprimer cette colonne ?</h3>
              <div className="form-actions">
                <button className="btncancel" onClick={() => setShowDeleteColumnPopup(false)}>Annuler</button>
                <button className="btndelete" onClick={deleteColumn}>Supprimer</button>
              </div>
            </div>
          </div>
        )}

        {showDeleteCardPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h3>Êtes-vous sûr de vouloir supprimer cette carte ?</h3>
              <div className="form-actions">
                <button className="btncancel" onClick={() => setShowDeleteCardPopup(false)}>Annuler</button>
                <button className="btndelete" onClick={deleteCard}>Supprimer</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default ManagementPanel;