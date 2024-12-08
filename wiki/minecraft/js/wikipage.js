import { renderMarkdown } from '/js/utils/markdownRenderer.js';

import { resolveContent, renderCoords, renderDatetime, renderTimestamp } from '/wiki/minecraft/js/wikipage_parsers.js';

/*
TODO:
  - Render Markdown
  - Render ProfileLinks
  - Render ArticleLink
  - Render Coords
  - Render DATETIME
  - Render <TIME> ( [period => URL,  date => DATETIME] )
  - Render <INFOBOX.named_multivalue_attribute>
  - Render <SECTIONS.mediagrid>
  - Render <SECTIONS.timeline>
  - Render <SECTIONS.imgtable>
  - Resolve SameArticleRetrive (%<path>%)
  - Resolve ArticleAssetFetch  ($<cat>/<art>/<path>)
  - Resolve ArticleFetch       ($<cat>/<art>:<attribute_id>)
*/

const Constants = {
    "markdown": {
        "__axo77_bluemap__": "test.bluemap.axow.se"
    }
};

export async function renderWikiPage(pagedata,container) {
    // Create elements
    const header = document.createElement("header");
    header.classList.add("wikipage-header");
    container.appendChild(header);

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

            const infobox           = document.createElement("aside");
            infobox.classList.add("wikipage-infobox");
            introduction_section.appendChild(infobox);

            const mediainfobox      = document.createElement("aside");
            mediainfobox.classList.add("wikipage-mediainfobox");
            introduction_section.appendChild(mediainfobox);

            const introduction_text = document.createElement("div");
            introduction_text.classList.add("wikipage-introduction-text");
            introduction_section.appendChild(introduction_text);
            
            const totitle           = document.createElement("div");
            totitle.classList.add("wikipage-totitle");
            introduction_section.appendChild(totitle);

        const content_section = document.createElement("section");
        content_section.classList.add("wikipage-content-section");
        main.appendChild(content_section);

        const sources_section = document.createElement("section");
        sources_section.classList.add("wikipage-sources-section");
        main.appendChild(sources_section);

            const sources_section_header = document.createElement("h2");
            sources_section_header.classList.add("wikipage-sources-header")
            sources_section.appendChild(sources_section_header);

        const comment_section = document.createElement("section");
        comment_section.classList.add("wikipage-comment-section");
        main.appendChild(comment_section);

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

        for (const infobox_entry of pagedata.infobox) {

            if (infobox_entry.type == "title") {
                title.innerText = infobox_entry.content;
                infobox.innerHTML += `
                <div class="wikipage-infobox-title">
                    <h3 class="wikipage-infobox-title-content">${infobox_entry.content}</h3>
                </div>
                `;
            }

            else if (infobox_entry.type == "banner") {
                infobox.innerHTML += `
                <div class="wikipage-infobox-banner wikipage-media wikipage-media-image">
                    <figure>
                        <img src="${infobox_entry.content}" alt="banner image"/>
                        <figcaption class="wikipage-infobox-banner-figcaption"></figcaption>
                    </figure> 
                </div>
                `;
            }

            else if (infobox_entry.type == "banner_source") {
                const figcaptions = infobox.querySelectorAll(".wikipage-infobox-banner-figcaption")
                if (figcaptions && figcaptions.length > 0) {
                    figcaptions[figcaptions.length-1].innerText = infobox_entry.content.replace("__axo77_bluemap__",Constants.markdown.__axo77_bluemap__);
                }
            }

            else if (infobox_entry.type == "attribute") {
                infobox.innerHTML += `
                <div class="wikipage-infobox-attribute">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                    <p class="wikipage-infobox-attribute-content">${infobox_entry.content}</p>
                </div>
                `;
            }

            else if (infobox_entry.type == "attributed_profile") {
                infobox.innerHTML += `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-profile">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                    <p class="wikipage-infobox-attribute-content attributed_profile has_profile_links has_article_links">${infobox_entry.profiles}</p>
                </div>
                `;
            }

            else if (infobox_entry.type == "header") {
                infobox.innerHTML += `
                <div class="wikipage-infobox-header">
                    <h2 class="wikipage-infobox-header-content">${infobox_entry.content}</h2>
                </div>
                `;
            }

            else if (infobox_entry.type == "attributed_location") {
                infobox.innerHTML += `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-location">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                    <p class="wikipage-infobox-attribute-content attributed_location">${infobox_entry.content}</p>
                </div>
                `;
            }

            else if (infobox_entry.type == "named_multivalue_attribute") {
                let content = `
                <div class="wikipage-infobox-attribute wikipage-infobox-attribute-named-multivalue">
                    <b class="wikipage-infobox-attribute-title">${infobox_entry.title}</b>
                `;
                for (const entry of infobox_entry.content) {
                    content += `
                        <p class="wikipage-infobox-attribute-content attributed_named_multivalue">${JSON.stringify(entry)}</p>
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
                for (const entry of infobox_entry.value) {
                    content += `
                        <div class="wikipage-infobox-attribute-content attributed_descripted_profiles">
                            <p class="attributed_descripted_profiles_profile">${entry[0]}</p>
                            <p class="attributed_descripted_profiles_description">${entry[1]}</p>
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
                        <p class="attributed_time_time wikipage-timestamp">${infobox_entry.time}</p>
                        <p class="attributed_time_desc">${infobox_entry.description}</p>
                    </div>
                </div>
                `;
            }

        }

    }

    //// Fill sections
    if (pagedata.sections) {

        for (const section_entry of pagedata.sections) {

            if (section_entry.type == "introduction") {
                introduction_text.innerHTML += `
                <pre class="wikipage-introduction-text-content">${section_entry.content}</pre>
                `;
            }

            else if (section_entry.type == "text") {
                content_section.innerHTML += `
                <div class="wikipage-content-block wikipage-content-text">
                    <h3>${section_entry.title}</h3>
                    <pre>${section_entry.content}</pre>
                </div>
                `;
            }

            else if (section_entry.type == "media_grid") {
                let content = `
                <div class="wikipage-content-block wikipage-content-mediagrid">
                    <h3>${section_entry.title}</h3>
                    <div class="wikipage-mediagrid">
                `;
                for (const entry of section_entry.content) {
                    content += `
                    <a class="a-reset wikipage-mediagrid-block">
                        <pre>${JSON.stringify(entry)}</pre>
                    </a>
                    `;
                }
                content += `
                    </div>
                </div>
                `;
                content_section.innerHTML += content;
            }

            else if (section_entry.type == "sources") {
                sources_section_header.innerText = section_entry.title;
                let content = ``;
                for (const entry of section_entry.content) {
                    content += `
                    <a ${entry.href ? 'href="'+entry.href+'"' : ''} class="a-reset wikipage-source-row wikipage-source-row-href">
                        <p class="wikipage-source-row-id">${entry.id ? entry.id : ''}</p>
                        <p class="wikipage-source-row-text">${entry.text}</p>
                        <p class="wikipage-source-row-time wikipage-timestamp">${entry.time}</p>
                    </b>
                    `;
                }
                sources_section.innerHTML += content;
            }

            else if (section_entry.type == "timeline") {
                content_section.innerHTML += `
                <div class="wikipage-content-block wikipage-content-timeline">
                    <h3>${section_entry.title}</h3>
                    <div class="wikipage-timeline">
                        <pre>${JSON.stringify(section_entry.content)}</pre>
                    </div>
                </div>
                `;
            }

            else if (section_entry.type == "img-table") {
                content_section.innerHTML += `
                <div class="wikipage-content-block wikipage-content-imgtable">
                    <h3>${section_entry.title}</h3>
                    <div class="wikipage-imgtable">
                        <pre>${JSON.stringify(section_entry.content)}</pre>
                    </div>
                </div>
                `;
            }

        }

    }

    //// Fill comments
    if (pagedata.comments) {
        for (const comment_entry of pagedata.comments) {
            comment_section.innerHTML += `
            <div class="wikipage-comment-block">
                <div class="wikipage-comment-heading">
                    <img src="/assets/images/default_author.svg" alt="${comment_entry.by.startsWith("@") ? comment_entry.by.slice(1) : comment_entry.by}" class="wikipage-comment-profileimg"/>
                    <b class="wikipage-comment-profile">${comment_entry.by}</b>
                    <i class="wikipage-comment-posted wikipage-timestamp">${comment_entry.posted}</i>
                </div
                <div class="wikipage-comment-content">
                    ${comment_entry.title ? '<b class="wikipage-comment-title">'+comment_entry.title+'</b>' : ''}
                    <pre class="wikipage-comment-main">${comment_entry.content}</pre>
                    ${comment_entry.note ? '<i class="wikipage-comment-note">'+comment_entry.note+'</i>' : ''}
                </div>
            </div>
            `;
        }
    }

}
