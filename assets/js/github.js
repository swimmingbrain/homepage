// GitHub API configuration
const GITHUB_USERNAME = 'swimmingbrain';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

// Fetch GitHub data
async function fetchGitHubData() {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(GITHUB_API_URL),
            fetch(GITHUB_REPOS_URL)
        ]);
        
        if (!userResponse.ok || !reposResponse.ok) throw new Error('Failed to fetch GitHub data');
        
        const userData = await userResponse.json();
        const reposData = await reposResponse.json();
        
        return { user: userData, repos: reposData };
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return null;
    }
}

// Create repository card
function createRepoCard(repo) {
    return `
        <div class="repo-card">
            <div class="repo-header">
                <h3>
                    <svg viewBox="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
                    </svg>
                    ${repo.name}
                </h3>
                <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
            </div>
            <p class="repo-description">${repo.description || 'No description provided'}</p>
            <div class="repo-stats">
                <span class="repo-stat">
                    <svg viewBox="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M8 .25a.75.75 0 01.673.418l3.058 6.197 6.839.994a.75.75 0 01.415 1.279l-4.948 4.823 1.168 6.811a.75.75 0 01-1.088.791L8 18.347l-6.116 3.214a.75.75 0 01-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 01.416-1.28l6.838-.993L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-4.078.592 2.952 2.877a.75.75 0 01.216.664l-.696 4.058 3.646-1.917a.75.75 0 01.698 0l3.646 1.917-.696-4.058a.75.75 0 01.216-.664l2.952-2.877-4.078-.592a.75.75 0 01-.564-.41L8 2.694v.001z"/>
                    </svg>
                    ${repo.stargazers_count}
                </span>
                <span class="repo-stat">
                    <svg viewBox="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v-.878A2.25 2.25 0 015.75 1h5.5A2.25 2.25 0 0113.5 3.25v.878a2.25 2.25 0 10-1.5 0v-.878a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v.878zM6.75 6a.75.75 0 00-.75.75v3.378a2.251 2.251 0 101.5 0V6.75A.75.75 0 006.75 6zm3.25 0a.75.75 0 00-.75.75v3.378a2.251 2.251 0 101.5 0V6.75a.75.75 0 00-.75-.75zM8 8.75a.75.75 0 01.75.75v3.378a2.25 2.25 0 11-1.5 0V9.5A.75.75 0 018 8.75zM5.75 12.5a.75.75 0 100 1.5.75.75 0 000-1.5zm4.5 0a.75.75 0 100 1.5.75.75 0 000-1.5zM8 3.5a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5A.75.75 0 008 3.5z"/>
                    </svg>
                    ${repo.forks_count}
                </span>
                <span class="repo-stat">
                    <svg viewBox="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M1.643 3.143l8 8a.5.5 0 00.707 0l8-8a.5.5 0 00-.707-.707L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L1.35 2.436a.5.5 0 10-.707.707z"/>
                    </svg>
                    ${repo.language || 'N/A'}
                </span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="repo-link">View Repository</a>
        </div>
    `;
}

// Create GitHub card
function createGitHubCard(data) {
    const { user, repos } = data;
    const card = document.createElement('div');
    card.className = 'github-card';
    
    card.innerHTML = `
        <div class="github-header">
            <img src="${user.avatar_url}" alt="GitHub Avatar" class="github-avatar">
            <div class="github-info">
                <h2>${user.name || user.login}</h2>
                <p class="github-bio">${user.bio || 'Code enthusiast and student'}</p>
                <div class="github-stats">
                    <span>${user.followers} followers</span>
                    <span>${user.following} following</span>
                    <span>${user.public_repos} repositories</span>
                </div>
            </div>
        </div>
        <div class="github-repos">
            <h3>Recent Repositories</h3>
            <div class="repos-grid">
                ${repos.map(repo => createRepoCard(repo)).join('')}
            </div>
        </div>
        <div class="github-cta">
            <a href="${user.html_url}" target="_blank" class="github-button">
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
            max-width: 1200px;
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
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
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

        .github-repos {
            margin: 2rem 0;
        }

        .github-repos h3 {
            color: var(--text-primary);
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .repos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .repo-card {
            background: var(--background-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease;
        }

        .repo-card:hover {
            transform: translateY(-3px);
        }

        .repo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .repo-header h3 {
            color: var(--text-primary);
            font-size: 1.2rem;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .repo-visibility {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            background: var(--background-hover);
            color: var(--text-secondary);
        }

        .repo-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin: 0 0 1rem 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .repo-stats {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .repo-stat {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .repo-link {
            display: inline-block;
            color: var(--text-primary);
            text-decoration: none;
            font-size: 0.9rem;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            background: var(--background-hover);
            transition: all 0.3s ease;
        }

        .repo-link:hover {
            background: var(--border-color);
        }

        .github-cta {
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
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

            .repos-grid {
                grid-template-columns: 1fr;
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