const Modal = (function() {
  function init(modalId, onSubmit) {
    const modal = document.getElementById(modalId);
    const closeBtn = modal.querySelector('.close');
    const form = modal.querySelector('form');
    
    closeBtn.addEventListener('click', () => {
      close(modal);
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        close(modal);
      }
    });
    
    if (form && onSubmit) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
          const fieldName = key.split('-').slice(1).join('-');
          data[fieldName] = value;
        }
        
        if (form.id === 'edit-form') {
          data.id = document.getElementById('edit-id').value;
        }
        
        if (data.buttonLabel && data.buttonLink) {
          data.button = {
            label: data.buttonLabel,
            url: data.buttonLink
          };
          
          delete data.buttonLabel;
          delete data.buttonLink;
        }
        
        if (!data.title) data.title = '';
        if (!data.description) data.description = '';
        if (!data.image) data.image = 'https://my.beastscan.com/images/beastscan-qr-code.png';
        
        if (form.id === 'edit-form') {
          const cardId = document.getElementById('edit-id').value;
          
          try {
            const storedCards = JSON.parse(localStorage.getItem('beastscan_cards')) || [];
            const existingCard = storedCards.find(card => card.id === cardId);
            
            if (existingCard && existingCard.votes) {
              data.votes = existingCard.votes;
              data.userVote = existingCard.userVote;
            }
          } catch (error) {
            console.error('Error preserving votes:', error);
          }
        }
        
        if (!data.votes) {
          data.votes = {
            up: 0,
            down: 0
          };
        }
        
        onSubmit(data);
        
        close(modal);
        
        form.reset();
      });
    }
    
    return {
      open: () => open(modal),
      close: () => close(modal),
      setData: (data) => setModalData(modal, data)
    };
  }
  
  function open(modal) {
    modal.style.display = 'block';
    
    setTimeout(() => {
      const firstInput = modal.querySelector('input:not([type="hidden"])');
      if (firstInput) firstInput.focus();
    }, 100);
  }
  
  function close(modal) {
    modal.style.display = 'none';
  }
  
  function setModalData(modal, data) {
    if (!modal || !data) return;
    
    const idField = modal.querySelector('#edit-id');
    if (idField) idField.value = data.id || '';
    
    const titleField = modal.querySelector('#edit-title');
    if (titleField) titleField.value = data.title || '';
    
    const descField = modal.querySelector('#edit-description');
    if (descField) descField.value = data.description || '';
    
    const imageField = modal.querySelector('#edit-image');
    if (imageField) imageField.value = data.image || '';
    
    if (data.button) {
      const buttonLabelField = modal.querySelector('#edit-button-label');
      const buttonLinkField = modal.querySelector('#edit-button-link');
      
      if (buttonLabelField) buttonLabelField.value = data.button.label || '';
      if (buttonLinkField) buttonLinkField.value = data.button.url || '';
    }
  }
  
  return {
    init
  };
})();
