async function getProfileReplacementHTML(profiles,section,namespace) {
  // Validate profiles by fetching their JSON
  const profileMap = await Promise.all(
    Array.from(profiles).map(async (profile) => {

      let profileUrl1 = `/profiles/${profile}/profile.json`;
      let profileUrl2 = `/profiles/${profile}/profile.json`;
      if (namespace && namespace != null) {
        profileUrl2 = `/profiles/${namespace}/${profile}/profile.json`;
      }

      try {
        const response = await fetch(profileUrl2);
        if (response.ok) {
          return { profile, valid: true, url:2, response:response };
        }
      } catch (error) {
        // Profile not found or fetch error
      }
      
      try {
        const response = await fetch(profileUrl1);
        if (response.ok) {
          return { profile, valid: true, url:1, response:response };
        }
      } catch (error) {
        // Profile not found or fetch error
      }
      return { profile, valid: false, url:0, response:null };

    })
  );

  // Create a map of valid profiles to their replacement HTML
  const profileHtmlMap = Object.fromEntries(
    profileMap
      .filter(({ valid }) => valid)
      .map(({ profile, url, response }) => {
        const returnUrl = encodeURIComponent(window.location.href);
        let sectionText = "";
        if (section) {
          sectionText = `&sections=${section}`;
        }
        if (namespace && namespace != null && url == 2) {
          return [
            profile,
            [`<a href="/profiles/${namespace}/${profile}/index.html?ret=${returnUrl}${sectionText}" class="profile-link">${profile}</a>`, response]
          ];
        } else {
          return [
            profile,
            [`<a href="/profiles/${profile}/index.html?ret=${returnUrl}${sectionText}" class="profile-link">${profile}</a>`,response]
          ];
        }
      })
  );

  return profileHtmlMap;
}

async function processProfileLinks(element,section,namespace=null) {
  // Helper function to process and replace text
  const processText = (text) => {
    let updatedText = text;
    for (const [profile, result] of Object.entries(profileHtmlMap)) {
      const replacementHtml = result[0];
      const profileRegex = new RegExp(`${profile}`, "g");
      updatedText = updatedText.replace(profileRegex, replacementHtml);
    }
    return updatedText;
  };

  // Get all <p> elements and <div> elements
  const paragraphs = element.querySelectorAll("p");
  const divs = element.querySelectorAll("div, main");

  // Regex to match profiles
  const regex = /(@\w+)(?![^<]*>)/g;

  // Collect all unique profiles from <p> elements and raw text in <div>s
  const profiles = new Set();

  paragraphs.forEach((paragraph) => {
    const matches = [...paragraph.innerText.matchAll(regex)];
    matches.forEach((match) => profiles.add(match[1]));
  });

  divs.forEach((div) => {
    Array.from(div.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const matches = [...node.textContent.matchAll(regex)];
        matches.forEach((match) => profiles.add(match[1]));
      }
    });
  });

  // Get replacement html for al profiles (that are valid)
  const profileHtmlMap = await getProfileReplacementHTML(profiles,section,namespace);

  // Replace matched text in each <p> element
  paragraphs.forEach((paragraph) => {
    const updatedText = processText(paragraph.innerText);
    if (updatedText !== paragraph.innerText) {
      paragraph.innerHTML = updatedText;
      paragraph.classList.add("was-profile-resolved");
    }
  });

  // Replace matched text in raw text nodes within <div> elements
  divs.forEach((div) => {
    let contentChanged = false;
    Array.from(div.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const updatedText = processText(node.textContent);
        if (updatedText !== node.textContent) {
          contentChanged = true;
          // Replace the text node with new HTML
          const wrapper = document.createElement("span");
          wrapper.innerHTML = updatedText;
          div.replaceChild(wrapper, node);
        }
      }
    });
    if (contentChanged) {
      div.classList.add("was-profile-resolved");
    }
  });
}

async function updateProcessedProfileLinks(section,namespace=null) {
  // Helper function to process and replace text
  const processText = (text, profileHtmlMap) => {
    let updatedText = text;
    for (const [profile, result] of Object.entries(profileHtmlMap)) {
      const replacementHtml = result[0];
      const profileRegex = new RegExp(`${profile}`, "g");
      updatedText = updatedText.replace(profileRegex, replacementHtml);
    }
    return updatedText;
  };

  // Get all elements with the class "was-profile-resolved"
  const resolvedElements = document.querySelectorAll(".was-profile-resolved");

  // Regex to match profiles
  const regex = /(@\w+)(?![^<]*>)/g;

  // Collect all unique profiles from the elements
  const profiles = new Set();

  resolvedElements.forEach((element) => {
    if (element.tagName === "P") {
      const matches = [...element.innerText.matchAll(regex)];
      matches.forEach((match) => profiles.add(match[1]));
    } else if (element.tagName === "DIV") {
      Array.from(element.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const matches = [...node.textContent.matchAll(regex)];
          matches.forEach((match) => profiles.add(match[1]));
        }
      });
    }
  });

  // Get replacement html for al profiles (that are valid)
  const profileHtmlMap = await getProfileReplacementHTML(profiles,section,namespace);

  // Reprocess each resolved element
  resolvedElements.forEach((element) => {
    if (element.tagName === "P") {
      const updatedText = processText(element.innerText, profileHtmlMap);
      if (updatedText !== element.innerText) {
        element.innerHTML = updatedText;
      }
    } else if (element.tagName === "DIV") {
      Array.from(element.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const updatedText = processText(node.textContent, profileHtmlMap);
          if (updatedText !== node.textContent) {
            // Replace the text node with new HTML
            const wrapper = document.createElement("span");
            wrapper.innerHTML = updatedText;
            element.replaceChild(wrapper, node);
          }
        }
      });
    }
  });
}
