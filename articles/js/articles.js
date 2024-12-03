import { fetchArticles } from './utils/articleLoader.js';
import { filterArticles } from './utils/searchUtils.js';
import { initDisplayMode } from '/js/utils/displayMode.js';

let currentSearchMode = 'name';
let currentSearchTerm = '';
let lastSearchTerm = '';
let articles = [];

async function displayArticles() {
  try {
    if (articles.length === 0) {
      const articlesData = await fetchArticles();
      articles = articlesData.articles;

      // Sort articles by creation date (newest first)
      articles.sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );

      const grid = document.getElementById('articles-grid');
      
      // Group articles
      const groupedArticles = groupArticles(articles);
      
      // Display ungrouped articles first
      if (groupedArticles.ungrouped.length > 0) {
        groupedArticles.ungrouped.forEach(article => {
          const card = createArticleCard(article);
          grid.appendChild(card);
        });
      }

      // Display grouped articles
      for (const [groupId, group] of Object.entries(groupedArticles.groups)) {
        if (group.articles.length > 0) {
          // Create group header
          const groupHeader = document.createElement('div');
          groupHeader.className = 'group-header';
          
          // Fetch and add group icon if it exists
          if (group.icon) {
            fetch(group.icon)
              .then(response => response.text())
              .then(svgContent => {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'group-icon';
                iconContainer.innerHTML = svgContent;
                groupHeader.appendChild(iconContainer);
              })
              .catch(error => console.error('Error loading group icon:', error));
          }

          const groupTitle = document.createElement('h2');
          groupTitle.className = 'group-title';
          groupTitle.textContent = group.name;
          groupHeader.appendChild(groupTitle);
          
          grid.appendChild(groupHeader);

          // Add articles for this group
          group.articles.forEach(article => {
            const card = createArticleCard(article);
            grid.appendChild(card);
          });
        }
      }

      // Only get search params from URL on initial load
      const params = new URLSearchParams(window.location.search);
      currentSearchTerm = params.get('search') || '';
      currentSearchMode = params.get('search_mode') || 'name';

      initializeSearch();
    }

    // Filter and update visibility whenever search term or mode changes
    const filteredResults = filterArticles(
      articles,
      currentSearchTerm,
      currentSearchMode
    );
    updateVisibility(filteredResults);
    lastSearchTerm = currentSearchTerm;
  } catch (error) {
    console.error('Error loading articles:', error);
    const grid = document.getElementById('articles-grid');
    grid.innerHTML = '<div class="error-message">Failed to load articles</div>';
  }
}

function groupArticles(articles) {
  const result = {
    groups: {},
    ungrouped: []
  };

  // Initialize groups from ARTICLES_INDEX
  for (const [groupId, groupInfo] of Object.entries(window.ARTICLES_INDEX.groups)) {
    result.groups[groupId] = {
      name: groupInfo.name,
      icon: groupInfo.icon,
      articles: []
    };
  }

  // Sort articles into groups
  articles.forEach(article => {
    if (article.group && result.groups[article.group]) {
      result.groups[article.group].articles.push(article);
    } else {
      result.ungrouped.push(article);
    }
  });

  // Sort articles within each group by date
  for (const group of Object.values(result.groups)) {
    group.articles.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
  }

  return result;
}

function updateVisibility(filteredResults) {
  if (!filteredResults) {
    document.querySelectorAll('.article-card').forEach((card) => {
      card.classList.remove('hidden');
    });
    return;
  }

  const cards = document.querySelectorAll('.article-card');
  filteredResults.forEach(({ isVisible }, index) => {
    if (isVisible) {
      cards[index].classList.remove('hidden');
    } else {
      cards[index].classList.add('hidden');
    }
  });
}

