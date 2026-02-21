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
    'PRB-01',
    'PRB-02'
];

let lockedCard = null;
let currentPreviewCard = null;
// ----------- Global variable(s) end -----------

// Loads all cards in the specified set
async function loadSet(setId) {
    showLoading(`Loading ${setId}...`);
    const url = `https://www.optcgapi.com/api/sets/${setId}/`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Set request failed: ${res.status}`);

        const cards = await res.json(); // expect an array of card objects

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
            
            img.src = card.card_image;

            // Store card data for easy access
            img.dataset.name = card.card_name;
            img.dataset.rarity = card.rarity;
            img.dataset.setId = card.card_set_id;
            img.dataset.price = card.market_price;

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
                if (!lockedCard) {
                    displayPreview(card);
                }
            });

            // Clear image preview when mouse leaves (only clears if no card is locked)
            img.addEventListener('mouseleave', () => {
                if (!lockedCard) {
                    clearPreview();
                }
            });
            
            frag.appendChild(img);
        });

        // Reset state when loading a new set
        clearPreview();
        lockedCard = null;
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

function populateSetDropdown() {
    const controls = document.getElementById('set-controls');
    if (!controls) return;

    // Clear any previous controls
    controls.innerHTML = '';

    const label = document.createElement('label');
    label.htmlFor = 'set-select';
    label.textContent = 'Select set: ';

    const select = document.createElement('select');
    select.id = 'set-select';

    const selectedSet = localStorage.getItem('selectedSet');

    setIds.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = id;

        // For selected set persistence
        if (id === selectedSet) {
            opt.selected = true;
        }

        select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
        localStorage.setItem('selectedSet', e.target.value);
        loadSet(e.target.value);
    });

    controls.appendChild(label);
    controls.appendChild(select);
}

// Make the left panel resizable by dragging the vertical resizer
function initResizer() {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('left-panel');
    const panes = document.querySelector('.panes');
    if (!resizer || !leftPanel || !panes) return;

    const minWidth = 200;
    const maxWidthPct = 0.9; // 90% of window

    function onPointerMove(e) {
        // Checks if user is on desktop or mobile and assigns to clientX accordingly
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const rect = panes.getBoundingClientRect();
        // rect.left = distance from left edge of the screen to start of panes
        let newWidth = clientX - rect.left;
        const maxWidth = window.innerWidth * maxWidthPct;
        // Prevents the panel from getting too big or too small
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
    populateSetDropdown();
    const select = document.getElementById('set-select');
    const defaultSet = select ? select.value : setIds[0];
    loadSet(defaultSet);
    initResizer();
});
