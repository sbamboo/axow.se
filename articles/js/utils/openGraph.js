export async function fetchOpenGraph(url) {
    // Try with proxy first
    try {
        const proxyUrl = `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const text = await response.text();
        const meta = parseOpenGraph(text, url);
        if (meta) return meta;
    } catch (proxyError) {
        console.warn('Proxy fetch failed, trying direct fetch:', proxyError);
    }

    // Try direct fetch as fallback
    try {
        const response = await fetch(url);
        const text = await response.text();
        const meta = parseOpenGraph(text, url);
        if (meta) return meta;
    } catch (directError) {
        console.warn('Direct fetch failed:', directError);
    }

    // If both methods fail, return basic preview
    return {
        title: new URL(url).hostname,
        description: 'Preview unavailable due to CORS policy',
        url: url
    };
}

function parseOpenGraph(html, originalUrl) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const meta = {
            title: getMetaContent(doc, 'og:title') || doc.title || new URL(originalUrl).hostname,
            description: getMetaContent(doc, 'og:description') || getMetaContent(doc, 'description'),
            image: getMetaContent(doc, 'og:image'),
            imageType: getMetaContent(doc, 'og:image:type'),
            imageWidth: getMetaContent(doc, 'og:image:width'),
            imageHeight: getMetaContent(doc, 'og:image:height'),
            type: getMetaContent(doc, 'og:type'),
            url: getMetaContent(doc, 'og:url') || originalUrl
        };

        // Ensure we have at least a title
        if (!meta.title) {
            meta.title = new URL(originalUrl).hostname;
        }

        return meta;
    } catch (error) {
        console.error('Error parsing OpenGraph data:', error);
        return null;
    }
}

function getMetaContent(doc, property) {
    const meta = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
    return meta ? meta.getAttribute('content') : null;
}