function addBackButton(backUrl, backName) {
    const button = document.createElement('a');
    button.href = backUrl;
    button.textContent = backName || 'Go back';
    button.className = 'back-button';
    document.body.appendChild(button);
}
  
async function addArrowButton(backUrl) {
    const button = document.createElement('a');
    button.href = backUrl;
    button.className = 'back-arrow';
    
    try {
        const response = await fetch('/assets/images/arrow.svg');
        const svgContent = await response.text();
        button.innerHTML = svgContent;
    } catch (error) {
        console.error('Error loading arrow icon:', error);
        button.innerHTML = '←';
    }

    document.body.appendChild(button);
}

window.onload = () => {

    const params = new URLSearchParams(window.location.search);
    let backUrl = decodeURIComponent( params.get('back') );
    let backName = params.get('backname');

    if (backUrl && backUrl != null && backUrl != "null") {

        if (!backName) {
            backName = `Return to previous page`;
        }

        if      (backUrl == "_articles_")             { backUrl = "/articles/index.html";       }
        else if (backUrl == "_wiki_minecraft_")       { backUrl = "/wiki/minecraft/index.html"; }
        else if (backUrl == "_wiki_minecraft_pages_") { backUrl = "/wiki/minecraft/pages.html"; }

        if (backUrl || backName) {

            if (backName == "_back_") {
                addArrowButton(backUrl);
            } else {
                addBackButton(backUrl, backName);
            }

        }
    }
};