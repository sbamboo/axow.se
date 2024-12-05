export function renderMarkdown(markdown) {
    let html = markdown;

    // Process code blocks first
    html = html.replace(/```([^`]*?)```/g, (match, code) => {
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Process inline code
    html = html.replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${escapeHtml(code)}</code>`;
    });

    // Process links with titles [text](url "title")
    html = html.replace(/\[([^\]]+)\]\(([^)"]+)(?:\s+"([^"]+)")?\)/g, (match, text, url, title) => {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<a href="${escapeHtml(url)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // Process images ![alt](url "title")
    html = html.replace(/!\[([^\]]*)\]\(([^)"]+)(?:\s+"([^"]+)")?\)/g, (match, alt, url, title) => {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img class="article-image" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"${titleAttr}>`;
    });

    // Process videos [video](url)
    html = html.replace(/\[video\]\(([^)]+)\)/g, (match, url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = extractYoutubeId(url);
            return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            return `<video controls><source src="${escapeHtml(url)}"></video>`;
        }
    });

    // Process details/summary blocks
    html = html.replace(/<details>([\s\S]*?)<\/details>/g, (match, content) => {
        const parts = content.split('<summary>');
        if (parts.length < 2) return match;
        
        const summaryParts = parts[1].split('</summary>');
        if (summaryParts.length < 2) return match;
        
        const summary = summaryParts[0].trim();
        const details = summaryParts[1].trim();
        
        return `<details><summary>${summary}</summary>${renderMarkdown(details)}</details>`;
    });

    // Process numbered lists (must come before unordered lists)
    let inOrderedList = false;
    const lines = html.split('\n');
    const processedLines = lines.map((line, index) => {
        const orderedListMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
        if (orderedListMatch) {
            const [, number, content] = orderedListMatch;
            if (!inOrderedList) {
                inOrderedList = true;
                return `<ol start="${number}"><li>${content}</li>`;
            }
            return `<li>${content}</li>`;
        } else if (inOrderedList && line.trim() === '') {
            inOrderedList = false;
            return '</ol>';
        } else if (inOrderedList) {
            inOrderedList = false;
            return `</ol>${line}`;
        }
        return line;
    });
    if (inOrderedList) {
        processedLines.push('</ol>');
    }
    html = processedLines.join('\n');

    // Process basic markdown
    html = html
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
        .replace(/\n/g, ''); // Nothing since they aren't needed when rendering with browser

    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function extractYoutubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : url;
}