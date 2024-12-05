import { renderMarkdown } from '/js/utils/markdownRenderer.js';

window.onload = () => {

    // Check if we have hashing
    const wikiContainer = document.getElementsByClassName("wiki-container")[0];
    const wikipageContainer = document.getElementsByClassName("wikipage-container")[0];

    const fragment = decodeURIComponent(window.location.hash.substring(1));
    
    if (fragment) {
        wikiContainer.style.display = "none";
        wikipageContainer.style.display = "block";

        let markdownPath = window.location.href;

        if (!markdownPath.endsWith('/')) {
            // Split the URL by "/" and remove the last segment
            const segments = markdownPath.split("#")[0].split('/');
            segments.pop();
            // Join the segments back together with "/"
            markdownPath = segments.join('/');
        }

        markdownPath += '/pages/'+fragment+'/page.json';

        let valid = true;

        fetch(markdownPath)
            .then(response => {
                if (!response.ok) {
                    alert(`Could not fetch the pagedata: ${response.statusText}`);
                    wikipageContainer.style.display = "none";
                    wikiContainer.style.display = "block";
                }
                return response.json();
            })
            .then(pageData => {
                if (valid === true) {
                    const markdown = JSON.stringify(pageData);
                    const html = renderMarkdown(markdown);
                    wikipageContainer.innerHTML = html;
                }
            })
            .catch(error => {
                valid = false;
                alert(`${error.message}`);
                wikipageContainer.style.display = "none";
                wikiContainer.style.display = "block";
            });

    } else {
        wikiContainer.style.display = "block";
        wikipageContainer.style.display = "none";

        // Display WIKI_MINECRAFT.highlights as carousell
        const categoryHighlightsSection = document.getElementsByClassName("section-category-hightlights")[0];

        if (WIKI_MINECRAFT && WIKI_MINECRAFT.categories) {
            for (const categoryHightlightsObject of Object.values(WIKI_MINECRAFT.categories)) {
                // Add header and grid
                const categoryHightlightHeader = document.createElement("h3");
                categoryHightlightHeader.innerText = categoryHightlightsObject.name;
                
                const categoryHightlightsContainer = document.createElement("div");
                categoryHightlightsContainer.classList.add("wiki-category-highlights-grid");

                categoryHighlightsSection.appendChild(categoryHightlightHeader);
                categoryHighlightsSection.appendChild(categoryHightlightsContainer);
                // Add the highlights
                if (categoryHightlightsObject.highlights) {
                    for (const categoryHightlight of categoryHightlightsObject.highlights) {
                        const categoryHightlightContainer = document.createElement("a");
                        categoryHightlightContainer.classList.add("wiki-category-highlight");
                        if (categoryHightlight.href != "") {

                            if (categoryHightlight.href.startsWith("$")) {
                                const [category, page] = categoryHightlight.href.slice(1).split('/');

                                if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                                    const categoryHightlight_href = `/wiki/minecraft/-/${category}/${page}/page.json`;
                                    if (WIKI_MINECRAFT.categories[category].viewer) {
                                        categoryHightlight.href = `${WIKI_MINECRAFT.categories[category].viewer}?data=${encodeURIComponent(categoryHightlight_href)}`;
                                    } else {
                                        categoryHightlight.href = categoryHightlight_href;
                                    }
                                }
                            }

                            categoryHightlight.href = categoryHightlight.href.replace("[AUTO_RETURN]",encodeURIComponent(window.location.href));

                            categoryHightlightContainer.href = categoryHightlight.href;
                        }
                        
                        const categoryHightlightImage = document.createElement("img");
                        if (categoryHightlight.icon.startsWith("$")) {
                            const category = categoryHightlight.icon.slice(1).split("/")[0];
                            if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                                categoryHightlight.icon = `/wiki/minecraft/-/` + categoryHightlight.icon.slice(1);
                            }
                        }
                        categoryHightlightImage.src = categoryHightlight.icon;
                        categoryHightlightImage.alt = categoryHightlight.alt;

                        categoryHightlightContainer.appendChild(categoryHightlightImage);

                        categoryHightlightsContainer.appendChild(categoryHightlightContainer);
                    }
                }
            }
        }
    }

    processProfileLinks(document.getElementsByTagName("body")[0],"wiki_minecraft","wiki_minecraft");
};