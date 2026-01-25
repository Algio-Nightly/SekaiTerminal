const background_options = [
    'assets/background/NeonCity.png',
    'assets/background/benjamin-davies-Oja2ty_9ZLM-unsplash.jpg',
    'assets/background/josh-hild-_TuI8tZHlk4-unsplash.jpg',
    'assets/background/louie-martinez-IocJwyqRv3M-unsplash.jpg',
    'assets/background/simon--O8r5oLosYo-unsplash.jpg',
    'assets/background/su-san-lee-E_eWwM29wfU-unsplash (1).jpg',
    'assets/background/takashi-miyazaki-R_kNb6gZ_xk-unsplash.jpg'
];

class User {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.Health = 100;
        this.Knowledge = 100;
        this.Stamina = 100;
        this.Strength = 10;
        this.Dexterity = 10;
        this.Intelligence = 10;
        this.skillPoints = {
            Health: 0,
            Knowledge: 0,
            Stamina: 0,
            Strength: 0,
            Dexterity: 0,
            Intelligence: 0
        }
    }
    addQuestRewards(rewards) {
        if (!rewards) return;

        this.xp += Number(rewards.xp) || 0;

        if (rewards.skillPoints) {
            this.skillPoints.Health += Number(rewards.skillPoints.Health) || 0;
            this.skillPoints.Knowledge += Number(rewards.skillPoints.Knowledge) || 0;
            this.skillPoints.Stamina += Number(rewards.skillPoints.Stamina) || 0;
            this.skillPoints.Strength += Number(rewards.skillPoints.Strength) || 0;
            this.skillPoints.Dexterity += Number(rewards.skillPoints.Dexterity) || 0;
            this.skillPoints.Intelligence += Number(rewards.skillPoints.Intelligence) || 0;
        }
        this.checkLevelUp();
    }

    checkLevelUp() {
        let requiredXp = this.level * 100;
        let leveledUp = false;

        while (this.xp >= requiredXp) {
            this.xp -= requiredXp;
            this.level++;
            requiredXp = this.level * 100;
            leveledUp = true;
        }

        if (leveledUp) {
            showPopup(`LEVEL UP! You reached Level ${this.level}`);
            // Force UI update immediately if desired, though standard loop might catch it
            // updateDashboardStats(); // updateDashboardStats is global, might need to be careful calling it here if User class is separated later. 
            // For now, simple popup is enough, as next updateDashboardStats call (e.g. from quest completion) will update UI.
            // Actually,quest.js calls displayQuests and user.addQuestRewards, but does it call updateDashboardStats? 
            // Index.html loads script.js which calls updateDashboardStats on load.
            // We should ideally trigger a UI update.
            if (typeof updateDashboardStats === 'function') {
                updateDashboardStats();
            }
        }
    }
}

let UserProfileBuilds = [];
function loadUserProfileBuilds() {
    const data = JSON.parse(localStorage.getItem('UserProfileBuilds')) || [];
    UserProfileBuilds = data.map(userData => {
        const u = new User();
        Object.assign(u, userData);
        return u;
    });
}
loadUserProfileBuilds();
if (UserProfileBuilds.length === 0) {
    UserProfileBuilds.push(new User());
}
let user = UserProfileBuilds[0];

function saveUserProfileBuilds() {
    localStorage.setItem('UserProfileBuilds', JSON.stringify(UserProfileBuilds));
}

function saveUser() {
    saveUserProfileBuilds();
}



function getRelativePath(path) {
    // Check if we are in a subdirectory
    const isSubDir = window.location.pathname.includes('/quests/') ||
        window.location.pathname.includes('/skills/') ||
        window.location.pathname.includes('/inventory/') ||
        window.location.pathname.includes('/settings/');
    return isSubDir ? `../${path}` : path;
}

function changeBackground(image_path) {
    localStorage.setItem('custom_bg', image_path);
    applySavedBackground();
}

