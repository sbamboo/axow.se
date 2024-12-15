import { renderWikiPage } from '/wiki/minecraft/js/wikipage.js';
import { getHeaderClickableId } from '/wiki/minecraft/js/wikipage_parsers.js';

async function renderWikiPageWrapper(pageData,wikipageWrapper) {
    await renderWikiPage(pageData,wikipageWrapper)

    // Add headers to totitle
    const totitle = document.querySelector(".wikipage-totitle");
    totitle.innerHTML = ``;

    //// Handle content sections
    const content_sections = wikipageWrapper.querySelectorAll(".wikipage-content-block");
    content_sections.forEach(content_section => {
        // Text
        if (content_section.classList.contains("wikipage-content-text")) {
            const content_section_title = content_section.querySelector("h2");
            if (content_section_title) {
                const [clickableId,clickableObj] = getHeaderClickableId(content_section_title.innerText,totitle,true);
                content_section.id = clickableId;

                const content_section_headers = content_section.querySelectorAll(`#${clickableId} > div > h1, #${clickableId} > div > h2, #${clickableId} > div > h3, #${clickableId} > div > h4, #${clickableId} > div > h5, #${clickableId} > div > h6`);
                content_section_headers.forEach((content_section_header) => {
                    content_section_header.id = getHeaderClickableId(content_section_header.innerText,clickableObj);
                });
            }
        }

        // MediaGrid
        else if (content_section.classList.contains("wikipage-content-mediagrid")) {
            const content_section_title = content_section.querySelector("h2");
            if (content_section_title) {
                content_section.id = getHeaderClickableId(content_section_title.innerText,totitle);
            }
        }

        // Timeline
        else if (content_section.classList.contains("wikipage-content-timeline")) {
            const content_section_title = content_section.querySelector("h2");
            if (content_section_title) {
                const [clickableId,clickableObj] = getHeaderClickableId(content_section_title.innerText,totitle,true);
                content_section.id = clickableId;

                const content_section_items = content_section.querySelectorAll(`.timeline-item`);
                content_section_items.forEach((content_section_item) => {
                    const content_section_item_title = content_section_item.querySelector(".timeline-title");
                    if (content_section_item_title) {
                        content_section_item.id = getHeaderClickableId(content_section_item_title.innerText,clickableObj);
                    }
                });
            }
        }

        // ImgTable
        else if (content_section.classList.contains("wikipage-content-imgtable")) {
            const content_section_title = content_section.querySelector("h2");
            if (content_section_title) {
                content_section.id = getHeaderClickableId(content_section_title.innerText,totitle);
            }
        }
    });

    //// Handle bottom
    const sources_section_header = document.querySelector(".wikipage-sources-header");
    const comment_header = document.querySelector(".wikipage-comment-header");
    sources_section_header.id = getHeaderClickableId(sources_section_header.innerText,totitle);
    comment_header.id = getHeaderClickableId(comment_header.innerText,totitle);
}

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
                    pageData["_sourcefile_"] = markdownPath;

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

                    renderWikiPageWrapper(pageData,wikipageWrapper);

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

        // Sort highlights by group and category
        let sorted = {};
        for (const [category_key,category] of Object.entries(WIKI_MINECRAFT.categories)) {
            if (category.highlights && category.highlights.length > 0) {
                category.highlights.forEach(highlight => {
                    let group = "_ungrouped_";
                    if (highlight.group) {
                        group = highlight.group;
                    }
                    if (!sorted[group]) {
                        sorted[group] = {};
                    }

                    if (!sorted[group][category_key]) {
                        sorted[group][category_key] = [highlight];
                    } else {
                        sorted[group][category_key].push(highlight);    
                    }
                });
            }
        }
        
        const categoryHightlightsHeader = document.createElement("h3");
        categoryHightlightsHeader.innerText = "Category Hightlights"
        categoryHightlightsHeader.classList.add("wiki-category-highlights-title");
        categoryHighlightsSection.appendChild(categoryHightlightsHeader)

        for (const [group_id,group_categories] of Object.entries(sorted)) {
            let group_name = group_id;
            let group_href = null;
            if (Object.keys(WIKI_MINECRAFT.groups).includes(group_id)) {
                group_name = WIKI_MINECRAFT.groups[group_id].name;
                group_href = WIKI_MINECRAFT.groups[group_id].href;
            }

            // Make group-wrapper
            const groupWrapper = document.createElement("div");
            groupWrapper.classList.add("wiki-category-highlights-group");

            // Make group-header
            const groupHeader = document.createElement("a");
            if (group_href == null) {
                groupHeader.href = `/wiki/minecraft/pages.html?filter_group=${group_id}`;
            } else {
                if (group_href.startsWith("$")) {
                    const [category, page] = group_href.slice(1).split('/');
                    if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                        const categoryHightlight_href = `/wiki/minecraft/#${category}/${page}`;
                        group_href = categoryHightlight_href;
                    }
                }
                group_href = group_href.replace( /\[AUTO_RETURN\]/g, encodeURIComponent(window.location.href) )
                groupHeader.href = group_href;
            }
            groupHeader.classList.add("wiki-category-highlights-group-title");
            groupHeader.innerText = (group_name == "_ungrouped_") ? '' : group_name;
            groupWrapper.appendChild(groupHeader);

            // Make group-categories-wrapper
            const groupCategoriesWrapper = document.createElement("div");
            groupCategoriesWrapper.classList.add("wiki-category-highlights-categories");
            groupWrapper.appendChild(groupCategoriesWrapper);

            // Iterate categories
            for (const [category_id,category_highlights] of Object.entries(group_categories)) {
                let category_name = category_id;
                if (Object.keys(WIKI_MINECRAFT.categories).includes(category_id)) {
                    category_name = WIKI_MINECRAFT.categories[category_id].name;
                }

                // Make a category wrapper
                const groupCategoryWrapper = document.createElement("div");

                // Make category header
                const categoryHeader = document.createElement("a");
                categoryHeader.classList.add("wiki-category-highlights-category-title");
                categoryHeader.innerText = category_name;
                categoryHeader.href = `/wiki/minecraft/pages.html?filter_cat=${category_id}`
                groupCategoryWrapper.appendChild(categoryHeader);

                // Make highlights wrapper
                const categoryInnerWrapper = document.createElement("div");
                categoryInnerWrapper.classList.add("wiki-category-highlights-grid");
                groupCategoryWrapper.appendChild(categoryInnerWrapper);

                // Iterate hightlights
                for (const highlightData of category_highlights) {

                    const categoryHightlightContainer = document.createElement("a");
                    categoryHightlightContainer.classList.add("wiki-category-highlight");
                    if (highlightData.href != "") {

                        if (highlightData.href.startsWith("$")) {
                            const [category, page] = highlightData.href.slice(1).split('/');

                            if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                                const highlightData_href = `/wiki/minecraft/#${category}/${page}`;
                                highlightData.href = highlightData_href;
                            }
                        }

                        highlightData.href = highlightData.href.replace( /\[AUTO_RETURN\]/g, encodeURIComponent(window.location.href) )

                        categoryHightlightContainer.href = highlightData.href;
                    }
                    
                    const categoryHightlightImage = document.createElement("img");
                    if (highlightData.icon.startsWith("$")) {
                        const category = highlightData.icon.slice(1).split("/")[0];
                        if (Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                            highlightData.icon = `/wiki/minecraft/pages/` + highlightData.icon.slice(1);
                        }
                    }
                    categoryHightlightImage.src = highlightData.icon;
                    categoryHightlightImage.alt = highlightData.alt;

                    categoryHightlightContainer.appendChild(categoryHightlightImage);

                    categoryInnerWrapper.appendChild(categoryHightlightContainer);
                }

                // Append
                groupCategoriesWrapper.appendChild(groupCategoryWrapper);
            }

            // Append
            categoryHighlightsSection.appendChild(groupWrapper);
        }

        /*
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

        */
    }

    processProfileLinks(document.getElementsByTagName("body")[0],"wiki_minecraft","wiki_minecraft");
};