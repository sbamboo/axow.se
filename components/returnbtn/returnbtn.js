function addReturnButton(returnUrl, returnName) {
    const button = document.createElement('a');
    button.href = returnUrl;
    button.textContent = returnName || 'See all articles';
    button.className = 'return-button';
    document.body.appendChild(button);
}
  
async function addCrossButton(returnUrl) {
    const button = document.createElement('a');
    button.href = returnUrl;
    button.className = 'return-cross';
    
    try {
        const response = await fetch('/articles/assets/cross.svg');
        const svgContent = await response.text();
        button.innerHTML = svgContent;
    } catch (error) {
        console.error('Error loading cross icon:', error);
        button.innerHTML = '×';
    }

    document.body.appendChild(button);
}

window.onload = () => {

    const params = new URLSearchParams(window.location.search);
    let returnUrl = decodeURIComponent( params.get('ret') );
    let returnName = params.get('retname');

    if (!returnName) {
        returnName = `Return to previous page`;
    }

    if      (returnUrl == "_articles_")             { returnUrl = "/articles/index.html";       }
    else if (returnUrl == "_wiki_minecraft_")       { returnUrl = "/wiki/minecraft/index.html"; }
    else if (returnUrl == "_wiki_minecraft_pages_") { returnUrl = "/wiki/minecraft/pages.html"; }

    if (returnUrl || returnName) {

        if (returnName == "_cross_") {
            addCrossButton(returnUrl);
        } else {
            addReturnButton(returnUrl, returnName);
        }

    }

};