function applySavedBackground() {
    const savedBg = localStorage.getItem('custom_bg') || background_options[5]; // Default to susan-lee
    const resolvedPath = getRelativePath(savedBg);
    document.body.style.backgroundImage = `url('${resolvedPath.replace(/'/g, "\\'")}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed"; // extensive fix for scrolling
}

// Apply immediately
applySavedBackground();

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

function updateDashboardStats() {
    // 1. Level & XP
    const nextLevelXp = user.level * 100;
    const xpPercentage = Math.min((user.xp / nextLevelXp) * 100, 100);

    const levelEl = document.getElementById('level');
    const xpEl = document.getElementById('xp');
    const xpBarEl = document.getElementById('xp-bar-fill');

    if (levelEl) levelEl.textContent = user.level;
    if (xpEl) xpEl.textContent = user.xp;
    if (xpBarEl) xpBarEl.style.width = `${xpPercentage}%`;

    // 2. Stats & SP
    const stats = ['Health', 'Knowledge', 'Stamina', 'Strength', 'Dexterity', 'Intelligence'];
    const statIds = ['health', 'knowledge', 'stamina', 'strength', 'dexterity', 'intelligence'];

    stats.forEach((stat, index) => {
        const id = statIds[index];
        const val = user[stat];
        const spVal = user.skillPoints[stat];

        // Update Stat Value
        const valEl = document.getElementById(id);
        if (valEl) valEl.textContent = val;

        // Update SP Text
        const spTextEl = document.getElementById(`sp-${id}`);
        if (spTextEl) spTextEl.textContent = spVal;

        // Update SP Bar (assuming max 50 SP for progress visualization)
        const spBarEl = document.getElementById(`bar-sp-${id}`);
        if (spBarEl) {
            const spPct = Math.min((spVal / 50) * 100, 100);
            spBarEl.style.width = `${spPct}%`;
        }
    });
}

// Initial update
updateDashboardStats();

function renderActiveQuests() {
    const listContainer = document.getElementById('active-quests-list');
    if (!listContainer) return;

    const quests = JSON.parse(localStorage.getItem('Quests')) || [];
    listContainer.innerHTML = '';

    if (quests.length === 0) {
        listContainer.innerHTML = `<div style="padding: 10px; color: var(--text-muted); text-align: center;">No active quests.</div>`;
        return;
    }

    // Show top 3 quests
    quests.slice(0, 3).forEach(quest => {
        // Determine Icon based on First Skill Point Reward
        let iconClass = 'fa-scroll';
        let bgClass = 'accent-blue-bg'; // Default

        if (quest.rewards && quest.rewards.skillPoints) {
            const sp = quest.rewards.skillPoints;
            // Check keys with value > 0
            if (sp.Strength > 0) { iconClass = 'fa-dumbbell'; bgClass = 'accent-orange-bg'; }
            else if (sp.Knowledge > 0) { iconClass = 'fa-book'; bgClass = 'accent-blue-bg'; }
            else if (sp.Dexterity > 0) { iconClass = 'fa-wind'; bgClass = 'accent-green-bg'; }
            else if (sp.Intelligence > 0) { iconClass = 'fa-brain'; bgClass = 'accent-purple-bg'; }
            else if (sp.Health > 0) { iconClass = 'fa-heart'; bgClass = 'accent-red-bg'; }
            else if (sp.Stamina > 0) { iconClass = 'fa-person-running'; bgClass = 'accent-gold-bg'; }
        }

        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-icon ${bgClass}" style="color: white;">
                 <i class="fa-solid ${iconClass}"></i>
            </div>
             <div class="list-item-content">
                 <h4>${quest.title}</h4>
                 <p>${quest.description || 'No description'}</p>
             </div>
             <span class="btn btn-glass" style="font-size: 0.7rem; padding: 5px 10px;">Active</span>
        `;
        listContainer.appendChild(item);
    });
}
renderActiveQuests();