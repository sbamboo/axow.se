import { initDisplayMode } from './utils/displayMode.js';
import { applyDoodleBackground } from './profileDoodle.js';

async function loadProfile() {
  const profilePath = window.location.pathname;
  const profileName = profilePath.split('/').slice(-2)[0];
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('ret');
  const requestedSections = params.get('sections')?.split(',').filter(Boolean) || [];

  try {
    const response = await fetch(`profile.json`);
    if (!response.ok) {
      throw new Error(`Failed to load profile: ${response.statusText}`);
    }
    const profileData = await response.json();

    // Apply the doodle background
    applyDoodleBackground(profileData.name);

    await displayProfile(profileData, requestedSections);
    setupReturnButton(returnUrl);
  } catch (error) {
    console.error('Error loading profile:', error);
    document.getElementById('profile-content').innerHTML =
      '<div class="error">Failed to load profile</div>';
  }
}

async function displayProfile(profile, requestedSections) {
  const content = document.getElementById('profile-content');

  // Create main profile content
  content.innerHTML = `
        <div class="profile-header">
            <img src="${profile.image}" alt="${profile.name}" class="profile-image">
            <div class="profile-info">
                <h1>${profile.name}</h1>
                <span class="profile-title">${profile.title}</span>
            </div>
        </div>
        <div class="profile-description">
            <p>${profile.description}</p>
        </div>
    `;

  // Add requested sections if they exist
  if (profile.sections && requestedSections.length > 0) {
    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'profile-sections';

    requestedSections.forEach(sectionName => {
      if (profile.sections[sectionName]) {
        const section = document.createElement('div');
        section.className = 'profile-section';
        const paragraphs = profile.sections[sectionName].split('\n').map(text => `<p>${text}</p>`).join('');
        section.innerHTML = paragraphs;
        sectionsContainer.appendChild(section);
      }
    });

    if (sectionsContainer.children.length > 0) {
      content.appendChild(sectionsContainer);
    }
  }

  // Add social links if they exist
  if (profile.socials) {
    const socialLinks = document.createElement('div');
    socialLinks.className = 'social-links';

    for (const [platform, url] of Object.entries(profile.socials)) {
      if (url) {
        try {
          const svg = await loadSocialIcon(platform);
          const link = createSocialLink(url, svg);
          socialLinks.appendChild(link);
        } catch (error) {
          console.error(`Failed to load icon for ${platform}:`, error);
        }
      }
    }

    if (socialLinks.children.length > 0) {
      content.appendChild(socialLinks);
    }
  }
}

async function loadSocialIcon(platform) {
  const response = await fetch(`/assets/images/socials/${platform}.svg`);
  if (!response.ok) throw new Error(`Failed to load ${platform} icon`);
  return await response.text();
}

function createSocialLink(url, svg) {
  const link = document.createElement('a');
  link.href = url;
  link.className = 'social-link';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.innerHTML = svg;
  return link;
}

function setupReturnButton(returnUrl) {
  const returnButton = document.getElementById('return-button');
  if (returnUrl) {
    returnButton.href = decodeURIComponent(returnUrl);
  } else {
    returnButton.href = '/index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  initDisplayMode();
});