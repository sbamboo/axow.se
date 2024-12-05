import { renderMarkdown } from '/js/utils/markdownRenderer.js';

export async function renderWikiPage(pagedata,container) {
    const markdown = JSON.stringify(pagedata);
    const html = renderMarkdown(markdown);

    container.innerHTML = html;
}