// Configuration
const HOVER_OPEN_VERTICAL_NAVBAR = false;

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const currentPath = window.location.pathname;
  
  // Check if we're in a Minecraft-related section
  const isMinecraftSection = currentPath.includes('/projects/minecraft/') || currentPath.includes('/downloads/resourcepacks');
  
  header.innerHTML = `
    <nav class="header-nav">
      <div class="header-logo ${currentPath === '/' || currentPath === '/index.html' ? 'no-link' : ''}">
        ${currentPath === '/' || currentPath === '/index.html' 
          ? '<img src="https://sbamboo.github.io/theaxolot77/assets/logo_theaxo77.png" alt="Home" />'
          : '<a href="/index.html"><img src="https://sbamboo.github.io/theaxolot77/assets/logo_theaxo77.png" alt="Home" /></a>'
        }
      </div>
      <button class="nav-toggle">
        <span class="material-icons">chevron_right</span>
      </button>
      <div class="header-links">
        <a href="/index.html" class="header-link ${currentPath === '/' || currentPath === '/index.html' ? 'active' : ''}">Home</a>
        <a href="/articles/index.html" class="header-link ${currentPath.includes('/articles/') ? 'active' : ''}">Articles</a>
        <div class="dropdown">
          <button class="header-link dropdown-button ${isMinecraftSection ? 'active' : ''}">
            Minecraft
            <span class="dropdown-arrow material-icons">expand_more</span>
          </button>
          <div class="dropdown-content">
            <a href="/projects/minecraft/theaxolot77_server/index.html" class="dropdown-item">Server</a>
            <a href="https://sbamboo.github.io/mcc-web/" class="dropdown-item" target="_blank" rel="noopener noreferrer">
              MCC Installer
              <svg class="external-link-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 3.5H3.5M8.5 3.5L3 9M8.5 3.5V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <a href="/downloads/resourcepacks.html" class="dropdown-item">Resource Packs</a>
            <a href="/wiki/minecraft/index.html" class="dropdown-item">Wiki</a>
          </div>
        </div>
        <a href="/projects/index.html" class="header-link ${!isMinecraftSection && currentPath.includes('/projects') ? 'active' : ''}">Projects</a>
      </div>
      <div class="header-right">
        <a href="https://github.com/sbamboo" class="header-link github-link" target="_blank" rel="noopener noreferrer">
          <svg class="github-icon" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
          </svg>
        </a>
        <div class="header-vertical-divider"></div>
        <button class="display-mode-toggle" id="display-mode-toggle">
          <span class="material-icons">light_mode</span>
        </button>
      </div>
    </nav>
    <div class="header-hover-area"></div>
  `;

  // Mobile navigation functionality
  const nav = document.querySelector('.header-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const dropdowns = document.querySelectorAll('.dropdown');

  // Toggle navigation
  navToggle.addEventListener('click', () => {
    if (!HOVER_OPEN_VERTICAL_NAVBAR || window.innerWidth > 591) {
      nav.classList.toggle('expanded');
    }
  });

  if (HOVER_OPEN_VERTICAL_NAVBAR) {
    nav.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 591) {
        nav.classList.add('expanded');
      }
    });

    nav.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 591) {
        nav.classList.remove('expanded');
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
      }
    });
  }

  // Handle dropdowns in mobile view
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.dropdown-button');
    button.addEventListener('click', (e) => {
      if (window.innerWidth <= 591) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      }
    });
  });

  // Close expanded nav when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 591 && !nav.contains(e.target) && !HOVER_OPEN_VERTICAL_NAVBAR) {
      nav.classList.remove('expanded');
      dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    }
  });

  // Handle window resize
  let timeout;
  window.addEventListener('resize', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (window.innerWidth > 591) {
        nav.classList.remove('expanded');
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
      }
    }, 100);
  });
});