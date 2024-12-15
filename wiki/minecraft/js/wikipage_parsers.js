import { renderMarkdown } from '/js/utils/markdownRenderer.js';



function getUniqueHeaderId(name) {
    let selector = `totitle-header-id-${name}`
    const safeSelector = selector.replace(/[^a-zA-Z0-9_-]/g, '_');

    let element = document.querySelector(`#${safeSelector}`);

    let finalSelector = safeSelector;
    let counter = 0;
    while (element) {
        counter++;
        finalSelector = `${safeSelector}-${counter}`;
        element = document.querySelector(`#${finalSelector}`);
    }

    return finalSelector;
}

export function getFirstParentWithClass(element, className) {
    // Traverse up the DOM tree
    while (element !== null) {
      if (element.classList && element.classList.contains(className)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

function addHeaderForParent(name,query,parent) {
    const newchild = document.createElement("button");

    let newid = parent.children.length+1;
    if (parent.classList.contains("totitle-clickable-header")) {
        const parentid = parent.id.replace('totitle-header-', '');
        newid = `${parentid}.${newid-1}`;
    }

    newchild.id = `totitle-header-${newid}`;
    newchild.classList.add("totitle-clickable-header");

    newchild.innerHTML = `
    <div>
        <i>${newid}</i>
        <p>${name}</p>
    </div>
    `;

    newchild.onclick = (event)=>{
        if (getFirstParentWithClass(event.target,"totitle-clickable-header") == newchild) {
            const elem = document.querySelector(`#${query}`);
            if (elem) {
                let scrollPosition = elem.getBoundingClientRect().top + window.scrollY - 80;
                if (document.body.clientWidth <= 591) {
                    scrollPosition = scrollPosition - 30;
                }
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }
        }
    };

    parent.appendChild(newchild);

    return newchild;
}

export function getHeaderClickableId(name,parent,retObj=false) {
    let id;
    if (parent.classList.contains("totitle-clickable-header")) {
        id = getUniqueHeaderId(`${name}-${parent.children.length}`);
    } else {
        id = getUniqueHeaderId(name);
    }
    const newchild = addHeaderForParent(name,id,parent);
    if (retObj) {
        return [id,newchild];
    }
    return id;
}



export function getNestedValue(obj, keyString) {
    return keyString.split('.').reduce((currentValue, key) => {
        if (!currentValue) return undefined;
        
        // Handle array index notation like [1]
        const arrayIndexMatch = key.match(/^\[(\d+)\]$/);
        if (arrayIndexMatch) {
            const index = parseInt(arrayIndexMatch[1], 10);
            return Array.isArray(currentValue) ? currentValue[index] : undefined;
        }
        
        // Handle attribute index notation like {attribute_value}
        const attributeIndexMatch = key.match(/^\{(.+)\}$/);
        if (attributeIndexMatch) {
            const attributeValue = attributeIndexMatch[1];
            if (Array.isArray(currentValue)) {
                return currentValue.find(item => item?.attribute_id === attributeValue);
            }
            return undefined;
        }
        
        // Handle regular object key
        return currentValue[key];
    }, obj);
}

export function mergeFromKeyPath(checkObj, retrieveObj) {
    if (checkObj && checkObj["MERGE:FROM"]) {
        const keyPath = checkObj["MERGE:FROM"];
        const valueToMerge = getNestedValue(retrieveObj, keyPath);

        if (valueToMerge && typeof valueToMerge === 'object') {
            return {
                ...checkObj,
                ...valueToMerge
            };
        }
    }
    return checkObj;
}

function findSubstringBetweenStartAndEndingChars(input, startChar='$', endingChars=[' ', '.', ')', '}', ']']) {
    // Escape the starting character and ending characters for regex
    const escapedStartChar = `\\${startChar}`;
    const endingPattern = endingChars.map(char => `\\${char}`).join('|');
    const regex = new RegExp(`${escapedStartChar}(.*?)(?=${endingPattern}|$)`, 'g');

    // Use the regex to find all matches
    const matches = new Set();
    let match;
    while ((match = regex.exec(input)) !== null) {
        if (!matches.has(match)) {
            matches.add(match[0]);
        }
    }

    return matches;
}

function replaceSubstringBetweenStartAndEndingChars(input, startChar='$', endingChars=[' ', '.', ')', '}', ']'], replaceWith="[%]", replaceFunc=(match,replaceWith)=>{return replaceWith.replace('%', match)}, replaceFuncArgs=[] ) {
    // Escape the starting character and ending characters for regex
    const escapedStartChar = `\\${startChar}`;
    const endingPattern = endingChars.map(char => `\\${char}`).join('|');
    const regex = new RegExp(`${escapedStartChar}(.*?)(?=${endingPattern}|$)`, 'g');

    // Replace matches with the replaceWith pattern
    return input.replace(regex, (match) => {
        return replaceFunc(match,replaceWith,...replaceFuncArgs);
    });
}

export async function resolveContent(input,pagedata,article_link_add="",yield_profile_data=false) {
    if (!input) return input;
    const endingChars = [' ',',', ')', '}', ']'];
    // SameArticleRetrive
    if (input.startsWith("%") && input.endsWith("%")) {
        // Return diretc since there should only be this one SameArticleRetrive in a value and nothing else 
        return getNestedValue(pagedata,input.slice(1,-1));
    }

    // Article
    let article_finds = findSubstringBetweenStartAndEndingChars(input, "$", endingChars);
    for (const article_find of article_finds) {

        // ArticleFetch
        if (article_find.includes(":")) {
            // Try fetch, if value found return the value since there should only be one articleFetch in a value and nothing else
            const [article,attribute_id] = article_find.split(":");
            let pageJsonUrl = '/wiki/minecraft/pages/'+article.slice(1)+"/page.json";
            try {
                const response = await fetch(pageJsonUrl);
                if (response && response.ok) {
                    const pagedata2 = await response.json();
                    return getNestedValue(pagedata2,attribute_id);
                }
            } catch { ; }
        }
        // ArticleAssetFetch
        else if ( (article_find.split("/").length-1) > 1 ) {
            let replacementUrl = '/wiki/minecraft/pages/'+article_find.slice(1);
            // replace al with the url
            input = input.replace(article_find, replacementUrl);
        }
        // ArticleLink
        else {
            let replacementUrl = `/wiki/minecraft/index.html?back=${encodeURIComponent(window.location.href)}#`+article_find.slice(1);
            // replace al with the html
            input = input.replace(article_find, `<a href="${replacementUrl}" alt="${article_find.slice(1)}" class="article-link">${article_find.slice(1)+article_link_add}</a>`)
        }
    }

    // ProfileLink
    const profile_finds = findSubstringBetweenStartAndEndingChars(input, "@", endingChars);
    const result_ = await getProfileReplacementHTML(profile_finds,`wiki_minecraft,wiki_minecraft-${pagedata.category}-${pagedata.page}`,"wiki_minecraft");
    for (const [profile, result] of Object.entries(result_)) {
        const replacementHtml = result[0];
        const profileRegex = new RegExp(`${profile}`, "g");
        input = input.replace(profileRegex, replacementHtml);
    }

    if (yield_profile_data == true) {
        return [input,result_];
    }
    return input;
}

export function renderCoords(coords) {
    if (coords.length === 0) {
        return '<span class="coords-display"><i>~</i> <i>~</i> <i>~</i></span>';
    } else if (coords.length === 1) {
        return `<span class="coords-display"><i>${coords[0]}</i> <i>~</i> <i>${coords[0]}</i></span>`;
    } else if (coords.length === 2) {
        return `<span class="coords-display"><i>${coords[0]}</i> <i>~</i> <i>${coords[1]}</i></span>`;
    } else if (coords.length > 2) {
        return `<span class="coords-display"><i>${coords[0]}</i> <i>${coords[1]}</i> <i>${coords[2]}</i></span>`;
    }
}

export function renderDatetime(input) {
    /*
    "xx-xx-xxxx"          -> "xx/xx/xxxx"
    "01-xx-xxxx"          -> "01/xx/xxxx"
    "01-02-xxxx"          -> "01/02/xxxx"
    "01-02-2024"          -> "01/02/2024"
    "01-xx-2024"          -> "01/xx/2024"
    "xx:xx 01-02-2024"    -> "01/02/2024"
    "xx:xx:xx 01-02-2024" -> "01/02/2024"
    "xx:xx:xx xx-xx-xxxx" -> "xx/xx/xxxx"
    "01:02 03-04-2024"    -> "01:02 03/04/2024"
    "01:02:03 04-05-2024" -> "01:02:03 04/05/2024"
    "01:02:03"            -> "01:02:03"
    "01:xx:03"            -> "01:xx:03"
    ""                    -> ""
    "xxxx"                -> ""
    "2024"                -> "2024" (year)
    "01/02"               -> "01/02" (dd/mm)
    */
    // Handle empty or invalid inputs
    if (!input || input.trim() === '' || input.replace(/x/g, '').trim() === '' || input.startsWith("<")) {
        return input;
    }

    // Remove any leading time components
    const timeRegex = /^(\d{2}:(\d{2}(:?\d{2})?)\s*)?(.+)$/;
    const match = input.match(timeRegex);
    
    // If no match or no date part, return original input
    if (!match) return input;
    
    const timePart = match[1] || '';
    const datePart = match[4];

    // Transform date part
    const dateTransformRegex = /(\d{2}|\xx)-(\d{2}|\xx)-(\d{4}|\xxxx)/;
    const dateMatch = datePart.match(dateTransformRegex);
    
    if (!dateMatch) {
        // If no date pattern found, return input as is
        return input;
    }

    // Reconstruct the string with replaced date format
    const transformedDate = datePart.replace(/-/g, '/');
    return timePart ? `${timePart}${transformedDate}` : transformedDate;
}

export async function renderResolvedDatetime(input,pagedata={}) {
    return renderDatetime(await resolveContent(input,pagedata));
}

export async function renderTimestamp(input,pagedata={}) {
    /*
    [period => URL,  date => DATETIME] -> "<a href="${URL}">${URL} (${renderDatetime(DATETIME)})</a>"
    */
    const oinput = input;
    if (typeof input == 'string') {
        input = await resolveContent(input,pagedata);
    }
    if (input && input.period && input.date) {
        return await resolveContent(input.period,pagedata,` (${renderDatetime(input.date,pagedata)})`);
    } else {
        return oinput;
    }
}

export async function renderResolvedMarkdown(input,pagedata,article_link_add="") {
    input = await resolveContent(input,pagedata,article_link_add);
    return await renderMarkdown(input);
}

export async function renderResolvedText(input,pagedata,article_link_add="") {
    return await resolveContent(input,pagedata,article_link_add);   
}

export async function renderResolvedMedia(input,pagedata,return_additional_classes=false) {
    if (!input || !input.type) return (typeof input === 'object') ? JSON.stringify(input) : input;

    let content = `<figure class="rendered-media-display%">`;
    let additional_classes = "";

    // Image Type
    if (input.type === "image") {
        content = content.replace("%", " rendered-media-display-image");
        content += `<img src="${await resolveContent(input.media,pagedata)}" alt="${await renderResolvedText(input.alt,pagedata)}">`;
        additional_classes += " contains-rendered-media-display-image";
    }

    // Video Type
    else if (input.type === "video") {
        content = content.replace("%", " rendered-media-display-video");
        content += `<video src="${await resolveContent(input.media,pagedata)}" controls></video>`;
        additional_classes = " contains-rendered-media-display-video";
    }

    // Link Type
    else if (input.type === "link") {
        content = content.replace("%", " rendered-media-display-link");
        content += `<a href="${await resolveContent(input.media,pagedata)}">${input.alt ? (await renderResolvedText(input.alt,pagedata)) : input.media}</a>`;
        additional_classes += " contains-rendered-media-display-link";
    }

    // Embed Type
    else if (input.type === "embed") {
        content = content.replace("%", " rendered-media-display-embed");
        content += `<iframe class="embed-iframe" srcdoc="${await resolveContent(input.media,pagedata)}"></iframe>`;
        additional_classes += " contains-rendered-media-display-embed";
    }

    // Audio Type
    else if (input.type === "audio") {
        content = content.replace("%", " rendered-media-display-audio");
        content += `<audio src="${await resolveContent(input.media,pagedata)}" controls></audio>`;
        additional_classes += " contains-rendered-media-display-audio";
    }

    // Fallback
    else {
        content = content.replace("%", "");
    }

    // Has description? (input.desc)
    if (input.desc) {
        content += `<figcaption>${await renderResolvedMarkdown(input.desc,pagedata)}</figcaption>`;
    }

    content += `</figure>`;

    if (return_additional_classes) {
        return [content, additional_classes];
    }
    return content;
}

export async function renderResolvedMultivalueBlock(input,pagedata) {
    if (!input || !input.type) return (typeof input === 'object') ? JSON.stringify(input) : input;

    const type = input.type.toLowerCase();
    const name = (input.name && input.name != null) ? await renderResolvedText(input.name,pagedata) : null;

    let additional_classes = "";

    // Render the 'value' field
    let renderedValue = "";

    // Text
    if (type == "text") {
        renderedValue = await renderResolvedText(input.value,pagedata);
    }

    // URL
    else if (type == "url") {
        const content2 = await resolveContent(input.value,pagedata);
        if (content2.startsWith("<") && content2.endsWith(">")) {
            renderedValue = content2;
        } else {
            renderedValue = `<a href="${content2}">${input.alt ? input.alt : input.value}</a>`;
        }
    }

    // Markdown
    else if (type == "markdown") {
        renderedValue = await renderResolvedMarkdown(input.value,pagedata);
    }

    // Datetime
    else if (type == "datetime") {
        renderedValue = await renderResolvedDatetime(input.value,pagedata);
    }

    // Time
    else if (type == "time") {
        renderedValue = await renderTimestamp(input.value,pagedata);
    }

    // Media
    else if (type == "media") {
        const [renderedValue_,additional_classes_] = await renderResolvedMedia(input.value,pagedata,true);
        renderedValue = renderedValue_;
        additional_classes += additional_classes_;
    }

    // Reference
    else if (type == "reference") {
        renderedValue = `<a class="a-reset wikipage-reference-note" href="${await resolveContent(input.value.href,pagedata)}">
            <i class="wikipage-reference-note-id">${input.value.id}.</i>
            <span class="wikipage-reference-note-text">${await renderResolvedText(input.value.text,pagedata)}</span>
            <p class="wikipage-reference-note-time wikipage-timestamp">(${await renderResolvedDatetime(input.value.time,pagedata)})</p>
        </a>
        `;
    }

    // Coord
    else if (type == "coord") {
        renderedValue = renderCoords(input.value);
    }

    // Profiles
    else if (type == "profiles") {
        if (input.value.length > 0) {
            renderedValue = await resolveContent(input.value.join(", "),pagedata);
        }
    }

    // DescProfiles
    else if (type == "desc_profiles" || type == "descripted_profiles") {
        if (input.value.length > 0) {
            renderedValue = ``;
            for (let entry of input.value) {
                if (entry["MERGE:FROM"]) { entry = mergeFromKeyPath(entry,pagedata) }
                renderedValue += `
                <div class="attributed_descripted_profiles multivalue_attributed_descripted_profiles">
                    <p class="attributed_descripted_profiles_profile multivalue_attributed_descripted_profiles_profile">${await resolveContent(entry[0],pagedata)}</p>
                    <p class="attributed_descripted_profiles_description multivalue_attributed_descripted_profiles_description">${await renderResolvedText(entry[1],pagedata)}</p>
                </div>
                `;
            }
        }
    }

    // Finalize the block
    let content = `<div class="multivalue-block ${type}-block${additional_classes}">`;
    if (name != null) {
        content += `<b class="multivalue-block-name ${type}-block-name">${name}</b>`;
    }
    content += `<div class="multivalue-block-value ${type}-block-value">${renderedValue}</div></div>`;

    return content;
}

export async function renderResolvedTimeline(input,pagedata) {
    let content = `<div class="timeline" id="timeline">`;
    for (let [key,value] of Object.entries(input)) {
        if (value["MERGE:FROM"]) { value = mergeFromKeyPath(value,pagedata) }

        content += `
        <div class="timeline-item">
            <div class="timeline-content">
                <div class="timeline-date">${await renderResolvedDatetime(key,pagedata)}</div>
                <h3 class="timeline-title">${await renderResolvedText(value.title,pagedata)}</h3>
                <p class="timeline-description">${await renderResolvedMarkdown(value.description,pagedata)}</p>
            </div>
        </div>
        `;
    }
    content += `</div>`;
    return content;
}

export async function renderResolvedImgTable(input,pagedata) {
    let content = `<table class="img-table">`;

    content += `<tr>`;
    for (const column of input.columns) {
        content += `<th>${await renderResolvedText(column,pagedata)}</th>`;
    }
    content += `</tr>`;

    for (const entry of input.entries) {
        content += `<tr>`;
        for (const column of entry) {
            if (column[1] && column[1]["MERGE:FROM"]) { column[1] = mergeFromKeyPath(column[1],pagedata) }
            const columnTemplate = {
                "name": null,
                "type": column[0],
                "value": column[1]
            };
            if ("type".toLowerCase() == "url") { columnTemplate["alt"] = column[1]; }
            content += `<td>${await renderResolvedMultivalueBlock(columnTemplate,pagedata)}</td>`;
        }
        content += `</tr>`;
    }

    content += `</table>`;
    return content;
}