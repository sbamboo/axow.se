window.onload = async () => {

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
                    if (categoryData.icon.startsWith("$")) {
                        let category = categoryData.icon.slice(1);
                        let extension = "svg";
                        if (category.includes(".")) {
                            [category,extension] = category.split(".");
                        }
                                                
                        if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                            categoryData.icon = `/wiki/minecraft/assets/images/categories/${category}.${extension}`;
                        }
                    }
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
                  
                    // Auto HREF
                    if (!categoryPage.href) {
                        const categoryPageLink_href = `/wiki/minecraft/?ret=_pages_#${categoryPage.category}/${categoryPage.name}`;
                        categoryPageLink.href = categoryPageLink_href;
                    }
                    // Parse HREF
                    else {
                        if (categoryPage.href.startsWith("$")) {
                            const [category, page] = categoryPage.href.slice(1).split('/');

                            if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                                const categoryPage_href = `/wiki/minecraft/?ret=_pages_#${category}/${page}`;
                                categoryPage.href = categoryPage_href;
                            }
                        } else if (categoryPage.href.startsWith("@")) {
                            const profileHtmlMap = await getProfileReplacementHTML(new Set([categoryPage.href]),"wiki_minecraft","wiki_minecraft");
                            const replacementHTML = profileHtmlMap[categoryPage.href];
                            if (replacementHTML.includes('"')) {
                                categoryPage.href = replacementHTML.split('"')[1];
                            }
                        }

                        categoryPageLink.href = categoryPage.href.replace("[AUTO_RETURN]",encodeURIComponent(window.location.href));
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