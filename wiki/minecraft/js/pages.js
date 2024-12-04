window.onload = () => {

    // Display WIKI_MINECRAFT.highlights as carousell
    const allPagesSection = document.getElementsByClassName("section-all-pages")[0];

    if (WIKI_MINECRAFT && WIKI_MINECRAFT.categories && WIKI_MINECRAFT.wikipages) {

        let uniqueCategories = {};

        for (const wikiPage of WIKI_MINECRAFT.wikipages) {

            if (Object.keys(WIKI_MINECRAFT.categories).includes(wikiPage.category)) {

                if (Object.keys(uniqueCategories).includes(wikiPage.category)) {
                    uniqueCategories[wikiPage.category].push(wikiPage);
                } else {
                    uniqueCategories[wikiPage.category] = [wikiPage];
                }

            }
        }

        for (const [categoryName, categoryPages] of Object.entries(uniqueCategories)) {

            const categoryData = WIKI_MINECRAFT.categories[categoryName]

            const wikiCategoryWrapper = document.createElement("div");
            wikiCategoryWrapper.classList.add("wiki-category-wrapper");

                const wikiCategoryTitle = document.createElement("div");
                wikiCategoryTitle.classList.add("wiki-category-title-container");

                    const wikiCategoryIcon = document.createElement("img");
                    wikiCategoryIcon.classList.add("wiki-category-title-image");
                    wikiCategoryIcon.src = categoryData.icon;
                    wikiCategoryIcon.alt = "";

                    const wikiCategoryName = document.createElement("p");
                    wikiCategoryName.classList.add("wiki-category-name");
                    wikiCategoryName.innerText = categoryData.name;

                wikiCategoryTitle.appendChild(wikiCategoryIcon);
                wikiCategoryTitle.appendChild(wikiCategoryName);
                

                const wikiCategoryInnerWrapper = document.createElement("div");
                wikiCategoryInnerWrapper.classList.add("wiki-category-inner-wrapper");

                for (const categoryPage of categoryPages) {

                    const categoryPageLink = document.createElement("a");
                    const categoryPageLink_href = `/wiki/minecraft/-/${categoryPage.category}/${categoryPage.name}.json`;
                    if (categoryData.viewer) {
                        categoryPageLink.href = `${categoryData.viewer}?data=${encodeURIComponent(categoryPageLink_href)}`;
                    } else {
                        categoryPageLink.href = categoryPageLink_href;
                    }
                    categoryPageLink.alt = `WikiPage.${categoryPage.name}`;
                    categoryPageLink.innerText = categoryPage.name;

                    wikiCategoryInnerWrapper.appendChild(categoryPageLink);

                }

                wikiCategoryWrapper.appendChild(wikiCategoryTitle);
                wikiCategoryWrapper.appendChild(wikiCategoryInnerWrapper);
            
            allPagesSection.appendChild(wikiCategoryWrapper);

        }
    }

    processProfileLinks(document.getElementsByTagName("body")[0],"wiki_minecraft");

};