export function getParentUrl(filepath) {
  try {
      // Check if the input is a valid URL
      let url;
      try {
          url = new URL(filepath);
      } catch (e) {
          url = null; // Not a valid URL, treat as a file path
      }

      if (url) {
          // Handle URL
          url.pathname = url.pathname.replace(/\/$/, ''); // Remove trailing slash if present
          const segments = url.pathname.split('/');
          segments.pop(); // Remove the last segment
          url.pathname = segments.join('/') || '/'; // Rebuild the path or set to root
          return url.toString();
      } else {
          // Handle file path
          filepath = filepath.replace(/\/$/, ''); // Remove trailing slash if present
          const segments = filepath.split(/[/\\]/); // Split by forward or backslash
          segments.pop(); // Remove the last segment
          return segments.join('/') || '/'; // Rebuild the path or set to root
      }
  } catch (error) {
      console.error('Error processing the filepath:', error);
      return null;
  }
}

export async function fetchArticles() {
  // Use the globally defined ARTICLES_INDEX
  const data = window.ARTICLES_INDEX;

  // Fetch and parse metadata for each article
  const articlesWithMetadata = await Promise.all(
    data.articles.map(async (article) => {
      const content = await fetchArticleContent(article.path);
      const { metadata } = parseMetadata(content,article.path);

      // Add category information only if category exists
      if (article.category && data.categories[article.category]) {
        const category = data.categories[article.category];
        metadata.categoryIcon = category.icon;
        metadata.categoryName = category.name;
        metadata.categoryIconUsesTheme = category.icon_uses_theme || false;
      }

      // Fetch author profile if it starts with @
      if (metadata.author.startsWith('@')) {
        const profileData = await fetchProfile(metadata.author);
        metadata.authorImg = profileData.image;
        metadata.authorTitle = profileData.title;
      }

      return {
        ...article,
        ...metadata,
        path: article.path,
      };
    })
  );

  return {
    articles: articlesWithMetadata,
  };
}

export async function fetchProfile(profileName) {
  const response = await fetch(`/profiles/${profileName}/profile.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${profileName}`);
  }
  return await response.json();
}

export async function fetchArticleContent(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${path}`);
  }
  return await response.text();
}

export function parseMetadata(content,path) {
  const metaMatch = content.match(/<p hidden meta>([\s\S]*?)<\/p>/);

  if (!metaMatch) {
    throw new Error('No metadata found in article');
  }

  const metaContent = metaMatch[1];
  const metadata = {};

  metaContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':').map((s) => s.trim());
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim(); // Rejoin value parts to handle URLs with colons
      if (key === 'Tags') {
        metadata.tags = value.split(',').map((t) => t.trim());
      } else {
        if (["Banner","Favicon","CardBackground"].includes(key) && !value.includes("/")) {
          const parentPath = getParentUrl(path);
          value = (parentPath.endsWith("/") ? parentPath : parentPath+"/") + value;
        }
        metadata[key.charAt(0).toLowerCase() + key.slice(1)] = value;
      }
    }
  });

  const markdown = content.replace(/<p hidden meta>[\s\S]*?<\/p>/, '').trim();

  return { metadata, markdown };
}