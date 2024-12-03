export async function fetchArticles() {
  // Use the globally defined ARTICLES_INDEX
  const data = window.ARTICLES_INDEX;

  // Fetch and parse metadata for each article
  const articlesWithMetadata = await Promise.all(
    data.articles.map(async (article) => {
      const content = await fetchArticleContent(article.path);
      const { metadata } = parseMetadata(content);

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

export function parseMetadata(content) {
  const metaMatch = content.match(/<p hidden meta>([\s\S]*?)<\/p>/);

  if (!metaMatch) {
    throw new Error('No metadata found in article');
  }

  const metaContent = metaMatch[1];
  const metadata = {};

  metaContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':').map((s) => s.trim());
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim(); // Rejoin value parts to handle URLs with colons
      if (key === 'Tags') {
        metadata.tags = value.split(',').map((t) => t.trim());
      } else {
        metadata[key.charAt(0).toLowerCase() + key.slice(1)] = value;
      }
    }
  });

  const markdown = content.replace(/<p hidden meta>[\s\S]*?<\/p>/, '').trim();

  return { metadata, markdown };
}