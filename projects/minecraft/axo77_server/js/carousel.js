import { getNestedValue, resolveContent } from '/wiki/minecraft/js/wikipage_parsers.js';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("media-carusell");
    if (!container || !THEAXOLOT77_MCSRV_MEDIA || !THEAXOLOT77_MCSRV_MEDIA.carusell) {
      console.error("Carousel container or data not found!");
      return;
    }
  
    const mediaList = THEAXOLOT77_MCSRV_MEDIA.carusell;
  
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
    const updateCarousel = async () => {
      const mediaItem = mediaList[currentIndex];
      mediaDisplay.innerHTML = ""; // Clear the display
  
      if (mediaItem.type === "image") {
        const img = document.createElement("img");
        img.src = mediaItem.media;
        img.alt = mediaItem.description;
        mediaDisplay.appendChild(img);
      } else if (mediaItem.type === "video") {
        const video = document.createElement("video");
        video.src = mediaItem.media;
        video.controls = true;
        mediaDisplay.appendChild(video);
      } else if (mediaItem.type === "wiki") {
        const img = document.createElement("img");

        try {
          const response3 = await fetch(`/wiki/minecraft/pages/${mediaItem.category}/${mediaItem.page}/page.json`)
          const json3 = await response3.json();

          mediaItem.media = await resolveContent(mediaItem.media,json3);
          mediaItem.description = await resolveContent(mediaItem.description,json3);

          img.alt = mediaItem.description;
        } catch {
          img.alt = mediaItem.media;
        }

        img.src = mediaItem.media;
        mediaDisplay.appendChild(img);
      }
  
      description.textContent = mediaItem.description;
  
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
    });
  
    rightArrow.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % mediaList.length;
      updateCarousel();
    });
  
    // Initialize the carousel
    updateCarousel();
});