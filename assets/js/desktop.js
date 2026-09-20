// Window Management
let activeWindow = null;
let isDragging = false;
let dragStartMouseX = 0;
let dragStartMouseY = 0;
let dragStartLeft = 0;
let dragStartTop = 0;

// Initialize all windows for dragging
document.querySelectorAll('.window').forEach(winEl => {
    const header = winEl.querySelector('.window-header');
    header.addEventListener('mousedown', dragStart);
    header.addEventListener('touchstart', dragStart);
});

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    const winEl = e.target.closest('.window');
    // Bring window to front
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    winEl.classList.add('active');
    activeWindow = winEl;

    // Ensure the window has explicit left/top set relative to its parent
    const parentRect = winEl.parentElement.getBoundingClientRect();
    const rect = winEl.getBoundingClientRect();
    if (!winEl.style.left || !winEl.style.top) {
        winEl.style.left = `${rect.left - parentRect.left}px`;
        winEl.style.top = `${rect.top - parentRect.top}px`;
    }
    // Clear conflicting edges and transforms so layout uses left/top only
    winEl.style.right = 'auto';
    winEl.style.bottom = 'auto';
    // Clear any transform so movement is based purely on left/top
    winEl.style.transform = 'none';

    const point = e.type === 'touchstart' ? e.touches[0] : e;
    dragStartMouseX = point.clientX;
    dragStartMouseY = point.clientY;
    dragStartLeft = parseFloat(winEl.style.left) || 0;
    dragStartTop = parseFloat(winEl.style.top) || 0;
    
    if (e.target.closest('.window-header') && !e.target.classList.contains('window-button')) {
        isDragging = true;
    }
}

function drag(e) {
    if (!isDragging || !activeWindow) return;
        e.preventDefault();
    const point = e.type === 'touchmove' ? e.touches[0] : e;
    const deltaX = point.clientX - dragStartMouseX;
    const deltaY = point.clientY - dragStartMouseY;
    const newLeft = dragStartLeft + deltaX;
    const newTop = dragStartTop + deltaY;
    activeWindow.style.left = `${newLeft}px`;
    activeWindow.style.top = `${newTop}px`;
}

function dragEnd(e) {
    isDragging = false;
    activeWindow = null;
}

// Window controls
function minimizeWindow(windowId) {
    document.getElementById(windowId).classList.add('minimized');
}

function closeWindow(windowId) {
    document.getElementById(windowId).style.display = 'none';
}

function toggleWindow(windowId) {
    const winEl = document.getElementById(windowId);
    if (!winEl) return;
    const isHidden = winEl.style.display === 'none' || getComputedStyle(winEl).display === 'none' || winEl.classList.contains('minimized');
    if (isHidden) {
        winEl.classList.remove('minimized');
        winEl.style.display = 'flex';
        // Bring to front
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        winEl.classList.add('active');
    } else {
        // Hide if already visible
        winEl.style.display = 'none';
    }
}

// Legal open helper: make sure hidden windows become visible, focused, and positioned on-screen
function openLegal(id) {
    const winEl = document.getElementById(id);
    if (!winEl) return;
    winEl.style.display = 'flex';
    winEl.classList.remove('minimized');
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    winEl.classList.add('active');
    // Center within viewport with safe margins
    const rect = winEl.getBoundingClientRect();
    const targetLeft = Math.max(20, (window.innerWidth - rect.width) / 2);
    const targetTop = Math.max(40, (window.innerHeight - rect.height) / 2);
    winEl.style.left = `${targetLeft}px`;
    winEl.style.top = `${targetTop}px`;
}

