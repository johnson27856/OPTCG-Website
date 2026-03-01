// ---------- Global variable(s) begin ----------
const setIds = [
    'OP-01',
    'OP-02',
    'OP-03',
    'OP-04',
    'OP-05',
    'OP-06',
    'OP-07',
    'OP-08',
    'OP-09',
    'OP-10',
    'OP-11',
    'OP-12',
    'OP-13',
    'OP14-EB04',
    'EB-01',
    'EB-02',
    'EB-03',
    'PRB-01',
    'PRB-02'
];

let currentSet = null;

let lockedCard = null;
let currentPreviewCard = null;

let allCards = [];
let sortedCards = [];
// ----------- Global variable(s) end -----------

// Loads all cards in the specified set
async function loadSet(setId) {
    showLoading(`Loading ${setId}...`);
    const url = `https://www.optcgapi.com/api/sets/${setId}/`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Set request failed: ${res.status}`);

        const cards = await res.json(); // expect an array of card objects
        allCards = cards;               // all cards in the specified set
        sortedCards = [...allCards];    // makes a shallow copy of allCards

        // const loadPromises = cards.map(card => new Promise(resolve => {
        //     const img = document.createElement('img');
        //     img.className = 'card';
        //     img.alt = card.card_set_id;
        //     img.src = card.card_image;

        //     // Resolve load or error so Promise.all always settles
        //     img.onload = () => resolve({ img, success: true });
        //     img.onerror = () => resolve({ img, success: false, card });
        // }));

        // // Wait for all images to attempt loading (parallel)
        // const results = await Promise.all(loadPromises);

        // // Append all successfully loaded images in one DOM update
        // const frag = document.createDocumentFragment();
        // results.forEach(r => {
        //     if (r.success) frag.appendChild(r.img);
        //     else console.warn('Image failed to load for card:', r.card);
        // });

        const frag = document.createDocumentFragment();

        cards.forEach(card => {
            const img = document.createElement('img');
            img.className = 'card';
            img.alt = card.card_set_id;
            
            /* Native lazy loading acts as a "concurrency limiter"
            by only fetching and loading what is needed */
            img.loading = 'lazy'; 
            
            if (card.card_image == null) {
                img.src = 'assets/images/unable-to-load.png';
            }
            else {
                img.src = card.card_image;
            }

            // Store card data for easy access
            img.dataset.name = card.card_name;
            img.dataset.rarity = card.rarity;
            img.dataset.setId = card.card_set_id;
            img.dataset.price = card.market_price;
            img.dataset.color = card.card_color;
            img.dataset.cost = card.card_cost;

            // Links with css fade-in effect when the image actually loads
            img.onload = () => img.classList.add('loaded');

            // Add click listener to toggle lock/highlight
            img.addEventListener('click', () => {
                if (lockedCard === card) {
                    // Unlock: remove highlight and clear preview
                    lockedCard = null;
                    img.classList.remove('selected');
                    clearPreview();
                }
                else {
                    // Lock: remove highlight from any other card, highlight this one, and show its preview
                    document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
                    img.classList.add('selected');
                    lockedCard = card;
                    displayPreview(card);
                }
            });

            // Add mouse hover listener (only changes preview if no card is locked)
            img.addEventListener('mouseenter', () => {
                img.classList.add('hovered');
                if (!lockedCard) {
                    displayPreview(card);
                }
            });

            // Clear image preview when mouse leaves (only clears if no card is locked)
            img.addEventListener('mouseleave', () => {
                img.classList.remove('hovered');
                if (!lockedCard) {
                    clearPreview();
                }
            });
            
            frag.appendChild(img);
        });

        // Reset state when loading a new set
        clearPreview();
        lockedCard = null;
        currentSet = setId;

        const container = document.getElementById('card-container');
        container.innerHTML = '';
        container.appendChild(frag);
    }
    catch (err) {
        const container = document.getElementById('card-container');
        container.innerHTML = `<p class="error">Failed to load ${setId}: ${err.message}</p>`;
        console.error(err);
    }
}

function displayPreview(card) {
    // Skip image/stats rendering if already showing this card
    if (currentPreviewCard === card) return;

    currentPreviewCard = card;

    const rightPanel = document.getElementById('right-panel');
    if (!rightPanel) return;

    if (card.card_image == null) {
        card.card_image = 'assets/images/unable-to-load.png';
    }
    
    rightPanel.innerHTML = `
        <div class="preview-container">
            <img src="${card.card_image}" alt="${card.card_name}" class="preview-image">
            <div class="card-stats">
                <h2>${card.card_name}</h2>
                <p><strong>Rarity:</strong> ${card.rarity}</p>
                <p><strong>Set-ID:</strong> ${card.card_set_id}</p>
                <div class="price-tag">
                    <p><strong>Market Price:</strong> $${card.market_price}</p>
                </div>
            </div>
        </div>
    `;
}

function clearPreview() {
    currentPreviewCard = null;

    const rightPanel = document.getElementById('right-panel');
    if (!rightPanel) return;

    rightPanel.innerHTML = '';
}

function showLoading(message) {
    const container = document.getElementById('card-container');
    if (!container) return;
    container.innerHTML = '';
    const p = document.createElement('p');
    p.id = 'loading';
    p.textContent = message;
    container.appendChild(p);
}

// Render the given list of cards to the container
function renderCards(cardsToRender) {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    const frag = document.createDocumentFragment();

    cardsToRender.forEach(card => {
        // Recreate the img element (follows loadSet() logic)
        const img = document.createElement('img');
        img.className = 'card';
        img.alt = card.card_set_id;
        img.loading = 'lazy';
        if (card.card_image == null) {
            img.src = 'assets/images/unable-to-load.png';
        }
        else {
            img.src = card.card_image;
        }
        img.dataset.name = card.card_name;
        img.dataset.rarity = card.rarity;
        img.dataset.setId = card.card_set_id;
        img.dataset.price = card.market_price;
        img.dataset.color = card.card_color;
        img.dataset.cost = card.card_cost;

        // Keeps the locked card highlighted
        if (lockedCard === card) {
            img.classList.add('selected');
        }

        img.onload = () => img.classList.add('loaded');

        img.addEventListener('click', () => {
            if (lockedCard === card) {
                lockedCard = null;
                img.classList.remove('selected');
                clearPreview();
            }
            else {
                document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
                img.classList.add('selected');
                lockedCard = card;
                displayPreview(card);
            }
        });

        img.addEventListener('mouseenter', () => {
            img.classList.add('hovered');
            if (!lockedCard) {
                displayPreview(card);
            }
        });

        img.addEventListener('mouseleave', () => {
            img.classList.remove('hovered');
            if (!lockedCard) {
                clearPreview();
            }
        });

        frag.appendChild(img);
    });

    container.appendChild(frag);
}

// Sort cards based on selected criteria
function sortCards(criterion) {
    if (criterion === 'none') {
        renderCards(allCards);
        return;
    }

    // Reset sortedCards to discard previous sorts
    sortedCards = [...allCards]

    sortedCards.sort((a, b) => {
        let aVal, bVal;
        switch (criterion) {
            case 'card_name':
                aVal = a.card_name.toLowerCase();
                bVal = b.card_name.toLowerCase();
                return aVal.localeCompare(bVal);
            case 'rarity':
                aVal = a.rarity.toLowerCase();
                bVal = b.rarity.toLowerCase();
                return aVal.localeCompare(bVal);
            case 'market_price':
                aVal = parseFloat(a.market_price);
                bVal = parseFloat(b.market_price);
                return bVal - aVal;
            case 'card_color':
                aVal = a.card_color.toLowerCase();
                bVal = b.card_color.toLowerCase();
                return aVal.localeCompare(bVal);
            case 'card_cost':
                aVal = parseInt(a.card_cost) || 0;
                bVal = parseInt(b.card_cost) || 0;
                return bVal - aVal;
            default:
                return 0;
        }
    });
    renderCards(sortedCards);
}

function initializeControls() {
    const controls = document.getElementById('set-controls');
    if (!controls) return;

    // Clear the controls div to start fresh
    controls.innerHTML = '';

    // Helper function to create a label + select pair
    function createDropdown(id, labelText, options, defaultValue, changeHandler) {
        const wrapper = document.createElement('div');
        wrapper.className = 'dropdown-group';

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;

        const select = document.createElement('select');
        select.id = id;

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;

            // For selected set persistence
            if (opt.value === defaultValue) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        select.addEventListener('change', changeHandler);

        // Groups the label and select together as one dropdown object
        wrapper.appendChild(label);
        wrapper.appendChild(select);

        controls.appendChild(wrapper);
    }

    // Set dropdown
    const selectedSet = sessionStorage.getItem('selectedSet') || setIds[0];
    const setOptions = setIds.map(id => ({ value: id, text: id }));
    createDropdown('set-select', 'Select set: ', setOptions, selectedSet, (e) => {
        sessionStorage.setItem('selectedSet', e.target.value);
        sortSelect = document.getElementById('sort-select');
        sortSelect.value = 'none';
        loadSet(e.target.value);
    });

    // Sort dropdown
    const sortOptions = [
        { value: 'none', text: '-- Select --' },
        { value: 'card_name', text: 'Name' },
        { value: 'rarity', text: 'Rarity' },
        { value: 'market_price', text: 'Price' },
        { value: 'card_color', text: 'Color' },
        { value: 'card_cost', text: 'Cost' }
    ];
    createDropdown('sort-select', 'Sort by: ', sortOptions, 'none', (e) => {
        sortCards(e.target.value);
    });

    // const label = document.createElement('label');
    // label.htmlFor = 'set-select';
    // label.textContent = 'Select set: ';

    // const select = document.createElement('select');
    // select.id = 'set-select';

    // const selectedSet = localStorage.getItem('selectedSet');

    // setIds.forEach(id => {
    //     const opt = document.createElement('option');
    //     opt.value = id;
    //     opt.textContent = id;

    //     // For selected set persistence
    //     if (id === selectedSet) {
    //         opt.selected = true;
    //     }

    //     select.appendChild(opt);
    // });

    // select.addEventListener('change', (e) => {
    //     localStorage.setItem('selectedSet', e.target.value);
    //     loadSet(e.target.value);
    // });

    // controls.appendChild(label);
    // controls.appendChild(select);
}

// Make the left panel resizable by dragging the vertical resizer
function initResizer() {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('left-panel');
    const panes = document.querySelector('.panes');
    if (!resizer || !leftPanel || !panes) return;

    const minWidth = 220;
    const maxWidthPct = 0.725; // 72.5% of window

    function onPointerMove(e) {
        // Checks if user is on desktop or mobile and assigns to clientX accordingly
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const rect = panes.getBoundingClientRect(); // helps to make the code robust
        /* rect.left = distance from left edge of the screen to start of panes; this
        is used to account for differences caused by scrolling and margins/padding */
        let newWidth = clientX - rect.left;
        const maxWidth = window.innerWidth * maxWidthPct;
        // Prevents the left panel from getting too big or too small
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        leftPanel.style.width = newWidth + 'px';
    }

    function stopResize() {
        document.body.style.cursor = '';
        resizer.classList.remove('active');
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', stopResize);
    }

    // For desktop
    resizer.addEventListener('mousedown', function(e) {
        e.preventDefault();
        document.body.style.cursor = 'ew-resize';
        resizer.classList.add('active');
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', stopResize);
    });

    // For mobile
    resizer.addEventListener('touchstart', function(e) {
        e.preventDefault();
        document.body.style.cursor = 'ew-resize';
        resizer.classList.add('active');
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', stopResize);
    });
}

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initializeControls();
    const select = document.getElementById('set-select');
    const defaultSet = select ? select.value : setIds[0];
    loadSet(defaultSet);
    initResizer();
});
