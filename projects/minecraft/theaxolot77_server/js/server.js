// Initialize Swiper
const swiper = new Swiper('.media-carousel', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    effect: 'fade',
    fadeEffect: {
        crossFade: true
    },
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    }
});

// Create timeline
async function createTimeline() {
    const timeline = document.getElementById('timeline');
    
    Object.entries(THEAXOLOT77_SERVER_HISTORY).forEach(([date, data]) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        item.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-date">${date}</div>
                <h3 class="timeline-title">${data.title}</h3>
                <p class="timeline-description">${data.description}</p>
            </div>
        `;
        
        timeline.appendChild(item);
    });
}

// Process profile links in sections
async function processAllProfileLinks() {
    const sections = document.querySelectorAll('.section');
    for (const section of sections) {
        await processProfileLinks(section,"theaxolot77_mcsrv");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await createTimeline();
    await processAllProfileLinks();
});