function initializeSearch() {
  const searchToggle = document.getElementById('search-toggle');
  const searchField = document.getElementById('search-field');
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const searchMode = document.getElementById('search-mode');

  // Show search field if there's a search term
  if (currentSearchTerm) {
    searchField.classList.remove('hidden');
    searchInput.value = currentSearchTerm;
  }

  // Set initial search mode icon
  updateSearchModeIcon();

  // Toggle search field
  searchToggle.addEventListener('click', () => {
    searchField.classList.toggle('hidden');
    if (!searchField.classList.contains('hidden')) {
      searchInput.focus();
    }
  });

  // Handle search input
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      currentSearchTerm = e.target.value;
      updateSearch();
    }, 300);
  });

  // Clear search
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchTerm = '';
    updateSearch();
  });

  // Toggle search mode
  searchMode.addEventListener('click', () => {
    currentSearchMode = currentSearchMode === 'name' ? 'keyword' : 'name';
    updateSearchModeIcon();
    updateSearch();
  });
}

function updateSearchModeIcon() {
  const searchMode = document.getElementById('search-mode');
  const icon = searchMode.querySelector('.material-icons');
  icon.textContent = currentSearchMode === 'name' ? 'sell' : 'key';
}

function updateSearch() {
  const params = new URLSearchParams(window.location.search);
  if (currentSearchTerm) {
    params.set('search', currentSearchTerm);
    params.set('search_mode', currentSearchMode);
  } else {
    params.delete('search');
    params.delete('search_mode');
  }

  const newUrl = `${window.location.pathname}${
    params.toString() ? '?' + params.toString() : ''
  }`;
  window.history.pushState({}, '', newUrl);

  displayArticles();
}

function handleTagClick(tag, event) {
  event.stopPropagation(); // Prevent card click
  const searchField = document.getElementById('search-field');
  const searchInput = document.getElementById('search-input');

  // Show search field if hidden
  searchField.classList.remove('hidden');

  // Set search mode to keyword
  currentSearchMode = 'keyword';
  updateSearchModeIcon();

  // Update search input
  searchInput.value = tag;
  currentSearchTerm = tag;

  // Update search
  updateSearch();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    date
  );
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function createArticleCard(article) {
  const card = document.createElement('div');
  card.className = 'article-card';

  const background = document.createElement('div');
  background.className = 'article-background';
  if (article.cardBackground) {
    background.style.backgroundImage = `url(${article.cardBackground})`;
  }

  const content = document.createElement('div');
  content.className = 'article-content';

  // Add category icon only if it exists
  if (article.categoryIcon && article.categoryName) {
    fetch(article.categoryIcon)
      .then((response) => response.text())
      .then((svgContent) => {
        const categoryIcon = document.createElement('div');
        categoryIcon.className = 'article-category-icon';
        categoryIcon.innerHTML = svgContent;
        content.appendChild(categoryIcon);
      })
      .catch((error) => console.error('Error loading category icon:', error));
  }

  content.innerHTML += `
        <img src="${article.favicon}" alt="" class="article-favicon">
        <h2 class="article-title">${article.title}</h2>
        <div class="article-meta">
            <span class="author">By ${createAuthorLink(article.author)}</span>
            <div class="dates">
                <span class="date">Published: ${formatDate(
                  article.creationDate
                )}</span>
                <span class="updated">Last updated: ${formatDate(
                  article.updatedDate
                )}</span>
            </div>
        </div>
        <div class="tags">
            ${article.tags
              .map(
                (tag) =>
                  `<span class="tag" onclick="window.handleTagClick('${tag}', event)">${tag}</span>`
              )
              .join('')}
        </div>
    `;

  card.appendChild(background);
  card.appendChild(content);

  card.addEventListener('click', (e) => {
    // Only navigate if we didn't click a tag or author link
    if (!e.target.closest('.tag') && !e.target.closest('.author-link')) {
      window.location.href = `viewer.html?md=${encodeURIComponent(
        article.path
      )}&ret=_articles_cross_`;
    }
  });

  return card;
}

function createAuthorLink(author) {
  return author.startsWith('@')
    ? `<a href="/profiles/${author}/index.html?ret=${encodeURIComponent(
        window.location.href
      )}" class="author-link">${author}</a>`
    : `<span>${author}</span>`;
}

// Make handleTagClick available globally
window.handleTagClick = handleTagClick;

document.addEventListener('DOMContentLoaded', () => {
  displayArticles();
  initDisplayMode();
});