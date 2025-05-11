/**
 * Card Component
 * Represents a single card in the BeastScan application
 */
const Card = (function() {
  function createCard(data, handlers) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = data.id;
    card.draggable = true;
    
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('dragleave', handleDragLeave);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);
    
    const totalVotes = (data.votes?.up || 0) - (data.votes?.down || 0);
    
    const buttonUrl = data.button?.url || '#';
    const buttonLabel = data.button?.label || 'View Details';
    
    card.innerHTML = `
      <header class="card-header">
        <div class="voting">
          <button class="vote-btn upvote" aria-label="Upvote">
            <i class="fas fa-chevron-up" aria-hidden="true"></i>
          </button>
          <span class="vote-count" aria-live="polite">${totalVotes}</span>
          <button class="vote-btn downvote" aria-label="Downvote">
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
          </button>
        </div>
        <div class="card-actions">
          <button class="edit-btn" aria-label="Edit idea">
            <i class="fas fa-edit" aria-hidden="true"></i>
          </button>
          <button class="delete-btn" aria-label="Delete idea">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </header>
      <div class="card-image">
        <img src="${data.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${data.title}">
      </div>
      <div class="card-content">
        <h3 class="card-title">${data.title}</h3>
        <p class="card-description">${data.description}</p>
        <a href="${buttonUrl}" class="card-button btn primary" target="_blank" rel="noopener noreferrer">
          ${buttonLabel}
        </a>
      </div>
    `;
    
    // Add event listeners
    const upvoteBtn = card.querySelector('.upvote');
    const downvoteBtn = card.querySelector('.downvote');
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    
    // Set initial active state based on userVote
    if (data.userVote === 'up') {
      upvoteBtn.classList.add('active');
    } else if (data.userVote === 'down') {
      downvoteBtn.classList.add('active');
    }
    
    // Add click events with ripple effect
    upvoteBtn.addEventListener('click', (e) => {
      createRippleEffect(e);
      if (handlers.onVote) handlers.onVote(data.id, 'up');
    });
    
    downvoteBtn.addEventListener('click', (e) => {
      createRippleEffect(e);
      if (handlers.onVote) handlers.onVote(data.id, 'down');
    });
    
    // Helper function to create ripple effect
    function createRippleEffect(e) {
      const button = e.currentTarget;
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
      circle.style.top = `${e.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
      circle.classList.add('ripple');
      
      // Remove existing ripples
      const ripple = button.querySelector('.ripple');
      if (ripple) {
        ripple.remove();
      }
      
      button.appendChild(circle);
    }
    
    editBtn.addEventListener('click', () => {
      if (handlers.onEdit) handlers.onEdit(data);
    });
    
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this idea?')) {
        if (handlers.onDelete) handlers.onDelete(data.id);
      }
    });
    
    return card;
  }
  
  function updateCard(cardElement, data) {
    if (!cardElement) return;
    
    const totalVotes = (data.votes?.up || 0) - (data.votes?.down || 0);
    
    const voteCount = cardElement.querySelector('.vote-count');
    if (voteCount) voteCount.textContent = totalVotes;
    
    if (data.title) {
      const titleElement = cardElement.querySelector('.card-title');
      const imgElement = cardElement.querySelector('.card-image img');
      if (titleElement) titleElement.textContent = data.title;
      if (imgElement) imgElement.alt = data.title;
    }
    
    if (data.description) {
      const descElement = cardElement.querySelector('.card-description');
      if (descElement) descElement.textContent = data.description;
    }
    
    if (data.image) {
      const imgElement = cardElement.querySelector('.card-image img');
      if (imgElement) imgElement.src = data.image;
    }
    
    if (data.button) {
      const buttonElement = cardElement.querySelector('.card-button');
      if (buttonElement) {
        if (data.button.label) buttonElement.textContent = data.button.label;
        if (data.button.url) buttonElement.href = data.button.url;
      }
    }
  }
  
  function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
    // Store a reference to the dragged element
    window.draggedElement = this;
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }
  
  function handleDragLeave() {
    this.classList.remove('drag-over');
  }
  
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation(); // Stop the event from propagating to parent elements
    
    this.classList.remove('drag-over');
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const targetId = this.dataset.id;
    
    if (draggedId && targetId && draggedId !== targetId) {
      console.log('Dropping card', draggedId, 'onto', targetId);
      
      // Create a custom event with the drag information
      const dropEvent = new CustomEvent('card:reorder', {
        bubbles: true, // Allow the event to bubble up to parent elements
        cancelable: true,
        detail: {
          draggedId,
          targetId
        }
      });
      
      // Dispatch the event from the container element to ensure it's captured
      const container = document.getElementById('cards-container');
      if (container) {
        container.dispatchEvent(dropEvent);
      } else {
        // Fallback to dispatching from the card itself
        this.dispatchEvent(dropEvent);
      }
    }
    
    return false; // Prevent any default browser drag-drop handling
  }
  
  function handleDragEnd() {
    this.classList.remove('dragging');
    
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('drag-over');
    });
    
    // Clean up the global reference
    window.draggedElement = null;
  }
  
  return {
    create: createCard,
    update: updateCard
  };
})();
