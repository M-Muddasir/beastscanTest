const CardList = (function() {
  let container = null;
  let cards = [];
  let originalCards = [];
  let sortOrder = 'default';
  let handlers = {};
  
  function init(containerId, eventHandlers) {
    container = document.getElementById(containerId);
    handlers = eventHandlers;
    
    container.addEventListener('card:reorder', handleCardReorder);
    
    return {
      render: renderCards,
      setCards: setCards,
      updateCard: updateCard,
      deleteCard: deleteCard,
      addCard: addCard,
      reset: resetCards,
      toggleSort: toggleSortOrder,
      getCards: () => [...cards]
    };
  }
  
  function setCards(cardsData, isOriginal = false) {
    cards = cardsData.map((card, index) => ({
      ...card,
      id: card.id || `card_${index}`,
      votes: card.votes || { up: 0, down: 0 },
      userVote: card.userVote || null
    }));
    
    if (isOriginal) {
      originalCards = JSON.parse(JSON.stringify(cards));
    }
    
    renderCards();
  }
  
  function renderCards() {
    if (!container) return;
    
    container.innerHTML = '';
    
    const sortedCards = sortCards();
    
    sortedCards.forEach(cardData => {
      const cardElement = Card.create(cardData, {
        onVote: (id, voteType) => {
          if (handlers.onVote) handlers.onVote(id, voteType);
        },
        onEdit: (data) => {
          if (handlers.onEdit) handlers.onEdit(data);
        },
        onDelete: (id) => {
          if (handlers.onDelete) handlers.onDelete(id);
        }
      });
      
      container.appendChild(cardElement);
    });
  }
  
  function sortCards() {
    const cardsCopy = [...cards];
    
    if (sortOrder === 'votes') {
      return cardsCopy.sort((a, b) => {
        const aVotes = (a.votes?.up || 0) - (a.votes?.down || 0);
        const bVotes = (b.votes?.up || 0) - (b.votes?.down || 0);
        return bVotes - aVotes;
      });
    }
    
    return cardsCopy;
  }
  
  function toggleSortOrder() {
    sortOrder = sortOrder === 'default' ? 'votes' : 'default';
    renderCards();
    return sortOrder;
  }
  
  function updateCard(id, newData) {
    const cardIndex = cards.findIndex(card => card.id === id);
    
    if (cardIndex === -1) return;
    
    cards[cardIndex] = {
      ...cards[cardIndex],
      ...newData
    };
    
    const cardElement = container.querySelector(`.card[data-id="${id}"]`);
    
    if (cardElement) {
      Card.update(cardElement, cards[cardIndex]);
    }
    
    if (sortOrder === 'votes' && newData.votes) {
      renderCards();
    }
  }
  
  function deleteCard(id) {
    cards = cards.filter(card => card.id !== id);
    
    renderCards();
  }
  
  function addCard(cardData) {
    const newCard = {
      ...cardData,
      id: cardData.id || `card_${Date.now()}`,
      votes: cardData.votes || { up: 0, down: 0 },
      userVote: null
    };
    
    cards.push(newCard);
    
    renderCards();
  }
  
  function resetCards() {
    cards = JSON.parse(JSON.stringify(originalCards));
    
    sortOrder = 'default';
    
    renderCards();
  }
  
  function handleCardReorder(e) {
    const { draggedId, targetId } = e.detail;
    
    const draggedIndex = cards.findIndex(card => card.id === draggedId);
    const targetIndex = cards.findIndex(card => card.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedCard] = cards.splice(draggedIndex, 1);
      
      cards.splice(targetIndex, 0, draggedCard);
      
      renderCards();
      
      if (handlers.onReorder) {
        handlers.onReorder(cards);
      }
    }
  }
  
  return {
    init
  };
})();
