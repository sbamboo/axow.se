// Handle display mode changes and persistence
export function initDisplayMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('display_mode') || 'dark';
    setDisplayMode(mode);
    setupDisplayModeToggle();
}

export function setDisplayMode(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    updateDisplayModeParam(mode);
}

export function toggleDisplayMode() {
    const currentMode = document.documentElement.getAttribute('data-theme');
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    setDisplayMode(newMode);
}

function updateDisplayModeParam(mode) {
    const url = new URL(window.location.href);
    url.searchParams.set('display_mode', mode);
    window.history.replaceState({}, '', url);

    // Update all links on the page to include the current display mode
    document.querySelectorAll('a').forEach(link => {
        if (link.href.startsWith(window.location.origin)) {
            const linkUrl = new URL(link.href);
            linkUrl.searchParams.set('display_mode', mode);
            link.href = linkUrl.toString();
        }
    });
}

function setupDisplayModeToggle() {
    const toggle = document.getElementById('display-mode-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            toggleDisplayMode();
            updateToggleIcon();
        });
        updateToggleIcon();
    }
}

function updateToggleIcon() {
    const toggle = document.getElementById('display-mode-toggle');
    if (toggle) {
        const icon = toggle.querySelector('.material-icons');
        const currentMode = document.documentElement.getAttribute('data-theme');
        icon.textContent = currentMode === 'light' ? 'dark_mode' : 'light_mode';
    }
}