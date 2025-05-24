// GitHub API configuration
const GITHUB_USERNAME = 'swimmingbrain';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;

// Fetch GitHub data
async function fetchGitHubData() {
    try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) throw new Error('Failed to fetch GitHub data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return null;
    }
}

// Create GitHub card
function createGitHubCard(data) {
    const card = document.createElement('div');
    card.className = 'github-card';
    
    card.innerHTML = `
        <div class="github-header">
            <img src="${data.avatar_url}" alt="GitHub Avatar" class="github-avatar">
            <div class="github-info">
                <h2>${data.name || data.login}</h2>
                <p class="github-bio">${data.bio || 'Code enthusiast and student'}</p>
                <div class="github-stats">
                    <span>${data.followers} followers</span>
                    <span>${data.following} following</span>
                    <span>${data.public_repos} repositories</span>
                </div>
            </div>
        </div>
        <div class="github-cta">
            <a href="${data.html_url}" target="_blank" class="github-button">
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Visit GitHub Profile
            </a>
        </div>
    `;
    
    return card;
}

// Add GitHub styles
function addGitHubStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .github-card {
            background: var(--background-primary);
            border-radius: 16px;
            padding: 2rem;
            margin: 2rem auto;
            max-width: 800px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }

        .github-card:hover {
            transform: translateY(-5px);
        }

        .github-header {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .github-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 3px solid var(--border-color);
            transition: transform 0.3s ease;
        }

        .github-card:hover .github-avatar {
            transform: scale(1.05);
        }

        .github-info {
            flex: 1;
        }

        .github-info h2 {
            color: var(--text-primary);
            font-size: 2rem;
            margin: 0 0 0.5rem 0;
            background: linear-gradient(45deg, #6e5494, #c9510c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .github-bio {
            color: var(--text-secondary);
            font-size: 1.1rem;
            margin: 0 0 1rem 0;
            line-height: 1.5;
        }

        .github-stats {
            display: flex;
            gap: 1.5rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .github-stats span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .github-cta {
            text-align: center;
            margin-top: 2rem;
        }

        .github-button {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(45deg, #6e5494, #c9510c);
            color: white;
            text-decoration: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(110, 84, 148, 0.2);
        }

        .github-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(110, 84, 148, 0.3);
        }

        .github-button:active {
            transform: translateY(0);
        }

        .github-button svg {
            width: 24px;
            height: 24px;
        }

        @media (max-width: 768px) {
            .github-header {
                flex-direction: column;
                text-align: center;
                gap: 1rem;
            }

            .github-stats {
                justify-content: center;
            }

            .github-card {
                margin: 1rem;
                padding: 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize GitHub card
async function initGitHubCard() {
    addGitHubStyles();
    const data = await fetchGitHubData();
    if (data) {
        const card = createGitHubCard(data);
        const container = document.querySelector('.github-container');
        if (container) {
            container.appendChild(card);
        }
    }
}

// Initialize when the page loads
window.addEventListener('load', initGitHubCard); 