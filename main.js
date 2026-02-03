// Global variables
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
    'OP-13'
];

// Loads all cards in the specified set
async function loadSet(setId) {
    showLoading(`Loading ${setId}...`);
    const url = `https://www.optcgapi.com/api/sets/${setId}/`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Set request failed: ${res.status}`);

        const cards = await res.json(); // expect an array of card objects
        const loadPromises = cards.map(card => new Promise(resolve => {
            const img = document.createElement('img');
            img.className = 'card';
            img.alt = card.card_set_id;
            img.src = card.card_image;

            // Resolve load or error so Promise.all always settles
            img.onload = () => resolve({ img, success: true });
            img.onerror = () => resolve({ img, success: false, card });
        }));

        // Wait for all images to attempt loading (parallel)
        const results = await Promise.all(loadPromises);

        // Append all successfully loaded imgs in one DOM update
        const frag = document.createDocumentFragment();
        results.forEach(r => {
            if (r.success) frag.appendChild(r.img);
            else console.warn('Image failed to load for card:', r.card);
        });

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

    let isResizing = false;
    const minWidth = 200;
    const maxWidthPct = 0.9; // 90% of window

    function onPointerMove(e) {
        if (!isResizing) return;
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const rect = panes.getBoundingClientRect();
        let newWidth = clientX - rect.left;
        const maxWidth = window.innerWidth * maxWidthPct;
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        leftPanel.style.width = newWidth + 'px';
    }

    function stopResize() {
        if (!isResizing) return;
        isResizing = false;
        document.body.style.cursor = '';
        resizer.classList.remove('active');
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', stopResize);
    }

    resizer.addEventListener('mousedown', function (e) {
        e.preventDefault();
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
        resizer.classList.add('active');
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', stopResize);
    });

    // For mobile
    resizer.addEventListener('touchstart', function (e) {
        e.preventDefault();
        isResizing = true;
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
