async function loadPages() {

    const params = new URLSearchParams(window.location.search);
    const filter_group = params.has("filter_group") ? params.get("filter_group").split(",") : [];
    const filter_cat = params.has("filter_cat") ? params.get("filter_cat").split(",") : [];
    const filter_name = params.get("filter_name");

    // Display WIKI_MINECRAFT.highlights as carousell
    const allPagesSection = document.getElementsByClassName("section-all-pages")[0];

    if (WIKI_MINECRAFT && WIKI_MINECRAFT.categories && WIKI_MINECRAFT.wikipages) {

        // Sort highlights by group and category
        let sorted = {};
        for (const [group_id,group] of Object.entries(WIKI_MINECRAFT.wikipages)) {
            
            if (filter_group.length > 0) { if (!filter_group.includes(group_id)) { continue; } }

            if (group.length > 0) {
                if (!sorted[group_id]) {
                    sorted[group_id] = {};
                }

                for (const wikipage of group) {

                    if (filter_cat.length > 0) { if (!filter_cat.includes(wikipage.category)) { continue; } }
                    if (filter_name) { if (!wikipage.name.includes(filter_name)) { continue; } }

                    if (!sorted[group_id][wikipage.category]) {
                        sorted[group_id][wikipage.category] = [wikipage];
                    } else {
                        sorted[group_id][wikipage.category].push(wikipage);
                    }
                }
            }
        }

        if (filter_cat.length > 0 || filter_group.length > 0 || filter_name) {
            const wikiFilterInfo = document.createElement("div");
            wikiFilterInfo.classList.add("wiki-filtering-info");
            if (filter_group.length > 0) {
                wikiFilterInfo.innerHTML += `
                <span>
                    <i>Group Filters:</i>
                    <p>${filter_group.join(", ")}</p>
                </span>
                `;
            }
            if (filter_cat.length > 0) {
                wikiFilterInfo.innerHTML += `
                <span>
                    <i>Category Filters:</i>
                    <p>${filter_cat.join(", ")}</p>
                </span>
                `;
            }
            if (filter_name) {
                wikiFilterInfo.innerHTML += `
                <span>
                    <i>Name Filter:</i>
                    <p>${filter_name}</p>
                </span>
                `;
            }
            wikiFilterClear = document.createElement("button");
            wikiFilterClear.id = "wiki-filtering-clear";
            wikiFilterClear.innerText = "Clear Filters";
            wikiFilterClear.onclick = () => {
                const parsedUrl = new URL(window.location.href);
                parsedUrl.searchParams.delete('filter_cat');
                parsedUrl.searchParams.delete('filter_group');
                window.location.href = parsedUrl.toString();
            };
            wikiFilterInfo.appendChild(wikiFilterClear);
            allPagesSection.appendChild(wikiFilterInfo);
        }

        for (const [group_id, group] of Object.entries(sorted)) {
            let group_name = group_id;
            let group_href = null;
            if (Object.keys(WIKI_MINECRAFT.groups).includes(group_id)) {
                group_name = WIKI_MINECRAFT.groups[group_id].name;
                group_href = WIKI_MINECRAFT.groups[group_id].href;
            }

            const wikiGroupWrapper = document.createElement("div");
            wikiGroupWrapper.classList.add("wiki-group-outer-wrapper");

                const wikiGroupTitle = document.createElement("a");
                wikiGroupTitle.classList.add("wiki-group-title");
                wikiGroupTitle.innerText = (group_name == "_ungrouped_") ? '' : group_name;
                wikiGroupTitle.href = `/wiki/minecraft/pages.html?filter_group=${group_id}`;

                const wikiGroupInnerWrapper = document.createElement("div");
                wikiGroupInnerWrapper.classList.add("wiki-group-wrapper");

                    for (const [category_id,category] of Object.entries(group)) {
                        let category_name = category_id;
                        let category_icon = "";
                        if (Object.keys(WIKI_MINECRAFT.categories).includes(category_id)) {
                            category_name = WIKI_MINECRAFT.categories[category_id].name;
                            category_icon = WIKI_MINECRAFT.categories[category_id].icon;
                        }

                        const wikiCategoryWrapper = document.createElement("div");
                        wikiCategoryWrapper.classList.add("wiki-category-wrapper");

                            const wikiCategoryTitle = document.createElement("div");
                            wikiCategoryTitle.classList.add("wiki-category-title-container");

                                const wikiCategoryIcon = document.createElement("img");
                                wikiCategoryIcon.classList.add("wiki-category-title-image");
                                if (category_icon.startsWith("$")) {
                                    let category = category_icon.slice(1);
                                    let extension = "svg";
                                    if (category.includes(".")) {
                                        [category,extension] = category.split(".");
                                    }
                                                            
                                    if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                                        category_icon = `/wiki/minecraft/assets/images/categories/${category}.${extension}`;
                                    }
                                }
                                wikiCategoryIcon.src = category_icon;
                                wikiCategoryIcon.alt = "";

                                const wikiCategoryName = document.createElement("a");
                                wikiCategoryName.classList.add("wiki-category-name");
                                wikiCategoryName.innerText = category_name;
                                wikiCategoryName.href = `/wiki/minecraft/pages.html?filter_cat=${category_id+filter_cat.join(",")}${(filter_group.length>0) ? "&filter_group="+filter_group.join(",") : ''}`;

                                wikiCategoryTitle.appendChild(wikiCategoryIcon);
                                wikiCategoryTitle.appendChild(wikiCategoryName);


                                const wikiCategoryInnerWrapper = document.createElement("div");
                                wikiCategoryInnerWrapper.classList.add("wiki-category-inner-wrapper");

                                const currentFullUrl = encodeURIComponent(window.location.href);

                                for (const categoryPage of category) {

                                    const categoryPageLink = document.createElement("a");
                                
                                    // Auto HREF
                                    if (!categoryPage.href) {
                                        const categoryPageLink_href = `/wiki/minecraft/?ret=${currentFullUrl}#${categoryPage.category}/${categoryPage.name}`;
                                        categoryPageLink.href = categoryPageLink_href;
                                    }
                                    // Parse HREF
                                    else {
                                        if (categoryPage.href.startsWith("$")) {
                                            const [category, page] = categoryPage.href.slice(1).split('/');

                                            if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                                                const categoryPage_href = `/wiki/minecraft/?ret=${currentFullUrl}#${category}/${page}`;
                                                categoryPage.href = categoryPage_href;
                                            }
                                        } else if (categoryPage.href.startsWith("@")) {
                                            const profileHtmlMap = await getProfileReplacementHTML(new Set([categoryPage.href]),"wiki_minecraft","wiki_minecraft");
                                            const result = profileHtmlMap[categoryPage.href];
                                            const replacementHTML = result[0];
                                            if (replacementHTML.includes('"')) {
                                                categoryPage.href = replacementHTML.split('"')[1];
                                            }
                                        }

                                        //categoryPageLink.href = categoryPage.href.replace("[AUTO_RETURN]",encodeURIComponent(window.location.href));
                                        categoryPageLink.href = categoryPage.href.replace( /\[AUTO_RETURN\]/g, currentFullUrl )
                                    }
                                
                                    categoryPageLink.alt = `WikiPage.${categoryPage.name}`;
                                    categoryPageLink.innerText = categoryPage.name;
                                    

                                    wikiCategoryInnerWrapper.appendChild(categoryPageLink);

                                }

                            wikiCategoryWrapper.appendChild(wikiCategoryTitle);
                            wikiCategoryWrapper.appendChild(wikiCategoryInnerWrapper);
                        
                        wikiGroupInnerWrapper.appendChild(wikiCategoryWrapper);
                    }

                wikiGroupWrapper.appendChild(wikiGroupTitle);
                wikiGroupWrapper.appendChild(wikiGroupInnerWrapper)

            allPagesSection.appendChild(wikiGroupWrapper);
        }

        /*
                

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
                            const result = profileHtmlMap[categoryPage.href];
                            const replacementHTML = result[0];
                            if (replacementHTML.includes('"')) {
                                categoryPage.href = replacementHTML.split('"')[1];
                            }
                        }

                        //categoryPageLink.href = categoryPage.href.replace("[AUTO_RETURN]",encodeURIComponent(window.location.href));
                        categoryPageLink.href = categoryPage.href.replace( /\[AUTO_RETURN\]/g, encodeURIComponent(window.location.href) )
                    }
                  
                    categoryPageLink.alt = `WikiPage.${categoryPage.name}`;
                    categoryPageLink.innerText = categoryPage.name;
                    

                    wikiCategoryInnerWrapper.appendChild(categoryPageLink);

                }

                wikiCategoryWrapper.appendChild(wikiCategoryTitle);
                wikiCategoryWrapper.appendChild(wikiCategoryInnerWrapper);
            
            allPagesSection.appendChild(wikiCategoryWrapper);

        }
        */
    }

    processProfileLinks(document.getElementsByTagName("body")[0],"wiki_minecraft");

};

window.onload = () => { loadPages() };