import { renderWikiPage } from '/wiki/minecraft/js/wikipage.js';

window.onload = () => {

    const params = new URLSearchParams(window.location.search);
    const ret = params.get("ret");
    const back = params.get("back");

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

                    const wikipageWrapper = document.getElementsByClassName("wikipage-wrapper")[0];
                    
                    const wikipageCloser = document.createElement("a");
                    wikipageCloser.href = "/wiki/minecraft/";
                    if (ret) {
                        if (ret == "_pages_" || ret == "_wiki_minecraft_pages_") {
                            wikipageCloser.href = "/wiki/minecraft/pages.html";
                        } else if (ret == "_wiki_minecraft_") {
                            wikipageCloser.href = "/wiki/minecraft/";
                        } else if (ret == "_articles_") {
                            wikipageCloser.href = "/articles/index.html";
                        } else {
                            wikipageCloser.href = decodeURIComponent(ret);
                        }
                    }
                    wikipageCloser.classList.add("return-cross");
                    wikipageCloser.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>`;

                    const wikipageBack = document.createElement("a");
                    if (back) {
                        if (back == "_pages_" || back == "_wiki_minecraft_pages_") {
                            wikipageBack.href = "/wiki/minecraft/pages.html";
                        } else if (back == "_wiki_minecraft_") {
                            wikipageBack.href = "/wiki/minecraft/";
                        } else if (back == "_articles_") {
                            wikipageBack.href = "/articles/index.html";
                        } else {
                            wikipageBack.href = decodeURIComponent(back);
                        }
                        wikipageBack.classList.add("back-arrow");
                        wikipageBack.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M10.828 12l4.95-4.95a.75.75 0 1 0-1.06-1.06L8.22 11.47a.75.75 0 0 0 0 1.06l6.5 6.5a.75.75 0 0 0 1.06-1.06L10.828 12z"/></svg>`;
                    }


                    wikipageContainer.appendChild(wikipageWrapper);
                    wikipageContainer.appendChild(wikipageCloser);
                    if (back) { wikipageContainer.appendChild(wikipageBack); }

                    renderWikiPage(pageData,wikipageWrapper);

                    wikipageContainer.style.display = "block";
                    wikiContainer.style.display = "none";
                    return;
                }
            })
            .catch(error => {
                valid = false;
                if (valid == true) {
                    alert(`${error.message}`);
                    wikipageContainer.style.display = "none";
                    wikiContainer.style.display = "block";
                }
            });

    }

    
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
                                const categoryHightlight_href = `/wiki/minecraft/#${category}/${page}`;
                                categoryHightlight.href = categoryHightlight_href;
                            }
                        }

                        //categoryHightlight.href = categoryHightlight.href.replace("[AUTO_RETURN]",encodeURIComponent(window.location.href));
                        categoryHightlight.href = categoryHightlight.href.replace( /\[AUTO_RETURN\]/g, encodeURIComponent(window.location.href) )

                        categoryHightlightContainer.href = categoryHightlight.href;
                    }
                    
                    const categoryHightlightImage = document.createElement("img");
                    if (categoryHightlight.icon.startsWith("$")) {
                        const category = categoryHightlight.icon.slice(1).split("/")[0];
                        if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                            categoryHightlight.icon = `/wiki/minecraft/pages/` + categoryHightlight.icon.slice(1);
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

    processProfileLinks(document.getElementsByTagName("body")[0],"wiki_minecraft","wiki_minecraft");
};