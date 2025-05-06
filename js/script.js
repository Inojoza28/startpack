 // Global variables
 let modes = [];
 const STORAGE_KEY = 'startpack_modes';
 let activePopupLinks = null;
 
 // DOM Elements
 const modeNameInput = document.getElementById('modeName');
 const urlContainer = document.getElementById('urlContainer');
 const addUrlBtn = document.getElementById('addUrlBtn');
 const createModeForm = document.getElementById('createModeForm');
 const clearFormBtn = document.getElementById('clearFormBtn');
 const modesList = document.getElementById('modesList');
 const emptyModesMessage = document.getElementById('emptyModesMessage');
 const editModal = document.getElementById('editModal');
 const editModeForm = document.getElementById('editModeForm');
 const editModeId = document.getElementById('editModeId');
 const editModeName = document.getElementById('editModeName');
 const editUrlContainer = document.getElementById('editUrlContainer');
 const editAddUrlBtn = document.getElementById('editAddUrlBtn');
 const closeModalBtn = document.getElementById('closeModalBtn');
 const cancelEditBtn = document.getElementById('cancelEditBtn');
 const siteLaunchModal = document.getElementById('siteLaunchModal');
 
 // Notification Elements
 const notification = document.getElementById('notification');
 const notificationTitle = document.getElementById('notificationTitle');
 const notificationMessage = document.getElementById('notificationMessage');
 const notificationIcon = document.getElementById('notificationIcon');
 
 // Initialize application
 document.addEventListener('DOMContentLoaded', () => {
     loadModesFromStorage();
     renderModesList();
     setupEventListeners();
     
     // Handle ESC key to close modals
     document.addEventListener('keydown', (e) => {
         if (e.key === 'Escape') {
             if (editModal && !editModal.classList.contains('hidden')) {
                 closeEditModal();
             }
             if (siteLaunchModal && !siteLaunchModal.classList.contains('hidden')) {
                 closeSiteLaunchModal();
             }
         }
     });
     
     // Handle clicks outside modals
     document.addEventListener('click', (e) => {
         if (siteLaunchModal && !siteLaunchModal.classList.contains('hidden')) {
             if (!e.target.closest('#siteLaunchModal > div') && !e.target.closest('.launch-btn')) {
                 closeSiteLaunchModal();
             }
         }
     });
 });
 
 // Event Listeners
 function setupEventListeners() {
     // Add URL button
     addUrlBtn.addEventListener('click', addUrlInput);
     
     // Create mode form submission
     createModeForm.addEventListener('submit', handleCreateMode);
     
     // Clear form button
     clearFormBtn.addEventListener('click', clearForm);
     
     // Edit mode form submission
     editModeForm.addEventListener('submit', handleEditMode);
     
     // Modal close buttons
     closeModalBtn.addEventListener('click', closeEditModal);
     cancelEditBtn.addEventListener('click', closeEditModal);

     document.getElementById('modeSearchInput').addEventListener('input', filterModes);
document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);

