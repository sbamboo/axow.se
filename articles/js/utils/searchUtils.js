export function filterArticles(articles, searchTerm, searchMode) {
    if (!searchTerm) return null; // Return null to indicate no filtering needed

    return articles.map(article => {
        let isVisible = false;
        
        if (searchMode === 'keyword' || searchMode === 'key' || searchMode === '1') {
            const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
            const articleTags = article.tags.map(tag => tag.toLowerCase());
            isVisible = searchTerms.some(term => 
                articleTags.some(tag => tag.startsWith(term))
            );
        } else {
            isVisible = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        }

        return { article, isVisible };
    });
}