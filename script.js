background_options = [
    'assets/background/su-san-lee-E_eWwM29wfU-unsplash (1).jpg',
    'assets/background/benjamin-davies-Oja2ty_9ZLM-unsplash.jpg',
    'assets/background/louie-martinez-IocJwyqRv3M-unsplash.jpg',
    'assets/background/louie-martinez-IocJwyqRv3M-unsplash.jpg',
    'assets/background/takashi-miyazaki-R_kNb6gZ_xk-unsplash.jpg'
]

function changeBackground(image_url) {
    document.body.style.background = image_url;
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update active button state
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        // Simple check based on icon class to determine which button corresponds to the theme
        if (theme === 'dark' && btn.querySelector('.fa-moon')) {
            btn.classList.add('active');
        } else if (theme === 'light' && btn.querySelector('.fa-sun')) {
            btn.classList.add('active');
        }
    });

    // Save preference
    localStorage.setItem('theme', theme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);


// Skill Tree Navigation
// Skill Tree Navigation
document.addEventListener('DOMContentLoaded', () => {
    const skillTreeLink = document.querySelector('.skill_tree');
    if (skillTreeLink) {
        skillTreeLink.addEventListener('click', () => {
            window.location.href = 'skills/skills.html';
        });
    }

    // Initialize Popup System
    ensurePopupExists();
});

/* --- Utility: Popup Notification --- */
function ensurePopupExists() {
    if (!document.getElementById('popup-container')) {
        const popupContainer = document.createElement('div');
        popupContainer.id = 'popup-container';
        // HTML Structure
        popupContainer.innerHTML = `
            <div class="popup-content">
                <i class="fa-solid fa-info-circle popup-icon"></i>
                <span id="popup-text">System Notification</span>
            </div>
        `;
        document.body.appendChild(popupContainer);
    }
}

let popupTimeout;

function showPopup(text, duration = 3000) {
    ensurePopupExists();

    const container = document.getElementById('popup-container');
    const textSpan = document.getElementById('popup-text');

    if (container && textSpan) {
        textSpan.textContent = text;
        container.classList.add('show');

        // Clear existing timeout if showing a new one immediately
        if (popupTimeout) clearTimeout(popupTimeout);

        popupTimeout = setTimeout(() => {
            container.classList.remove('show');
        }, duration);
    }
}