// Adicione esta linha à função renderModesList() após criar todos os cards
if (document.getElementById('modeSearchInput').value.trim()) {
filterModes(); // Reaplicar filtro atual quando a lista é atualizada
}
     
     // Add URL button in edit modal
     editAddUrlBtn.addEventListener('click', () => addUrlInput(null, editUrlContainer));
 }
 
 // Add a new URL input field
 function addUrlInput(event, targetContainer = urlContainer) {
     const newUrlInput = document.createElement('div');
     newUrlInput.className = 'url-input flex items-center border border-gray-300 rounded-xl overflow-hidden';
     newUrlInput.innerHTML = `
         <span class="bg-gray-50 text-gray-500 px-4 py-3 border-r border-gray-300">
             <i class="fas fa-link"></i>
         </span>
         <input type="url" placeholder="https://exemplo.com" required
             class="flex-grow px-4 py-3 focus:outline-none">
         <button type="button" class="url-remove-btn px-4 py-3 text-red-500 hover:text-red-700 focus:outline-none">
             <i class="fas fa-trash"></i>
         </button>
     `;
     
     targetContainer.appendChild(newUrlInput);
     
     // Add event listener to remove button
     const removeBtn = newUrlInput.querySelector('.url-remove-btn');
     removeBtn.addEventListener('click', () => {
         targetContainer.removeChild(newUrlInput);
         updateRemoveButtonsState(targetContainer);
     });
     
     // Update remove buttons state
     updateRemoveButtonsState(targetContainer);
     
     // Focus the new input
     newUrlInput.querySelector('input').focus();
 }
 
 // Update remove buttons state (disable if only one URL input)
 function updateRemoveButtonsState(container) {
     const removeButtons = container.querySelectorAll('.url-remove-btn');
     const shouldDisable = removeButtons.length <= 1;
     
     removeButtons.forEach(btn => {
         btn.disabled = shouldDisable;
         if (shouldDisable) {
             btn.classList.add('opacity-50', 'cursor-not-allowed');
         } else {
             btn.classList.remove('opacity-50', 'cursor-not-allowed');
         }
     });
 }
 
 // Handle create mode form submission
 function handleCreateMode(event) {
     event.preventDefault();
     
     // Get mode name
     const name = modeNameInput.value.trim();
     
     // Get URLs
     const urlInputs = urlContainer.querySelectorAll('input[type="url"]');
     const urls = Array.from(urlInputs).map(input => input.value.trim()).filter(url => url !== '');
     
     // Validate
     if (!name) {
         showNotification('Atenção', 'Por favor, informe um nome para o modo.', 'warning');
         return;
     }
     
     if (urls.length === 0) {
         showNotification('Atenção', 'Adicione pelo menos uma URL.', 'warning');
         return;
     }
     
     // Create new mode object
     const newMode = {
         id: Date.now().toString(),
         name,
         urls,
         createdAt: new Date().toISOString()
     };
     
     // Add to modes array
     modes.push(newMode);
     
     // Save to localStorage
     saveModesToStorage();
     
     // Render updated list
     renderModesList();
     
     // Clear form
     clearForm();
     
     // Show success notification
     showNotification('Sucesso!', `Modo "${name}" criado com sucesso.`, 'success');
 }
 
 // Handle edit mode form submission
 function handleEditMode(event) {
     event.preventDefault();
     
     const id = editModeId.value;
     const name = editModeName.value.trim();
     
     // Get URLs
     const urlInputs = editUrlContainer.querySelectorAll('input[type="url"]');
     const urls = Array.from(urlInputs).map(input => input.value.trim()).filter(url => url !== '');
     
     // Validate
     if (!name) {
         showNotification('Atenção', 'Por favor, informe um nome para o modo.', 'warning');
         return;
     }
     
     if (urls.length === 0) {
         showNotification('Atenção', 'Adicione pelo menos uma URL.', 'warning');
         return;
     }
     
     // Find and update mode
     const modeIndex = modes.findIndex(mode => mode.id === id);
     if (modeIndex !== -1) {
         modes[modeIndex].name = name;
         modes[modeIndex].urls = urls;
         
         // Save to localStorage
         saveModesToStorage();
         
         // Render updated list
         renderModesList();
         
         // Close modal
         closeEditModal();
         
         // Show success notification
         showNotification('Sucesso!', `Modo "${name}" atualizado com sucesso.`, 'success');
     }
 }
 
 // Clear create mode form
 function clearForm() {
     modeNameInput.value = '';
     
     // Remove all URL inputs except the first one
     const urlInputs = urlContainer.querySelectorAll('.url-input');
     for (let i = 1; i < urlInputs.length; i++) {
         urlContainer.removeChild(urlInputs[i]);
     }
     
     // Clear the first URL input
     const firstUrlInput = urlContainer.querySelector('input[type="url"]');
     if (firstUrlInput) {
         firstUrlInput.value = '';
     }
     
     // Update remove buttons state
     updateRemoveButtonsState(urlContainer);
 }
 
 // Render modes list
 function renderModesList() {
     // Clear current list
     modesList.innerHTML = '';
     
     // Show/hide empty message
     if (modes.length === 0) {
         emptyModesMessage.classList.remove('hidden');
     } else {
         emptyModesMessage.classList.add('hidden');
         
         // Render each mode card
         modes.forEach(mode => {
             const modeCard = createModeCard(mode);
             modesList.appendChild(modeCard);
         });
     }
 }

 // Função para filtrar modos
