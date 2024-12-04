window.onload = () => {

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
                        
                        console.log(categoryHightlight.href)

                        if (categoryHightlight.href.startsWith("$")) {
                            const [category, page] = categoryHightlight.href.slice(1).split('/');

                            if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                                const categoryHightlight_href = `/wiki/minecraft/-/${category}/${page}.json`;
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