// Click on window to activate
document.querySelectorAll('.window').forEach(winEl => {
    winEl.addEventListener('mousedown', function(e) {
        if (!e.target.closest('.window-header')) {
            document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// Ensure resume window positions sensibly on load
(function placeResume() {
    const resume = document.getElementById('resume-window');
    if (!resume) return;
    // Default position if not already set by user drag
    if (!resume.style.left) resume.style.left = '160px';
    if (!resume.style.top) resume.style.top = '100px';
})();

// Update time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('panel-time').textContent = timeString;
}

updateTime();
setInterval(updateTime, 1000);

// Cookie Consent Flow
const COOKIE_KEY = 'sb_cookies_consent'; // values: 'accepted' | 'rejected' | null
const initialWindows = ['about-window', 'projects-window', 'terminal-window', 'linkedin-window'];
const cookiesWindow = document.getElementById('cookies-window');
const poweredOff = document.getElementById('powered-off');
const btnAccept = document.getElementById('cookies-accept');
const btnReject = document.getElementById('cookies-reject');
const btnManage = null; // removed manage in simplified consent

function hideAllAppWindows() {
    initialWindows.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showDefaultAppWindows() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const isDesktop = window.innerWidth > 1024;

    const about = document.getElementById('about-window');
    const projects = document.getElementById('projects-window');
    const terminal = document.getElementById('terminal-window');
    const linkedin = document.getElementById('linkedin-window');

    if (about) about.style.display = 'flex';
    if (projects) projects.style.display = 'flex';
    // Only show Terminal on larger desktops
    if (terminal) terminal.style.display = window.innerWidth >= 1280 ? 'flex' : 'none';
    // Only show LinkedIn on larger desktops
    if (linkedin) linkedin.style.display = window.innerWidth >= 1280 ? 'flex' : 'none';

    // Bring one window to front (prefer terminal on desktop, otherwise about)
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    const toFocus = (window.innerWidth >= 1280 && terminal && terminal.style.display !== 'none') ? terminal : about;
    if (toFocus) toFocus.classList.add('active');

    placeWindowsForViewport();
}

function placeWindowsForViewport() {
    const gap = 20;
    const about = document.getElementById('about-window');
    const projects = document.getElementById('projects-window');
    const terminal = document.getElementById('terminal-window');
    const linkedin = document.getElementById('linkedin-window');

    const getSize = (el, fallbackW, fallbackH) => {
        if (!el) return { w: fallbackW, h: fallbackH };
        const rect = el.getBoundingClientRect();
        let w = rect.width || parseInt(getComputedStyle(el).width) || fallbackW;
        let h = rect.height || parseInt(getComputedStyle(el).height) || fallbackH;
        return { w, h };
    };
    const setPos = (el, left, top) => {
        if (!el) return;
        el.style.left = `${Math.max(10, left)}px`;
        el.style.top = `${Math.max(60, top)}px`;
    };

    // Base positions
    let aboutLeft = 100;
    let aboutTop = 80;
    setPos(about, aboutLeft, aboutTop);
    const aboutSize = getSize(about, 420, 520);

    // Projects: try to the right of About, else below
    const projectsSize = getSize(projects, 500, 400);
    const canProjectsRight = (aboutLeft + aboutSize.w + gap + projectsSize.w + 20) <= window.innerWidth;
    let projectsLeft = canProjectsRight ? (aboutLeft + aboutSize.w + gap) : aboutLeft;
    let projectsTop = canProjectsRight ? aboutTop : (aboutTop + aboutSize.h + gap);
    setPos(projects, projectsLeft, projectsTop);

    // Terminal: if visible, place below About (aligned left)
    if (terminal && getComputedStyle(terminal).display !== 'none') {
        const belowY = Math.max(aboutTop + aboutSize.h, projectsTop + projectsSize.h) + gap;
        setPos(terminal, aboutLeft, belowY);
    }

    // LinkedIn: if visible, prefer to the right of Projects, else below Projects
    if (linkedin && getComputedStyle(linkedin).display !== 'none') {
        const linkedinSize = getSize(linkedin, 520, 600);
        const canLinkedinRight = (projectsLeft + projectsSize.w + gap + linkedinSize.w + 20) <= window.innerWidth;
        const lnLeft = canLinkedinRight ? (projectsLeft + projectsSize.w + gap) : projectsLeft;
        const lnTop = canLinkedinRight ? projectsTop : (projectsTop + projectsSize.h + gap);
        setPos(linkedin, lnLeft, lnTop);
    }
    clampWindowsToViewport();
}

function clampWindowsToViewport() {
    const minTop = 40; // keep headers in view below top panel
    const minLeft = 10;
    const margin = 10;
    document.querySelectorAll('.window').forEach(winEl => {
        if (getComputedStyle(winEl).display === 'none' || winEl.classList.contains('minimized')) return;
        const rect = winEl.getBoundingClientRect();
        let left = parseFloat(winEl.style.left);
        let top = parseFloat(winEl.style.top);
        if (Number.isNaN(left)) left = rect.left;
        if (Number.isNaN(top)) top = rect.top;
        const maxLeft = Math.max(minLeft, window.innerWidth - rect.width - margin);
        const maxTop = Math.max(minTop, window.innerHeight - rect.height - margin);
        left = Math.min(Math.max(minLeft, left), maxLeft);
        top = Math.min(Math.max(minTop, top), maxTop);
        winEl.style.left = `${left}px`;
        winEl.style.top = `${top}px`;
    });
}

function openCookiesOnly() {
    hideAllAppWindows();
    if (cookiesWindow) cookiesWindow.style.display = 'flex';
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    cookiesWindow.classList.add('active');
}

function applyConsentStateOnLoad() {
    const val = localStorage.getItem(COOKIE_KEY);
    if (val === 'accepted') {
        if (cookiesWindow) cookiesWindow.style.display = 'none';
        if (poweredOff) poweredOff.style.display = 'none';
        showDefaultAppWindows();
    } else if (val === 'rejected') {
        // Give another try on refresh: reset to null so user sees opt-in window again
        localStorage.removeItem(COOKIE_KEY);
        if (poweredOff) poweredOff.style.display = 'none';
        openCookiesOnly();
    } else {
        // no choice yet -> cookies window only
        if (poweredOff) poweredOff.style.display = 'none';
        openCookiesOnly();
    }
}

if (btnAccept) {
    btnAccept.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        if (cookiesWindow) cookiesWindow.style.display = 'none';
        if (poweredOff) poweredOff.style.display = 'none';
        showDefaultAppWindows();
    });
}
if (btnReject) {
    btnReject.addEventListener('click', () => {
        localStorage.setItem(COOKIE_KEY, 'rejected');
        hideAllAppWindows();
        if (cookiesWindow) cookiesWindow.style.display = 'none';
        if (poweredOff) poweredOff.style.display = 'flex';
    });
}
// no manage button in simplified consent

// Ensure legal links still open even when powered off
window.openLegal = function(id) {
    const consent = localStorage.getItem(COOKIE_KEY);
    const winEl = document.getElementById(id);
    if (!winEl) return;
    winEl.style.display = 'flex';
    winEl.classList.remove('minimized');
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    winEl.classList.add('active');
};

// On load, enforce consent-gated UI
applyConsentStateOnLoad();
// On resize, keep windows clamped to viewport
window.addEventListener('resize', clampWindowsToViewport);

// Terminal logic
(function initTerminal() {
    const terminalEl = document.getElementById('terminal');
    const outputEl = document.getElementById('terminal-output');
    const inputEl = document.getElementById('terminal-input');
    if (!terminalEl || !outputEl || !inputEl) return;

    const user = 'braian';
    const host = 'swimmingbrain';
    let cwd = '~';
    const history = [];
    let historyIndex = -1;

    function prompt() {
        return `${user}@${host}:${cwd}$`;
    }

    function scrollToBottom() {
        terminalEl.scrollTop = terminalEl.scrollHeight;
    }

    function write(text = '') {
        if (outputEl.textContent) {
            outputEl.textContent += '\n' + text;
        } else {
            outputEl.textContent = text;
        }
        scrollToBottom();
    }

    function handleCommand(line) {
        const trimmed = line.trim();
        if (!trimmed) return;
        write(`${prompt()} ${line}`);
        const [cmd, ...args] = trimmed.split(' ');
        switch (cmd) {
            case 'help':
                write('Available commands: help, clear, neofetch, ls, cat, echo, date, whoami, linkedin');
                break;
            case 'clear':
                outputEl.textContent = '';
                break;
            case 'linkedin':
                write('Opening LinkedIn profile...');
                toggleWindow('linkedin-window');
                break;
            case 'neofetch':
                write(`       _,met$$$$$gg.           ${user}@${host}
    ,g$$$$$$$$$$$$$$$P.        --------------------
  ,g$$P"     """Y$$.".         OS: Ubuntu 24.04 LTS x86_64
 ,$$P'              \`$$$.      Shell: bash 5.1.16
',$$P       ,ggs.     \`$$b:    Uptime: ∞ (always learning)
\`d$$'     ,$P"'   .    $$$     Packages: npm, pip, cargo
 $$P      d$'     ,    $$P     Resolution: 4K (seeing clearly)
 $$:      $$.   -    ,d$$'     DE: GNOME 45
 $$;      Y$b._   _,d$P'       Terminal: gnome-terminal
 Y$$.    \`.\`"Y$$$$P"'          CPU: Neural Network @ 100%
 \`$$b      "-.__               Memory: Unlimited potential
  \`Y$$                         
   \`Y$$.                       Languages: Python, JS, C++, Rust
     \`$$b.                     Frameworks: TensorFlow, React, ROS
       \`Y$$b.                  Tools: Docker, K8s, Git
  \`"Y$b._              Status: Caffeinated
      \`"""             LinkedIn: Connected ✓`);
                break;
            case 'ls':
                if (args.join(' ') === '-la skills/' || args.join(' ') === '-la skills') {
                    write(`drwxr-xr-x  8 ${user} ${user} 4096 Oct 19 14:22 .
drwxr-xr-x 12 ${user} ${user} 4096 Oct 19 14:22 ..
drwxr-xr-x  3 ${user} ${user} 4096 Oct 19 14:22 automation/
drwxr-xr-x  5 ${user} ${user} 4096 Oct 19 14:22 ai-ml/
drwxr-xr-x  4 ${user} ${user} 4096 Oct 19 14:22 electrical-engineering/
drwxr-xr-x  6 ${user} ${user} 4096 Oct 19 14:22 app-development/
drwxr-xr-x  2 ${user} ${user} 4096 Oct 19 14:22 embedded-systems/
drwxr-xr-x  3 ${user} ${user} 4096 Oct 19 14:22 robotics/`);
                } else {
                    write('about  projects  linkedin  skills  docs');
                }
                break;
            case 'cat':
                if (args[0] === '/etc/motd') {
                    write(`╔══════════════════════════════════════════════════╗
║  Welcome to SwimmingBrain Development Environment     ║
║  "Where neurons meet silicon"                         ║
║                                                       ║
║  Current Focus: Industrial AI & Automation            ║
║  Coffee Level: ████████░░ 80%                        ║
║  Cat Status: Purring                                  ║
║  LinkedIn: https://linkedin.com/in/braian-plaku       ║
╚══════════════════════════════════════════════════╝`);
                } else {
                    write(`cat: ${args[0] || ''}: No such file or directory`);
                }
                break;
            case 'echo':
                write(args.join(' '));
                break;
            case 'date':
                write(new Date().toString());
                break;
            case 'whoami':
                write(user);
                break;
            default:
                write(`${cmd}: command not found`);
        }
    }

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const value = inputEl.value;
            if (value.trim()) {
                history.push(value);
            }
            historyIndex = history.length;
            handleCommand(value);
            inputEl.value = '';
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            if (history.length && historyIndex > 0) {
                historyIndex--;
                inputEl.value = history[historyIndex];
                setTimeout(() => inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length), 0);
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (history.length && historyIndex < history.length - 1) {
                historyIndex++;
                inputEl.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                inputEl.value = '';
            }
            e.preventDefault();
        } else if (e.key === 'Escape') {
            inputEl.value = '';
        }
    });

    function focusInput() { inputEl.focus(); }
    terminalEl.addEventListener('mousedown', focusInput);
    document.getElementById('terminal-window').addEventListener('mousedown', focusInput);

    // initial demo content
    write(`${prompt()} neofetch`);
    handleCommand('neofetch');
    write(`${prompt()} ls -la skills/`);
    handleCommand('ls -la skills/');
    write(`${prompt()} cat /etc/motd`);
    handleCommand('cat /etc/motd');

    focusInput();
})();

// Focus input when toggling terminal from dock
const __origToggleWindow = toggleWindow;
toggleWindow = function(windowId) {
    // Call the base toggler
    __origToggleWindow(windowId);
    // If we just showed the terminal, focus input
    const el = document.getElementById(windowId);
    const isVisible = el && getComputedStyle(el).display !== 'none' && !el.classList.contains('minimized');
    if (windowId === 'terminal-window' && isVisible) {
        const inp = document.getElementById('terminal-input');
        if (inp) inp.focus();
    }
};