function filterModes() {
const searchTerm = document.getElementById('modeSearchInput').value.toLowerCase().trim();
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Mostrar/esconder botão limpar
if (searchTerm) {
 clearSearchBtn.classList.remove('hidden');
} else {
 clearSearchBtn.classList.add('hidden');
}

// Filtrar cards de modos
const modeCards = modesList.querySelectorAll('.mode-card');
let hasResults = false;

modeCards.forEach(card => {
 const modeName = card.querySelector('h3').textContent.toLowerCase();
 
 if (modeName.includes(searchTerm)) {
     card.classList.remove('hidden');
     hasResults = true;
 } else {
     card.classList.add('hidden');
 }
});

// Mostrar mensagem se não houver resultados
if (modes.length > 0 && !hasResults) {
    let noResultsMsg = document.getElementById('noSearchResults');
    if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'noSearchResults';
        // Classe atualizada ↓
        noResultsMsg.className = 'col-span-full w-full text-center py-8 text-gray-500';
        noResultsMsg.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <div class="bg-gray-50 p-4 rounded-xl inline-block mb-3">
                    <i class="fas fa-search text-3xl text-gray-400"></i>
                </div>
                <p class="text-lg">Nenhum modo encontrado para "${searchTerm}"</p>
                <p class="text-gray-400 text-sm mt-1">Tente outra palavra-chave</p>
            </div>
        `;
        modesList.appendChild(noResultsMsg);
 } else {
     // Atualizar a mensagem com o termo de busca atual
     noResultsMsg.querySelector('p').textContent = `Nenhum modo encontrado para "${searchTerm}"`;
     noResultsMsg.classList.remove('hidden');
 }
} else {
 // Esconder mensagem de "nenhum resultado" se existir
 const noResultsMsg = document.getElementById('noSearchResults');
 if (noResultsMsg) {
     noResultsMsg.classList.add('hidden');
 }
}

// Mostrar/esconder mensagem "nenhum modo" baseado nos resultados da busca
if (modes.length === 0) {
 emptyModesMessage.classList.remove('hidden');
} else if (searchTerm) {
 emptyModesMessage.classList.add('hidden');
} else {
 emptyModesMessage.classList.add('hidden');
}
}

// Função para limpar a busca
function clearSearch() {
const searchInput = document.getElementById('modeSearchInput');
searchInput.value = '';
filterModes();
searchInput.focus();
}
 
// Função para detectar bloqueio de pop-ups
function detectPopupBlocker() {
 const popup = window.open('about:blank', '_blank');
 
 try {
     // Se o pop-up foi bloqueado, popup será null ou undefined
     if (!popup || popup.closed || typeof popup.closed === 'undefined') {
         showPopupBlockerModal();
         return true;
     }
     
     // Se chegou aqui, o pop-up foi aberto com sucesso
     popup.close();
     return false;
 } catch (e) {
     // Se ocorreu algum erro, provavelmente o pop-up foi bloqueado
     showPopupBlockerModal();
     return true;
 }
}

// Função para mostrar o modal de bloqueio de pop-ups
function showPopupBlockerModal() {
 const popupBlockerModal = document.getElementById('popupBlockerModal');
 popupBlockerModal.classList.remove('hidden');
 
 // Adicionar event listener para o botão de fechar
 document.getElementById('closePopupBlockerModal').addEventListener('click', () => {
     popupBlockerModal.classList.add('hidden');
 });
}

 // Create mode card element
 function createModeCard(mode) {
     const card = document.createElement('div');
     card.className = 'mode-card bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all';
     
     // Format date
     const createdDate = new Date(mode.createdAt);
     const formattedDate = createdDate.toLocaleDateString('pt-BR');
     
     // Choose a random gradient color for the card accent
     const gradients = [
         'from-blue-500 to-indigo-500',
         'from-emerald-500 to-teal-500',
         'from-purple-500 to-pink-500',
         'from-amber-500 to-orange-500',
         'from-cyan-500 to-blue-500'
     ];
     const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
     
     card.innerHTML = `
         <div class="h-2 bg-gradient-to-r ${randomGradient} rounded-t-xl -mt-5 -mx-5 mb-4"></div>
         
         <div class="flex justify-between items-start mb-3">
             <h3 class="text-lg font-bold text-gray-800">${mode.name}</h3>
             <span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">${formattedDate}</span>
         </div>
         
         <div class="mb-4">
             <p class="text-sm text-gray-600 mb-2">${mode.urls.length} site${mode.urls.length !== 1 ? 's' : ''} incluído${mode.urls.length !== 1 ? 's' : ''}:</p>
             <div class="flex flex-wrap gap-1.5">
                 ${mode.urls.slice(0, 3).map(url => {
                     // Extract domain from URL
                     try {
                         const domain = new URL(url).hostname;
                         return `<span class="site-badge text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center">
                             <span class="w-2 h-2 bg-${randomGradient.split('-')[1]} rounded-full mr-1.5"></span>
                             ${domain}
                         </span>`;
                     } catch {
                         return `<span class="site-badge text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center">
                             <span class="w-2 h-2 bg-${randomGradient.split('-')[1]} rounded-full mr-1.5"></span>
                             ${url}
                         </span>`;
                     }
                 }).join('')}
                 ${mode.urls.length > 3 ? `<span class="site-badge text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">+${mode.urls.length - 3} mais</span>` : ''}
             </div>
         </div>
         
         <div class="flex justify-between items-center pt-2 border-t border-gray-100">
             <button data-id="${mode.id}" class="launch-btn btn-primary text-white text-sm font-medium py-2 px-4 rounded-lg transition-all flex items-center">
                 <i class="fas fa-rocket mr-1.5"></i> Abrir sites
             </button>
             
             <div class="flex space-x-1">
                 <button data-id="${mode.id}" class="edit-btn bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600 p-2 rounded-lg transition-all">
                     <i class="fas fa-edit"></i>
                 </button>
                 <button data-id="${mode.id}" data-name="${mode.name}" class="delete-btn bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 p-2 rounded-lg transition-all">
                     <i class="fas fa-trash-alt"></i>
                 </button>
             </div>
         </div>
     `;
     
     // Add event listeners
     const launchBtn = card.querySelector('.launch-btn');
     const editBtn = card.querySelector('.edit-btn');
     const deleteBtn = card.querySelector('.delete-btn');
     
     launchBtn.addEventListener('click', () => launchMode(mode));
     editBtn.addEventListener('click', () => openEditModal(mode));
     deleteBtn.addEventListener('click', () => confirmDeleteMode(mode.id, mode.name));
     
     return card;
 }
 
 // Launch mode (open all URLs)
 function launchMode(mode) {
 // Count how many URLs we have
 const urlCount = mode.urls.length;
 
 // Process URLs
 const processedUrls = mode.urls.map(url => {
     // Add https:// if no protocol specified
     if (!url.startsWith('http://') && !url.startsWith('https://')) {
         return 'https://' + url;
     }
     return url;
 });
 
 // Create links to display to the user
 siteLaunchModal.classList.remove('hidden');
 
 const siteLaunchContent = document.getElementById('siteLaunchContent');
 siteLaunchContent.innerHTML = `
     <div class="flex justify-between items-center mb-5">
         <h3 class="text-xl font-bold text-gray-800 flex items-center">
             <div class="icon-circle bg-blue-100 text-blue-600 mr-2 w-8 h-8">
                 <i class="fas fa-rocket"></i>
             </div>
             Modo "${mode.name}"
         </h3>
         <button id="closeLaunchModal" class="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-all">
             <i class="fas fa-times"></i>
         </button>
     </div>
     <p class="text-sm text-gray-600 mb-4">Clique nos links abaixo para abrir os sites:</p>
     <div class="max-h-64 overflow-y-auto mb-4 pr-2">
         <ul class="space-y-2">
             ${processedUrls.map((url, index) => `
                 <li>
                     <a href="${url}" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline flex items-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
                         <span class="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full mr-2">
                             ${index + 1}
                         </span>
                         ${url}
                         <i class="fas fa-external-link-alt ml-auto"></i>
                     </a>
                 </li>
             `).join('')}
         </ul>
     </div>
     <div class="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
         <p class="text-xs text-gray-500">Você pode fechar esta janela depois de abrir os sites</p>
         <button id="openAllBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all flex items-center">
             <i class="fas fa-external-link-alt mr-2"></i> Abrir todos
         </button>
     </div>
 `;
 
 // Add event listeners for modal buttons
 document.getElementById('closeLaunchModal').addEventListener('click', closeSiteLaunchModal);
 
 // Add event listener for "Open All" button
 document.getElementById('openAllBtn').addEventListener('click', () => {
     // Verificar se o navegador bloqueia pop-ups
     const isBlocked = detectPopupBlocker();
     
     if (!isBlocked) {
         // Se não estiver bloqueado, abrir todos os sites
         processedUrls.forEach(url => {
             window.open(url, '_blank');
         });
         closeSiteLaunchModal();
     }
 });
 
 // Store active links for later reference
 activePopupLinks = processedUrls;
}

// Adicionar o estilo floating ao ícone de rocket no header quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
 const rocketIcon = document.querySelector('header .fas.fa-rocket').parentElement;
 rocketIcon.classList.add('floating');
 
 // Adicionar classe card-shimmer a todos os mode-cards quando são renderizados
 const renderModeCardOriginal = createModeCard;
 createModeCard = function(mode) {
     const card = renderModeCardOriginal(mode);
     card.classList.add('card-shimmer');
     return card;
 };
});
 
 // Close site launch modal
 function closeSiteLaunchModal() {
     siteLaunchModal.classList.add('hidden');
     activePopupLinks = null;
 }
 
 // Open edit modal
 function openEditModal(mode) {
     // Fill form with mode data
     editModeId.value = mode.id;
     editModeName.value = mode.name;
     
     // Clear URL container
     editUrlContainer.innerHTML = '';
     
     // Add URL inputs for each URL
     mode.urls.forEach(url => {
         const urlInput = document.createElement('div');
         urlInput.className = 'url-input flex items-center border border-gray-300 rounded-xl overflow-hidden';
         urlInput.innerHTML = `
             <span class="bg-gray-50 text-gray-500 px-4 py-3 border-r border-gray-300">
                 <i class="fas fa-link"></i>
             </span>
             <input type="url" placeholder="https://exemplo.com" value="${url}" required
                 class="flex-grow px-4 py-3 focus:outline-none">
             <button type="button" class="url-remove-btn px-4 py-3 text-red-500 hover:text-red-700 focus:outline-none">
                 <i class="fas fa-trash"></i>
             </button>
         `;
         
         editUrlContainer.appendChild(urlInput);
         
         // Add event listener to remove button
         const removeBtn = urlInput.querySelector('.url-remove-btn');
         removeBtn.addEventListener('click', () => {
             editUrlContainer.removeChild(urlInput);
             updateRemoveButtonsState(editUrlContainer);
         });
     });
     
     // Update remove buttons state
     updateRemoveButtonsState(editUrlContainer);
     
     // Show modal
     editModal.classList.remove('hidden');
 }
 
 // Close edit modal
 function closeEditModal() {
     editModal.classList.add('hidden');
 }
 
 // Confirm delete mode
 function confirmDeleteMode(id, name) {
     if (confirm(`Tem certeza que deseja excluir o modo "${name}"?`)) {
         deleteMode(id);
     }
 }
 
 // Delete mode
 function deleteMode(id) {
     // Find mode
     const modeIndex = modes.findIndex(mode => mode.id === id);
     if (modeIndex !== -1) {
         const modeName = modes[modeIndex].name;
         
         // Remove from array
         modes.splice(modeIndex, 1);
         
         // Save to localStorage
         saveModesToStorage();
         
         // Render updated list
         renderModesList();
         
         // Show success notification
         showNotification('Sucesso!', `Modo "${modeName}" excluído com sucesso.`, 'success');
     }
 }
 
 // Show notification
 function showNotification(title, message, type = 'info') {
     // Set notification content
     notificationTitle.textContent = title;
     notificationMessage.textContent = message;
     
     // Set notification border color based on type
     notification.className = 'notification fixed top-4 right-4 bg-white shadow-lg rounded-xl px-4 py-3 max-w-md z-50 border-l-4';
     
     // Set icon and border color based on type
     switch (type) {
         case 'success':
             notification.classList.add('border-green-500');
             notificationIcon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
             break;
         case 'warning':
             notification.classList.add('border-yellow-500');
             notificationIcon.innerHTML = '<i class="fas fa-exclamation-triangle text-yellow-500"></i>';
             break;
         case 'error':
             notification.classList.add('border-red-500');
             notificationIcon.innerHTML = '<i class="fas fa-times-circle text-red-500"></i>';
             break;
         case 'info':
         default:
             notification.classList.add('border-blue-500');
             notificationIcon.innerHTML = '<i class="fas fa-info-circle text-blue-500"></i>';
             break;
     }
     
     // Show notification
     notification.classList.add('show');
     
     // Auto-hide after 5 seconds
     setTimeout(hideNotification, 5000);
 }
 
 // Hide notification
 function hideNotification() {
     notification.classList.remove('show');
 }
 
 // Load modes from localStorage
 function loadModesFromStorage() {
     const storedModes = localStorage.getItem(STORAGE_KEY);
     if (storedModes) {
         modes = JSON.parse(storedModes);
     }
 }
 
 // Save modes to localStorage
 function saveModesToStorage() {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(modes));
 }
 
 // Scroll to create section
 function scrollToCreateSection() {
     document.getElementById('createSection').scrollIntoView({ behavior: 'smooth' });
 }
 
 // Initialize the first URL input
 addUrlInput();
 
 // Update remove button state for initial URL input
 updateRemoveButtonsState(urlContainer);