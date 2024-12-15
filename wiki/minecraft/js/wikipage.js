import {
    resolveContent,
    renderResolvedMarkdown,
    renderResolvedText,
    renderCoords,
    renderDatetime,
    renderTimestamp,
    renderResolvedMultivalueBlock,
    renderResolvedMedia,
    renderResolvedTimeline,
    renderResolvedImgTable,
    renderResolvedDatetime,
    getNestedValue,
    mergeFromKeyPath,
    getHeaderClickableId,
    getFirstParentWithClass
} from '/wiki/minecraft/js/wikipage_parsers.js';

const Constants = {
    "markdown": {
        "__axo77_bluemap__": "http://test.bluemap.axow.se/"
    }
};

export async function renderWikiPage(pagedata,container) {
    container.innerHTML = "";
    // Create elements
    const header = document.createElement("header");
    header.classList.add("wikipage-header");
    container.appendChild(header);

        const pathing = document.createElement("span");
        pathing.classList.add("wikipage-header-pathing");
        const current_url = window.location.href.toString();
        let current_url2 = current_url;
        if (current_url2.includes("#")) {
            current_url2 = current_url2.split("#");
            current_url2.pop()
            current_url2 = current_url2.join("#");
        }
        current_url2 = current_url2.split("/");
        current_url2.pop()
        current_url2 = current_url2.join("/");
        console.log(current_url2);
        pathing.innerHTML = "/ ";
        if (pagedata.group) {
            pathing.innerHTML += `<a class="wikipage-header-pathing-group" href="${current_url2 + "/pages.html?filter_group=" + pagedata.group}">${pagedata.group}</a> / `;
        }
        if (pagedata.category) {
            pathing.innerHTML += `<a class="wikipage-header-pathing-category" href="${current_url2 + "/pages.html?filter_cat=" + pagedata.category}">${pagedata.category}</a> / `;
        } else {
            pathing.innerHTML += `... / `;
        }
        if (pagedata.page) {
            pathing.innerHTML += `<a class="wikipage-header-pathing-page" href="${pagedata._sourcefile_}">${pagedata.page}.json</a>`;
        } else {
            pathing.innerHTML += `<a class="wikipage-header-pathing-page" href="${pagedata._sourcefile_}">page.json</a>`;
        }
        header.appendChild(pathing);

        const title = document.createElement("h1");
        title.classList.add("wikipage-header-title");
        header.appendChild(title);

        const shortcuts = document.createElement("div");
        shortcuts.classList.add("wikipage-header-shortcuts")
        header.appendChild(shortcuts);

    const main = document.createElement("main");
    main.classList.add("wikipage-main");
    container.appendChild(main);

        const introduction_section = document.createElement("section");
        introduction_section.classList.add("wikipage-introduction-section");
        main.appendChild(introduction_section);

            const left             = document.createElement("div");
            left.classList.add("wikipage-left");
            introduction_section.appendChild(left);

                const introduction_text = document.createElement("div");
                introduction_text.classList.add("wikipage-introduction-text");
                left.appendChild(introduction_text);
                
                const totitle           = document.createElement("div");
                totitle.classList.add("wikipage-totitle");
                totitle.innerHTML = `<p class="wikipage-totitle-loading">Parsing Wikipage...</p>`;
                left.appendChild(totitle);

            const right              = document.createElement("aside");
            right.classList.add("wikipage-right");
            introduction_section.appendChild(right);

                const infobox       = document.createElement("div");
                infobox.classList.add("wikipage-infobox");
                right.appendChild(infobox);

                const mediainfobox  = document.createElement("div");
                mediainfobox.classList.add("wikipage-mediainfobox");
                right.appendChild(mediainfobox);

        const content_section = document.createElement("section");
        content_section.classList.add("wikipage-content-section");
        main.appendChild(content_section);

        const sources_section = document.createElement("section");
        sources_section.classList.add("wikipage-sources-section");
        main.appendChild(sources_section);

            const sources_section_header = document.createElement("h2");
            sources_section_header.classList.add("wikipage-sources-header");
            sources_section_header.innerText = "Sources";
            sources_section.appendChild(sources_section_header);

        const comment_section = document.createElement("section");
        comment_section.classList.add("wikipage-comment-section");
        main.appendChild(comment_section);

            const comment_header = document.createElement("h2");
            comment_header.classList.add("wikipage-comment-header");
            comment_header.innerText = "Comments";
            comment_section.appendChild(comment_header);

    const footer = document.createElement("footer");
    footer.classList.add("wikipage-footer");
    container.appendChild(footer);

        const page_source = document.createElement("details");
        page_source.classList.add("wikipage-pagesource");
        page_source.innerHTML = `
        <summary>View PageSource (JSON)</summary>
        <pre>${JSON.stringify(pagedata, null, 2)}</pre>
        `;
        footer.appendChild(page_source);

    // Fill content
    //// Fill infobox content
    if (pagedata.infobox) {

        for (let infobox_entry of pagedata.infobox) {

            if (infobox_entry["MERGE:FROM"]) { infobox_entry = mergeFromKeyPath(infobox_entry,pagedata) }

            if (infobox_entry.type == "title") {
                const prepped = await renderResolvedText(infobox_entry.content,pagedata);
                title.innerText = prepped;
                infobox.innerHTML += `
                <div class="wikipage-infobox-title">
                    <h1 class="wikipage-infobox-title-content">${prepped}</h1>
                </div>
                `;
            }

            else if (infobox_entry.type == "banner") {
                const prepped = await resolveContent(infobox_entry.content,pagedata);
                infobox.innerHTML += `
                <div class="wikipage-infobox-banner wikipage-media wikipage-media-image">
                    <figure>
                        <img src="${prepped}" alt="banner image"/>
                        <figcaption class="wikipage-infobox-banner-figcaption"></figcaption>
                    </figure> 
                </div>
                `;
            }

            else if (infobox_entry.type == "banner_source") {
                const prepped = await renderResolvedMarkdown(
                    infobox_entry.content.replace(/__axo77_bluemap__/g,Constants.markdown.__axo77_bluemap__),
                    pagedata
                );
                const figcaptions = infobox.querySelectorAll(".wikipage-infobox-banner-figcaption")
                if (figcaptions && figcaptions.length > 0) {
                    figcaptions[figcaptions.length-1].innerHTML = prepped;
                }
            }

            else if (infobox_entry.type == "attribute") {
                const prepped = await renderResolvedMarkdown(infobox_entry.content,pagedata);
                infobox.innerHTML += `
                <div class="wikipage-infobox-attribute">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                    <div class="wikipage-infobox-attribute-content">${prepped}</div>
                </div>
                `;
            }

            else if (infobox_entry.type == "attributed_profile") {
                const prepped = await renderResolvedText(infobox_entry.profiles.join(", "),pagedata);
                infobox.innerHTML += `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-profile">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                    <p class="wikipage-infobox-attribute-content attributed_profile has_profile_links has_article_links">${prepped}</p>
                </div>
                `;
            }

            else if (infobox_entry.type == "header") {
                const prepped = await renderResolvedText(infobox_entry.content,pagedata);
                infobox.innerHTML += `
                <div class="wikipage-infobox-header">
                    <h2 class="wikipage-infobox-header-content">${prepped}</h2>
                </div>
                `;
            }

            else if (infobox_entry.type == "attributed_location") {
                const prepped = await renderCoords(infobox_entry.content);
                infobox.innerHTML += `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-location">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                    <p class="wikipage-infobox-attribute-content attributed_location">${prepped}</p>
                </div>
                `;
            }

            else if (infobox_entry.type == "named_multivalue_attribute") {
                let content = `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-named-multivalue">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                `;
                for (let entry of infobox_entry.content) {
                    if (entry["MERGE:FROM"]) { entry = mergeFromKeyPath(entry,pagedata) }
                    content += `
                        <div class="wikipage-infobox-attribute-content attributed_named_multivalue">
                            ${await renderResolvedMultivalueBlock(entry,pagedata)}
                        </div>
                    `;
                }
                content += `
                </div>
                `;
                infobox.innerHTML += content;
            }

            else if (infobox_entry.type == "attributed_descripted_profiles") {
                let content = `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-descripted-profiles">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                `;
                for (let entry of infobox_entry.value) {
                    if (entry["MERGE:FROM"]) { entry = mergeFromKeyPath(entry,pagedata) }
                    content += `
                        <div class="wikipage-infobox-attribute-content attributed_descripted_profiles">
                            <p class="attributed_descripted_profiles_profile">${await resolveContent(entry[0],pagedata)}</p>
                            <p class="attributed_descripted_profiles_description">${await renderResolvedText(entry[1],pagedata)}</p>
                        </div>
                    `;
                }
                content += `
                </div>
                `;
                infobox.innerHTML += content;
            }

            else if (infobox_entry.type == "attributed_time") {
                infobox.innerHTML += `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-time">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                    <div class="wikipage-infobox-attribute-content attributed_time">
                        <p class="attributed_time_time wikipage-timestamp">${await renderTimestamp(infobox_entry.time,pagedata)}</p>
                        <div class="attributed_time_desc">${await renderResolvedMarkdown(infobox_entry.description,pagedata)}</div>
                    </div>
                </div>
                `;
            }

        }

    }

    //// Fill sections
    if (pagedata.sections) {

        for (let section_entry of pagedata.sections) {

            if (section_entry["MERGE:FROM"]) { section_entry = mergeFromKeyPath(section_entry,pagedata) }

            if (section_entry.type == "introduction") {
                introduction_text.innerHTML += `
                <div class="wikipage-introduction-text-content">${await renderResolvedMarkdown(section_entry.content,pagedata)}</div>
                `;
            }

            else if (section_entry.type == "text") {
                content_section.innerHTML += `
                <div class="wikipage-content-block wikipage-content-text">
                    <h2>${section_entry.title}</h2>
                    <div>${await renderResolvedMarkdown(section_entry.content,pagedata)}</div>
                </div>
                `;
            }

            else if (section_entry.type == "media_grid") {
                let content = `
                <div class="wikipage-content-block wikipage-content-mediagrid">
                    <h2>${section_entry.title}</h2>
                    <div class="wikipage-mediagrid">
                `;
                for (let entry of section_entry.content) {
                    if (entry["MERGE:FROM"]) { entry = mergeFromKeyPath(entry,pagedata) }
                    content += `
                    <div class="wikipage-mediagrid-block">
                        ${await renderResolvedMedia(entry,pagedata)}
                    </div>
                    `;
                }
                content += `
                    </div>
                </div>
                `;
                content_section.innerHTML += content;
            }

            else if (section_entry.type == "sources") {
                if (section_entry.title && section_entry.title !== "" && section_entry.title !== null) {
                    sources_section_header.innerText = section_entry.title;
                }
                let content = ``;
                for (let entry of section_entry.content) {
                    if (entry["MERGE:FROM"]) { entry = mergeFromKeyPath(entry,pagedata) }
                    content += `
                    <a ${entry.href ? 'href="'+(await resolveContent(entry.href,pagedata))+'"' : ''} class="a-reset wikipage-source-row wikipage-source-row-href wikipage-reference-note">
                        <i class="wikipage-source-row-id wikipage-reference-note-id">${entry.id ? entry.id : ''}.</i>
                        <span class="wikipage-source-row-text wikipage-reference-note-text">${await renderResolvedText(entry.text,pagedata)}</span>
                        <p class="wikipage-source-row-time wikipage-timestamp wikipage-reference-note-time">(${await renderResolvedDatetime(entry.time,pagedata)})</p>
                    </b>
                    `;
                }
                sources_section.innerHTML += content;
            }

            else if (section_entry.type == "timeline") {
                content_section.innerHTML += `
                <div class="wikipage-content-block wikipage-content-timeline">
                    <h2>${section_entry.title}</h2>
                    <div class="wikipage-timeline">
                        ${await renderResolvedTimeline(section_entry.content,pagedata)}
                    </div>
                </div>
                `;
            }

            else if (section_entry.type == "img-table") {
                content_section.innerHTML += `
                <div class="wikipage-content-block wikipage-content-imgtable">
                    <h2>${section_entry.title}</h2>
                    <div class="wikipage-imgtable">
                        ${await renderResolvedImgTable(section_entry.content,pagedata)}
                    </div>
                </div>
                `;
            }

        }

    }

    //// Fill comments
    if (pagedata.comments) {
        for (let comment_entry of pagedata.comments) {
            if (comment_entry["MERGE:FROM"]) { comment_entry = mergeFromKeyPath(comment_entry,pagedata) }
            const result = await resolveContent(comment_entry.by,pagedata,"",true);
            let prepped_profile = null;
            let prepped_profileimg = "/assets/images/default_author.svg";
            if (Array.isArray(result)) {
                const [result_profile,result_profileMap] = result;
                prepped_profile = result_profile;
                const prepped_profiledata = await result_profileMap[Object.keys(result_profileMap)[0]][1].json();
                if (prepped_profiledata.image) {
                    if (!prepped_profiledata.image.includes("/")) {
                        prepped_profileimg = `/profiles/${prepped_profiledata.name.startsWith("@") ? prepped_profiledata.name : "@"+prepped_profiledata.name}/${prepped_profiledata.image}`;
                    } else {
                        prepped_profileimg = prepped_profiledata.image;
                    }
                }
            } else {
                prepped_profile = result;
            }
            comment_section.innerHTML += `
            <div class="wikipage-comment-block">
                <div class="wikipage-comment-heading">
                    <img src="${prepped_profileimg}" alt="${comment_entry.by.startsWith("@") ? comment_entry.by.slice(1) : comment_entry.by}" class="wikipage-comment-profileimg"/>
                    <div class="wikipage-comment-profile">${prepped_profile}</div>
                    <i class="wikipage-comment-posted wikipage-timestamp">${await renderResolvedDatetime(comment_entry.posted,pagedata)}</i>
                </div
                <div class="wikipage-comment-content">
                    ${comment_entry.title ? '<b class="wikipage-comment-title">'+(await renderResolvedText(comment_entry.title,pagedata))+'</b><br>' : ''}
                    <span class="wikipage-comment-main">${await renderResolvedMarkdown(comment_entry.content,pagedata)}</span>
                    ${comment_entry.note ? '<i class="wikipage-comment-note">'+(await renderResolvedText(comment_entry.note,pagedata))+'</i>' : ''}
                </div>
            </div>
            `;
        }
    }
}
