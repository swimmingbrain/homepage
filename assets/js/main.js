// Cat cursor follower
const catFollower = document.querySelector('.cat-follower');
const cats = ['🐱', '😸', '😺', '🙀', '😿', '🐾'];
let catIndex = 0;

document.addEventListener('mousemove', (e) => {
    catFollower.style.left = e.clientX + 15 + 'px';
    catFollower.style.top = e.clientY + 15 + 'px';
});

document.addEventListener('click', () => {
    catIndex = (catIndex + 1) % cats.length;
    catFollower.textContent = cats[catIndex];
    catFollower.style.transform = 'scale(1.5)';
    setTimeout(() => {
        catFollower.style.transform = 'scale(1)';
    }, 200);
});

// Add cat animation to card clicks
document.querySelectorAll('.hub-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const randomCat = cats[Math.floor(Math.random() * cats.length)];
        const tempCat = document.createElement('div');
        tempCat.textContent = randomCat;
        tempCat.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1001;
            animation: popCat 0.8s ease forwards;
        `;
        document.body.appendChild(tempCat);
        setTimeout(() => tempCat.remove(), 800);
    });
});

// Enhanced interactions with more dynamics
document.querySelectorAll('.hub-card').forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        // Only apply subtle effects to immediate neighbors, not all cards
        const siblings = Array.from(card.parentNode.children);
        siblings.forEach((sibling, i) => {
            if (sibling !== card) {
                const distance = Math.abs(i - index);
                // Only affect cards that are very close (distance 1) and with much subtler effects
                if (distance === 1) {
                    const offset = 2;
                    const rotation = (i < index ? -0.5 : 0.5);
                    sibling.style.transform = `translateY(${offset}px) rotate(${rotation}deg)`;
                    sibling.style.filter = `brightness(0.98)`;
                }
            }
        });
        
        if (Math.random() > 0.7) {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.cssText = `
                position: absolute;
                right: 10px;
                top: 10px;
                font-size: 1rem;
                pointer-events: none;
                animation: sparkle 1s ease forwards;
            `;
            card.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
    });

    card.addEventListener('mouseleave', () => {
        // Reset only the immediate neighbors quickly
        const siblings = Array.from(card.parentNode.children);
        siblings.forEach((sibling, i) => {
            if (sibling !== card) {
                const distance = Math.abs(i - index);
                if (distance === 1) {
                    sibling.style.transform = 'translateY(0) rotate(0deg)';
                    sibling.style.filter = 'brightness(1)';
                }
            }
        });
    });
});

// Easy way to add new cards programmatically
function addHubCard(icon, title, description, page, isFeatured = false) {
    const hubGrid = document.querySelector('.hub-grid');
    const newCard = document.createElement('div');
    newCard.className = `hub-card${isFeatured ? ' featured' : ''}`;
    newCard.onclick = () => navigateTo(page);
    newCard.innerHTML = `
        <div class="hub-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${description}</p>
    `;
    hubGrid.appendChild(newCard);
}

// Smooth entrance animation on load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
}); 