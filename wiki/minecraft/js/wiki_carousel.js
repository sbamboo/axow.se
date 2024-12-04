document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("media-carusell");
    if (!container || !WIKI_MINECRAFT || !WIKI_MINECRAFT.highlights) {
        console.error("Carousel container or data not found!");
        return;
    }
  
    const mediaList = WIKI_MINECRAFT.highlights;
  
    let currentIndex = 0;
  
    // Create carousel elements
    const mediaDisplay = document.createElement("div");
    mediaDisplay.className = "media-display";
  
    const description = document.createElement("div");
    description.className = "description";
  
    const leftArrow = document.createElement("div");
    leftArrow.className = "arrow left-arrow";
    leftArrow.innerHTML = "&#10094;"; // Left arrow character
    leftArrow.style.display = "flex"; // Always show left arrow
  
    const rightArrow = document.createElement("div");
    rightArrow.className = "arrow right-arrow";
    rightArrow.innerHTML = "&#10095;"; // Right arrow character
    rightArrow.style.display = "flex"; // Always show right arrow
  
    const dotsContainer = document.createElement("div");
    dotsContainer.className = "dots-container";
  
    // Append elements to the container
    container.appendChild(leftArrow);
    container.appendChild(mediaDisplay);
    container.appendChild(description);
    container.appendChild(rightArrow);
    container.appendChild(dotsContainer);
  
    // Update the carousel display
    const updateCarousel = () => {
        
        const mediaItem = mediaList[currentIndex];
        mediaDisplay.innerHTML = ""; // Clear the display
    
        // Parse article format
        if (mediaItem.href.startsWith("$")) {
            const [category, page] = mediaItem.href.slice(1).split('/');
            if (WIKI_MINECRAFT.categories && Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                const carouselReadMore_href = `/wiki/minecraft/-/${category}/${page}.json`;
                if (WIKI_MINECRAFT.categories[category].viewer) {
                    mediaItem.href = `${WIKI_MINECRAFT.categories[category].viewer}?data=${encodeURIComponent(carouselReadMore_href)}`;
                } else {
                    mediaItem.href = carouselReadMore_href;
                }
            }
        }

        // IMAGE TYPE
        if (mediaItem.type === "image") {
            const img = document.createElement("img");
            img.src = mediaItem.src;
            img.alt = mediaItem.alt;
            mediaDisplay.appendChild(img);
        // VIDEO TYPE
        } else if (mediaItem.type === "video") {
            const video = document.createElement("video");
            video.src = mediaItem.src;
            video.controls = true;
            mediaDisplay.appendChild(video);
        // LINK TYPE
        } else if (mediaItem.type === "link") {
            const link = document.createElement("a");
            link.innerText = mediaItem.alt;

            if (mediaItem.src.startsWith("$")) {
                const [category, page] = mediaItem.src.slice(1).split('/');
                if (WIKI_MINECRAFT.categories && Object.keys(WIKI_MINECRAFT.categories).includes(category)) {
                    const carouselReadMore_href = `/wiki/minecraft/-/${category}/${page}.json`;
                    if (WIKI_MINECRAFT.categories[category].viewer) {
                        mediaItem.src = `${WIKI_MINECRAFT.categories[category].viewer}?data=${encodeURIComponent(carouselReadMore_href)}`;
                    } else {
                        mediaItem.src = carouselReadMore_href;
                    }
                }
            }

            mediaItem.src = mediaItem.src.replace("[AUTO_RETURN]",encodeURIComponent(window.location.href));

            link.href = mediaItem.src;
            mediaDisplay.appendChild(link);
        // Embed TYPE
        } else if (mediaItem.type === "embed") {
            const iframe = document.createElement("iframe");
            iframe.classList.add("embed-iframe");
            iframe.srcdoc = mediaItem.src;
            mediaDisplay.appendChild(iframe);
        }

        // Create description elem
        const carouselDescription = document.createElement("p");
        carouselDescription.innerText = mediaItem.description;

        // Create read-more
        const carouselReadMore = document.createElement("a");
        if (mediaItem.href != "") {
            carouselReadMore.classList.add("carousel-read-more");
            carouselReadMore.href = mediaItem.href;
            carouselReadMore.innerHTML = "Read more..."
        }

        description.innerHTML = ``;

        description.appendChild(carouselDescription);
        description.appendChild(carouselReadMore);
    
        // Update dots
        dotsContainer.innerHTML = ""; // Clear dots
        mediaList.forEach((_, index) => {
            const dot = document.createElement("span");
            dot.className = "dot";
            if (index === currentIndex) dot.classList.add("active");
            dot.addEventListener("click", () => {
                currentIndex = index;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        });
    };
  
    // Arrow click handlers
    leftArrow.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
        updateCarousel();
        processProfileLinks(description,"wiki_minecraft","wiki_minecraft");
    });
  
    rightArrow.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % mediaList.length;
        updateCarousel();
        processProfileLinks(description,"wiki_minecraft","wiki_minecraft");
    });
  
    // Initialize the carousel
    updateCarousel();
});