import { getProfileReplacementHTML } from '/js/utils/resolveProfiles.js';

function getNestedValue(obj, keyString) {
    return keyString.split('.').reduce((currentValue, key) => {
        return currentValue ? currentValue[key] : undefined;
    }, obj);
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
        if (!matches.includes(match)) {
            matches.add(match);
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

async function resolveContent(input,pagedata,article_link_add="") {
    const endingChars = [' ', '.', ')', '}', ']'];

    // SameArticleRetrive
    if (input.startsWith("%") && input.endsWith("%")) {
        // Return diretc since there should only be this one SameArticleRetrive in a value and nothing else 
        return getNestedValue(pagedata,input.slice(1,-1));
    }

    // Article
    article_finds = findSubstringBetweenStartAndEndingChars(input, "$", endingChars);
    for (const article_find in article_finds) {
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
            let replacementUrl = '/wiki/minecraft/index.html#'+article_find.slice(1);
            // replace al with the html
            input = input.replace(article_find, `<a href="${replacementUrl}" alt="${article_find.slice(1)}" class="article-link">${article_find.slice(1)+article_link_add}</a>`)
        }
    }

    // Profile
    const profile_finds = findSubstringBetweenStartAndEndingChars(input, "@", endingChars);
    const profileHtmlMap = await getProfileReplacementHTML(profile_finds,section,"wiki_minecraft","wiki_minecraft");
    for (const [profile, replacementHtml] of Object.entries(profileHtmlMap)) {
        const profileRegex = new RegExp(`${profile}`, "g");
        input = input.replace(profileRegex, replacementHtml);
    }

    return input;
}

function renderCoords(coords) {
    if (coords.length === 0) {
        return "<i>~</i> <i>~</i> <i>~</i>";
    } else if (coords.length === 1) {
        return `<i>${coords[0]}</i> <i>${coords[0]}</i> <i>${coords[0]}</i>`;
    } else if (coords.length === 2) {
        return `<i>${coords[0]}</i> <i>~</i> <i>${coords[1]}</i>`;
    } else if (coords.length > 2) {
        return `<i>${coords[0]}</i> <i>${coords[1]}</i> <i>${coords[2]}</i>`;
    }
}

function renderDatetime(input) {
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
    if (!input || input.trim() === '' || input.replace(/x/g, '').trim() === '') {
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

async function renderTimestamp(input) {
    /*
    [period => URL,  date => DATETIME] -> "<a href="${URL}">${URL} (${renderDatetime(DATETIME)})</a>"
    */
    return await resolveContent(input.period,{},` (${renderDatetime(period.date)})`);
}