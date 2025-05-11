
(function() {
  const addButton = document.getElementById('add-idea-btn');
  const sortButton = document.getElementById('sort-btn');
  const resetButton = document.getElementById('reset-btn');
  
  const STORAGE_KEY = 'beastscan_cards';
  const SORT_KEY = 'beastscan_sort_order';
  
  const API_URL = 'https://my.beastscan.com/test-kit';
  
  const cardList = CardList.init('cards-container', {
    onVote: handleVote,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onReorder: handleReorder
  });
  
  const editModal = Modal.init('edit-modal', handleSaveEdit);
  const addModal = Modal.init('add-modal', handleAddCard);
  
  init();
  
  function init() {
    if (addButton) addButton.addEventListener('click', showAddModal);
    if (sortButton) sortButton.addEventListener('click', toggleSortOrder);
    if (resetButton) resetButton.addEventListener('click', resetCards);
    
    const storedCards = loadFromStorage(STORAGE_KEY);
    const sortOrder = loadFromStorage(SORT_KEY);
    
    if (storedCards?.length) {
      cardList.setCards(storedCards);
      
      if (sortOrder) {
        cardList.toggleSort(sortOrder);
      }
    } else {
      fetchCards();
    }
  }

  function updateSortButtonText(sortOrder) {
    sortButton.innerHTML = sortOrder === 'votes' 
      ? '<i class="fas fa-sort-amount-up" aria-hidden="true"></i> Default Order' 
      : '<i class="fas fa-sort-amount-down" aria-hidden="true"></i> Sort by Votes';
  }
  
  /**
   * Fetch cards from API
   */
  function fetchCards() {
    showLoading();
    
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        cardList.setCards(data, true);
        saveToStorage(STORAGE_KEY, cardList.getCards());
        hideLoading();
      })
      .catch(error => {
        console.error('Error fetching cards:', error);
        showError();
      });
  }
  function handleVote(id, voteType) {
    const cards = cardList.getCards();
    const card = cards.find(card => card.id === id);
    
    if (!card) return;
    
    if (card.userVote === voteType) {
      card.votes[voteType] -= 1;
      card.userVote = null;
    } 
    else if (card.userVote) {
      card.votes[card.userVote] -= 1;
      card.votes[voteType] += 1;
      card.userVote = voteType;
    } 
    else {
      card.votes[voteType] += 1;
      card.userVote = voteType;
    }
    
    cardList.updateCard(id, card);
    
    saveToStorage(STORAGE_KEY, cardList.getCards());
  }
  
  function handleEdit(cardData) {
    editModal.setData(cardData);
    editModal.open();
  }
  
  function handleSaveEdit(updatedData) {
    if (!updatedData.id) return;
    
    cardList.updateCard(updatedData.id, updatedData);
    
    saveToStorage(STORAGE_KEY, cardList.getCards());
  }
  
  function showAddModal() {
    addModal.open();
  }
  
  function toggleSortOrder() {
    const currentOrder = loadFromStorage(SORT_KEY, 'default');
    const newOrder = currentOrder === 'votes' ? 'default' : 'votes';
    
    cardList.toggleSort(newOrder);
    
    saveToStorage(SORT_KEY, newOrder);
    
    updateSortButtonText(newOrder);
  }
  
  function updateSortButtonText(sortOrder) {
    if (!sortButton) return;
    
    sortButton.innerHTML = sortOrder === 'votes'
      ? '<i class="fas fa-sort-amount-up" aria-hidden="true"></i> Sort by Default'
      : '<i class="fas fa-sort-amount-down" aria-hidden="true"></i> Sort by Votes';
  }
  
  function resetCards() {
    localStorage.removeItem(STORAGE_KEY);
    
    saveToStorage(SORT_KEY, 'default');
    updateSortButtonText('default');
    
    fetchCards();
  }
  
  function handleAddCard(cardData) {
    const formattedCardData = {
      ...cardData,
      votes: { up: 0, down: 0 },
      button: cardData.button || {
        label: cardData.buttonLabel || 'View Details',
        url: cardData.buttonLink || '#'
      }
    };
    
    if (formattedCardData.buttonLabel) delete formattedCardData.buttonLabel;
    if (formattedCardData.buttonLink) delete formattedCardData.buttonLink;
    
    cardList.addCard(formattedCardData);
    
    saveToStorage(STORAGE_KEY, cardList.getCards());
  }
  
  function handleDelete(id) {
    cardList.deleteCard(id);
    
    saveToStorage(STORAGE_KEY, cardList.getCards());
  }
  
  function handleReorder(reorderedCards) {
    saveToStorage(STORAGE_KEY, reorderedCards);
  }
  
  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  /**
   * Load data from local storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} - Parsed data or default value
   */
  function loadFromStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      
      if (key === SORT_KEY && (data === 'default' || data === 'votes')) {
        return data;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  }
  
  function showLoading() {
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer) cardsContainer.classList.add('hidden');
  }
  
  function hideLoading() {
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer) cardsContainer.classList.remove('hidden');
  }
  
  function showError() {
    console.error('Failed to load data from API');
    alert('Failed to load data. Please try again later.');
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer) cardsContainer.classList.remove('hidden');
  }
  
  window.BeastScanApp = {
    init: function(containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'beastscan-widget';
      
      const widgetHeader = document.createElement('div');
      widgetHeader.className = 'beastscan-widget-header';
      
      const widgetTitle = document.createElement('h3');
      widgetTitle.className = 'beastscan-widget-title';
      widgetTitle.textContent = options.title || 'BeastScan Ideas';
      
      widgetHeader.appendChild(widgetTitle);
      widgetContainer.appendChild(widgetHeader);
      
      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'cards-container';
      cardsContainer.id = `${containerId}-cards`;
      widgetContainer.appendChild(cardsContainer);
      
      const widgetFooter = document.createElement('div');
      widgetFooter.className = 'beastscan-widget-footer';
      
      const widgetFooterText = document.createElement('a');
      widgetFooterText.href = 'https://beastscan.com';
      widgetFooterText.textContent = 'Powered by BeastScan';
      widgetFooterText.target = '_blank';
      widgetFooterText.rel = 'noopener noreferrer';
      
      widgetFooter.appendChild(widgetFooterText);
      widgetContainer.appendChild(widgetFooter);
      
      container.appendChild(widgetContainer);
      
      const widgetCardList = CardList.init(`${containerId}-cards`, {
        onVote: handleVote
      });
      
      let data = mockApiData;
      if (options.limit && options.limit > 0) {
        data = data.slice(0, options.limit);
      }
      
      widgetCardList.setCards(data);
    }
  };
})();
