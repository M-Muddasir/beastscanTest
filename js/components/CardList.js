const CardList = (function() {
  let container = null;
  let cards = [];
  let originalCards = [];
  let sortOrder = 'default';
  let handlers = {};
  
  function init(containerId, eventHandlers) {
    container = document.getElementById(containerId);
    handlers = eventHandlers;
    
    // Ensure we have a container element
    if (!container) {
      console.error('Could not find container element with ID:', containerId);
      return null;
    }
    
    // Add event listener for card reordering
    container.addEventListener('card:reorder', handleCardReorder);
    
    // Make the container accept drop events
    container.addEventListener('dragover', function(e) {
      e.preventDefault(); // Allow drop
      return false;
    });
    
    // Listen for the drop event on the container as well
    container.addEventListener('drop', function(e) {
      e.preventDefault();
      return false;
    });
    
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
    if (!container) {
      console.error('Container element not found');
      return;
    }
    
    // Clear the container
    container.innerHTML = '';
    console.log('Rendering cards, count:', cards.length);
    
    // Get the sorted cards
    const sortedCards = sortCards();
    
    // Create and append each card element
    sortedCards.forEach((cardData, index) => {
      console.log(`Rendering card ${index}:`, cardData.id);
      
      // Create the card element with event handlers
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
      
      // Append to the container
      container.appendChild(cardElement);
    });
    
    // Force a DOM reflow to ensure the UI updates
    container.offsetHeight;
  }
  
  function sortCards() {
    // Create a copy of the cards array to avoid mutating the original
    const cardsCopy = [...cards];
    
    // If sorting by votes, sort by the difference between up and down votes
    if (sortOrder === 'votes') {
      console.log('Sorting cards by votes');
      return cardsCopy.sort((a, b) => {
        const aVotes = (a.votes?.up || 0) - (a.votes?.down || 0);
        const bVotes = (b.votes?.up || 0) - (b.votes?.down || 0);
        return bVotes - aVotes;
      });
    }
    
    // In default mode, respect the current order (which may have been changed by drag and drop)
    console.log('Using manual card order');
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
    e.stopPropagation(); // Prevent event bubbling further
    e.preventDefault(); // Prevent default browser behavior
    
    console.log('Card reorder event received', e.detail);
    const { draggedId, targetId } = e.detail;
    
    // Validation: Ensure both IDs are present and different
    if (!draggedId || !targetId || draggedId === targetId) {
      console.warn('Invalid card reorder operation: missing IDs or same card');
      return;
    }
    
    // Force sortOrder to default to ensure manual ordering is respected
    if (sortOrder !== 'default') {
      sortOrder = 'default';
    }
    
    // Find the indices of both cards
    const draggedIndex = cards.findIndex(card => card.id === draggedId);
    const targetIndex = cards.findIndex(card => card.id === targetId);
    
    console.log('Dragged index:', draggedIndex, 'Target index:', targetIndex);
    
    // Validate that both cards exist
    if (draggedIndex === -1 || targetIndex === -1) {
      console.warn('Card not found in collection');
      return;
    }
    
    // Take a snapshot of the card array before modification
    const cardsBefore = [...cards];
    
    try {
      // Remove the dragged card from the array
      const [draggedCard] = cards.splice(draggedIndex, 1);
      console.log('Removed card:', draggedCard.id, 'from position:', draggedIndex);
      
      // Insert it at the target position
      cards.splice(targetIndex, 0, draggedCard);
      console.log('Inserted at position:', targetIndex);
      
      // Immediately update localStorage via the handler
      if (handlers.onReorder) {
        console.log('Saving reordered cards to localStorage');
        handlers.onReorder([...cards]);
      }
      
      // Force a complete re-render to ensure UI is updated
      requestAnimationFrame(() => {
        renderCards();
        console.log('Cards reordered successfully');
      });
    } catch (error) {
      // If anything fails, restore the original order
      console.error('Error reordering cards:', error);
      cards = cardsBefore;
      renderCards();
    }
  }
  
  return {
    init
  };
})();
