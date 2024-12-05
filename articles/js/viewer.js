import { fetchArticleContent, parseMetadata } from './utils/articleLoader.js';
import { renderMarkdown } from '/js/utils/markdownRenderer.js';
import { initDisplayMode } from '/js/utils/displayMode.js';

async function displayArticle() {
  const params = new URLSearchParams(window.location.search);
  const mdPath = params.get('md');
  const returnUrl = params.get('ret');
  const returnName = params.get('retname');

  if (!mdPath) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const content = await fetchArticleContent(mdPath);
    const { metadata, markdown } = parseMetadata(content);

    if (returnUrl) {
      if (returnUrl === '_articles_cross_') {
        addCrossButton();
      } else {
        addReturnButton(decodeURIComponent(returnUrl), returnName);
      }
    }

    displayBanner(metadata.banner);
    displayMetadata(metadata);
    displayContent(markdown);
    document.title = metadata.title;
  } catch (error) {
    console.error('Error displaying article:', error);
    const container = document.getElementsByClassName("article-container")[0];
    container.classList.add("article-container-error");
    container.innerHTML = '<div class="error">Failed to load article</div>';
    if (returnUrl) {
      if (returnUrl === '_articles_cross_') {
        addCrossButton();
      } else {
        addReturnButton(decodeURIComponent(returnUrl), returnName);
      }
    }
  }
}

function addReturnButton(returnUrl, returnName) {
  const button = document.createElement('a');
  if (returnUrl === '_articles_') {
    button.href = '/articles/index.html';
  } else {
    button.href = returnUrl;
  }
  button.textContent = returnName || 'See all articles';
  button.className = 'return-button';
  document.body.appendChild(button);
}

async function addCrossButton() {
  const button = document.createElement('a');
  button.href = '/articles/index.html';
  button.className = 'return-cross';
  
  try {
    const response = await fetch('/articles/assets/cross.svg');
    const svgContent = await response.text();
    button.innerHTML = svgContent;
  } catch (error) {
    console.error('Error loading cross icon:', error);
    button.innerHTML = '×';
  }

  const container = document.querySelector('.article-container');
  container.appendChild(button);
}

function displayBanner(bannerUrl) {
  const banner = document.getElementById('article-banner');
  banner.style.backgroundImage = `url(${bannerUrl})`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

async function displayMetadata(metadata) {
  const metaContainer = document.getElementById('article-meta');
  const authorLink = metadata.author.startsWith('@')
    ? `<a href="/profiles/${metadata.author}/index.html?ret=${encodeURIComponent(
        window.location.href
      )}" class="author-link">${metadata.author}</a>`
    : metadata.author;

  let authorImg = metadata.authorImg || '/articles/assets/default_author.svg';
  let authorTitle = metadata.authorTitle || 'Author';

  if (metadata.author.startsWith('@')) {
    try {
      const response = await fetch(`/profiles/${metadata.author}/profile.json`);
      const profileData = await response.json();
      // AuthorImg
      if (metadata.authorImg) {
        authorImg = metadata.authorImg;
      } else {
        authorImg = profileData.image;
      }
      // AuthorTitle
      if (metadata.authorTitle) {
        authorTitle = metadata.authorTitle;
      } else {
        authorTitle = profileData.title;
      }
    } catch (error) {
      console.error('Error fetching author profile:', error);
    }
  }

  metaContainer.innerHTML = `
        <h1>${metadata.title}</h1>
        <div class="author-info">
            <img src="${authorImg}" alt="${metadata.author}" onerror="this.src='/articles/assets/default_author.svg'">
            <div>
                <span class="author-name">${authorLink}</span>
                <span class="author-title">${authorTitle}</span>
            </div>
        </div>
        <div class="dates">
            <span>Published: ${formatDate(metadata.creationDate)}</span>
            <span>Updated: ${formatDate(metadata.updatedDate)}</span>
        </div>
    `;
}

function displayContent(markdown) {
  const content = document.getElementById('article-content');
  const html = renderMarkdown(markdown);
  content.innerHTML = html;
  updateAsyncContent(content);
}

async function updateAsyncContent(contentElem) {
  await processProfileLinks(contentElem.parentElement);
}

document.addEventListener('DOMContentLoaded', () => {
  displayArticle();
  initDisplayMode();
});